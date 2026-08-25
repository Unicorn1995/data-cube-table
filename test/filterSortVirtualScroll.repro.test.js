/**
 * @vitest-environment happy-dom
 *
 * 回归用例：github #80 筛选表头 + 虚拟滚动状态残留。
 * 根因：setFilter / setSorter / onColumnSort / resetSorter 修改 dataSourceCopy 后
 * 未重算虚拟滚动状态（virtualScroll.startIndex/endIndex 残留旧值）：
 * 1. 数据少于 pageSize 期间（virtual_on=false），updateVirtualScrollY 会把 endIndex 重置为 0；
 *    之后数据变多（重置筛选/放宽筛选）时无人重算，slice(startIndex, 0+1) 只渲染 1 行 →
 *    「重置筛选后只有一条数据，需要滚动才可以显示完整」。
 * 2. 滚动后筛选（数据仍大于 pageSize）时 startIndex 残留超出新数据长度，slice 为空 →
 *    视口空白/行数骤减 →「筛选情况下排序吃掉数据，越来越少」。
 * 3. 残留 scrollHeight 使自定义滚动条（scrollbar）thumb 高度/拖动换算失真 →
 *    「拖动滚动条不行，手势滚动可以」（wheel 路径每次重算 scrollHeight，可自愈）。
 */
import { mount } from '@vue/test-utils';
import { StkTable } from '@/StkTable';
import { expect, test } from 'vitest';

const ROW_HEIGHT = 28;
const HEADER_HEIGHT = 40;

const columns = [
    { title: 'id', dataIndex: 'id', width: 100 },
    { title: 'name', dataIndex: 'name', width: 120, sorter: true },
    { title: 'value', dataIndex: 'value' },
];

const data = new Array(200).fill(0).map((_, i) => ({ id: i, name: `name-${i % 20}`, value: i }));

function nextFrame() {
    return new Promise(resolve => setTimeout(resolve, 35));
}

async function mockContainerHeight(wrapper, height) {
    Object.defineProperty(wrapper.element, 'clientHeight', { configurable: true, value: height });
    wrapper.vm.initVirtualScrollY();
    await wrapper.vm.$nextTick();
    return Math.ceil(height / ROW_HEIGHT) - Math.floor(HEADER_HEIGHT / ROW_HEIGHT);
}

function getRowCount(wrapper) {
    return wrapper.findAll('tbody.stk-tbody-main > tr[data-row-key]').length;
}

/** 模拟浏览器 clamp 后触发的 scroll 事件（真实浏览器在内容高度收缩时自动 clamp scrollTop 并派发 scroll） */
async function dispatchClampedScroll(wrapper, top) {
    const container = wrapper.element;
    container.scrollTop = top;
    container.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();
}

/** 等待 nextTick + rAF（scroll 事件的 rAF 回调、onDataSourceChange 的 nextTick） */
async function waitTick(wrapper) {
    await nextFrame();
    await wrapper.vm.$nextTick();
}

test('#80-1 筛选到 1 条后重置筛选：应恢复整页数据而不是只有 1 条', async () => {
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data },
    });
    const pageSize = await mockContainerHeight(wrapper, 300); // pageSize = 10
    expect(pageSize).toBe(10);

    // 筛选前滚到中部，制造 startIndex/endIndex 非零状态
    wrapper.element.scrollTop = 5 * ROW_HEIGHT;
    wrapper.element.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();
    expect(getRowCount(wrapper)).toBeGreaterThan(1);

    // 筛选 value = 5 → 只剩 1 条（value 唯一）
    wrapper.vm.setFilter({ value: { value: [5] } });
    await waitTick(wrapper);
    expect(getRowCount(wrapper)).toBe(1);

    // 真实浏览器：内容高度收缩 → clamp scrollTop 到 0 → 派发 scroll → endIndex 被重置
    await dispatchClampedScroll(wrapper, 0);

    // 重置筛选：数据恢复 200 条，应渲染 pageSize 级别行数
    wrapper.vm.setFilter(null);
    await waitTick(wrapper);
    const count = getRowCount(wrapper);
    expect(count, '重置筛选后应恢复整页渲染').toBeGreaterThanOrEqual(pageSize);
    wrapper.unmount();
});

test('#80-2 筛选 1 条 + 排序 + 放宽筛选：放宽后不应只剩 1 条数据', async () => {
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data },
    });
    const pageSize = await mockContainerHeight(wrapper, 300);

    // 先滚动，制造 clamp scroll 重置 endIndex 的条件（scrollTop>0 → 数据变少时浏览器 clamp 到 0）
    wrapper.element.scrollTop = 5 * ROW_HEIGHT;
    wrapper.element.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();

    wrapper.vm.setFilter({ value: { value: [5] } });
    await waitTick(wrapper);
    expect(getRowCount(wrapper)).toBe(1);
    await dispatchClampedScroll(wrapper, 0);

    // 筛选状态下排序（本地排序）
    wrapper.vm.setSorter('name', 'asc');
    await waitTick(wrapper);

    // 放宽筛选到 15 条（> pageSize），不应被残留 endIndex=0 吃掉
    wrapper.vm.setFilter({ value: { value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] } });
    await waitTick(wrapper);
    const count = getRowCount(wrapper);
    expect(count, '放宽筛选后应渲染整页数据').toBeGreaterThanOrEqual(pageSize);
    wrapper.unmount();
});

test('#80-3 滚动后筛选（数据仍大于 pageSize）：视口不应空白', async () => {
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data },
    });
    const pageSize = await mockContainerHeight(wrapper, 300);

    // 滚动到深处：startIndex=100, endIndex=110
    wrapper.element.scrollTop = 100 * ROW_HEIGHT;
    wrapper.element.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();

    // 筛选 name 4 个值 → 40 条（> pageSize），但残留 startIndex=100 超出新数据长度，slice(100,111) 为空 → 视口空白
    wrapper.vm.setFilter({ name: { value: ['name-1', 'name-2', 'name-3', 'name-4'] } });
    await waitTick(wrapper);
    // 40 条 > pageSize，应渲染 pageSize 级别（修复后由 initVirtualScrollY 重算窗口）
    expect(getRowCount(wrapper), '筛选后不应因 startIndex 残留而空白').toBeGreaterThanOrEqual(pageSize);
    wrapper.unmount();
});

test('#80-4 滚动到深处后筛选+排序：不应吃掉全部数据', async () => {
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data },
    });
    const pageSize = await mockContainerHeight(wrapper, 300);

    // 滚动到深处：startIndex=100, endIndex=110
    wrapper.element.scrollTop = 100 * ROW_HEIGHT;
    wrapper.element.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();
    expect(getRowCount(wrapper)).toBeGreaterThanOrEqual(pageSize);

    // 筛选 name 3 个值 → 30 条（> pageSize）：残留 startIndex=100 时 slice(100,111) 为空
    wrapper.vm.setFilter({ name: { value: ['name-1', 'name-2', 'name-3'] } });
    await waitTick(wrapper);
    expect(getRowCount(wrapper), '筛选后不应因 startIndex 残留而空白').toBeGreaterThanOrEqual(pageSize);

    // 筛选状态下排序：数据顺序重排，行数不应骤减
    wrapper.vm.setSorter('name', 'desc');
    await waitTick(wrapper);
    const after = getRowCount(wrapper);
    expect(after, '排序后渲染行数不应少于筛选后的整页行数').toBeGreaterThanOrEqual(pageSize);
    wrapper.unmount();
});
