/**
 * @vitest-environment happy-dom
 *
 * 回归用例：静默 scrollTop/scrollLeft 优化。
 * 滚动窗口（startIndex/endIndex）未变的滚动帧不再触发组件重渲染，
 * 但外部可见行为必须保持不变：scroll 事件照常触发且载荷正确、
 * experimental.scrollY 模式下 translateY 仍随滚动更新。
 */
import { mount } from '@vue/test-utils';
import { StkTable } from '@/StkTable';
import { expect, test, vi } from 'vitest';

const ROW_HEIGHT = 28;

function nextFrame() {
    return new Promise(resolve => setTimeout(resolve, 35));
}

async function scrollYTo(wrapper, top) {
    const container = wrapper.element;
    container.scrollTop = top;
    container.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await wrapper.vm.$nextTick();
}

function mockContainerHeight(wrapper, height) {
    Object.defineProperty(wrapper.element, 'clientHeight', { configurable: true, value: height });
    wrapper.vm.initVirtualScrollY();
}

/** 包裹组件 render 函数统计重渲染次数 */
function countRenders(wrapper) {
    const instance = wrapper.vm.$;
    const original = instance.render;
    let count = 0;
    instance.render = function (...args) {
        count++;
        return original.apply(this, args);
    };
    return () => count;
}

const columns = [
    { title: 'id', dataIndex: 'id', width: 100 },
    { title: 'name', dataIndex: 'name', width: 120 },
    { title: 'value', dataIndex: 'value' },
];

const data = new Array(200).fill(0).map((_, i) => ({ id: i, name: `name-${i}`, value: `value-${i}` }));

test('窗内微滚动（窗口未变）：不触发组件重渲染，scroll 事件与载荷不受影响', async () => {
    const onScroll = vi.fn();
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data, onScroll },
    });
    mockContainerHeight(wrapper, 300); // pageSize = 10

    await scrollYTo(wrapper, 5 * ROW_HEIGHT); // startIndex = 5
    const getRenderCount = countRenders(wrapper);
    onScroll.mockClear();

    // 不足一行的微滚：滚动窗口不变
    await scrollYTo(wrapper, 5 * ROW_HEIGHT + 10);

    expect(onScroll).toHaveBeenCalled();
    const payload = onScroll.mock.calls.at(-1)[1];
    expect(payload.startIndex).toBe(5);
    // 窗口未变：scrollTop 静默写入，组件不应重渲染
    expect(getRenderCount()).toBe(0);
});

test('跨行滚动（窗口变化）：组件重渲染正常发生（计数器有效性金丝雀）', async () => {
    const wrapper = mount(StkTable, {
        props: { rowKey: 'id', virtual: true, columns, dataSource: data },
    });
    mockContainerHeight(wrapper, 300);

    await scrollYTo(wrapper, 5 * ROW_HEIGHT);
    const getRenderCount = countRenders(wrapper);

    await scrollYTo(wrapper, 6 * ROW_HEIGHT);

    // 窗口变化（startIndex 5 → 6）：重渲染必须发生
    expect(getRenderCount()).toBeGreaterThan(0);
});

test('experimental.scrollY 模式：translateY 仍随滚动响应更新', async () => {
    const wrapper = mount(StkTable, {
        props: {
            rowKey: 'id',
            virtual: true,
            columns,
            dataSource: data,
            scrollbar: true,
            experimental: { scrollY: true },
        },
    });
    mockContainerHeight(wrapper, 300);

    wrapper.vm.scrollTo(2.5 * ROW_HEIGHT); // translateY = -(70 % 28) = -14
    await nextFrame();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('tbody.stk-tbody-main').attributes('style')).toContain('translateY(-14px)');

    wrapper.vm.scrollTo(3 * ROW_HEIGHT); // 84 % 28 = 0（-0 插值为 0）
    await nextFrame();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('tbody.stk-tbody-main').attributes('style')).toContain('translateY(0px)');
});
