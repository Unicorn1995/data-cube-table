<template>
    <div class="page">
        <h3>子元素失焦导致键盘导航中断 - 复现 Demo</h3>
        <div class="tips">
            <p><strong>复现场景：</strong></p>
            <ol>
                <li>先点击表格任意单元格，确认使用方向键可以移动选区（keydown 正常）。</li>
                <li>点击 "姓名" 列的 input 或 "选择" 列的 checkbox，输入框获得焦点。</li>
                <li>按 <code>Esc</code> 或 <code>Tab</code> 使其失焦（或点击页面空白处），焦点回退到 <code>document.body</code>。</li>
                <li>此时再按方向键 / Ctrl+C，会发现 table 容器的 keydown 已经收不到事件，键盘导航中断。</li>
                <li>虚拟滚动触发 DOM 重建也会导致当前聚焦的子元素被销毁，等同于第 3 步。</li>
            </ol>
            <p>
                <strong>当前 activeElement：</strong><code>{{ activeElInfo }}</code>
            </p>
            <p>
                <strong>容器是否包含焦点：</strong><code>{{ containsFocus }}</code>
            </p>
            <p>
                <strong>表格容器 keydown 触发次数：</strong><code>{{ containerKeydownCount }}</code>
            </p>
            <p>
                <strong>document.body keydown 触发次数：</strong><code>{{ bodyKeydownCount }}</code>
            </p>
            <div class="btns">
                <button @click="manualFocus">手动把焦点还给表格容器</button>
                <button @click="resetCounter">重置计数</button>
                <button @click="toggleData">切换数据（模拟虚拟滚动 DOM 重建）</button>
            </div>
        </div>

        <StkTable
            ref="tableRef"
            row-key="id"
            stripe
            virtual
            :row-height="36"
            :data-source="rows"
            :columns="cols"
            :area-selection="areaSelectionConfig"
            style="height: 360px"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, h, nextTick } from 'vue';
import { StkTable, registerFeature, useAreaSelection } from '../src/StkTable';
import type { StkTableColumn } from '../src/StkTable/types';

registerFeature([useAreaSelection]);

const areaSelectionConfig = {
    enabled: true,
    keyboard: true,
    ctrl: true,
    shift: true,
    highlight: { cell: true, row: false },
} as any;

type Row = { id: number; name: string; age: number; selected: boolean; city: string; city1?: string; city2?: string };

const rowsA: Row[] = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1,
    name: `User${i + 1}`,
    age: 20 + (i % 30),
    selected: false,
    city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'][i % 4],
}));
const rowsB: Row[] = Array.from({ length: 200 }, (_, i) => ({
    id: i + 1 + 1000,
    name: `Guest${i + 1}`,
    age: 18 + (i % 40),
    selected: false,
    city: ['Chengdu', 'Hangzhou', "Xi'an", 'Wuhan'][i % 4],
}));
const rows = ref<Row[]>(rowsA);
const useA = ref(true);

function toggleData() {
    useA.value = !useA.value;
    rows.value = useA.value ? rowsA : rowsB;
}

// 姓名列：input 编辑
const NameInputCell = {
    name: 'NameInputCell',
    props: {
        row: { type: Object, required: true },
        col: { type: Object, required: true },
        cellValue: { type: [String, Number], default: '' },
    },
    setup(props: any) {
        return () =>
            h('input', {
                class: 'cell-input',
                value: props.cellValue,
                // 关键：使用原生 input，不提供任何 blur 守护
                onInput: (e: Event) => {
                    props.row[props.col.dataIndex] = (e.target as HTMLInputElement).value;
                },
            });
    },
};

// 选择列：checkbox
const CheckboxCell = {
    name: 'CheckboxCell',
    props: {
        row: { type: Object, required: true },
        col: { type: Object, required: true },
        cellValue: { type: Boolean, default: false },
    },
    setup(props: any) {
        return () =>
            h('input', {
                type: 'checkbox',
                checked: props.cellValue,
                onChange: (e: Event) => {
                    props.row[props.col.dataIndex] = (e.target as HTMLInputElement).checked;
                },
            });
    },
};

const cols: StkTableColumn<Row>[] = [
    { title: 'ID', dataIndex: 'id', fixed: 'left', width: 80 },
    { title: '姓名 (input)', dataIndex: 'name', width: 180, customCell: NameInputCell as any },
    { title: '选择 (checkbox)', dataIndex: 'selected', width: 140, customCell: CheckboxCell as any },
    { title: 'Age', dataIndex: 'age', width: 100 },
    { title: 'City', dataIndex: 'city', width: 140 },
    { title: 'City2', dataIndex: 'city1', width: 140 },
    { title: 'City3', dataIndex: 'city2', width: 140 },
];

const tableRef = ref<InstanceType<typeof StkTable> | null>(null);

const activeElInfo = ref('document.body');
const containsFocus = ref(false);
const containerKeydownCount = ref(0);
const bodyKeydownCount = ref(0);

let containerEl: HTMLElement | null = null;

function describeEl(el: Element | null) {
    if (!el) return 'null';
    if (el === document.body) return 'document.body';
    const tag = el.tagName.toLowerCase();
    const cls = (el as HTMLElement).className || '';
    const role = el.getAttribute('role') || '';
    return `<${tag}${cls ? ' class="' + cls + '"' : ''}${role ? ' role="' + role + '"' : ''}>`;
}

function updateActiveEl() {
    activeElInfo.value = describeEl(document.activeElement);
    containsFocus.value = !!(containerEl && document.activeElement && containerEl.contains(document.activeElement));
}

function onFocusIn() {
    updateActiveEl();
}
function onFocusOut() {
    // focusout 事件早于焦点切换完成，因此异步读取 activeElement
    requestAnimationFrame(updateActiveEl);
}

// 表格容器 keydown 计数（冒泡阶段）
function onContainerKeydown() {
    containerKeydownCount.value++;
}
// document.body keydown 计数，用于对比
function onBodyKeydown() {
    bodyKeydownCount.value++;
}

function manualFocus() {
    containerEl?.focus();
    updateActiveEl();
}

function resetCounter() {
    containerKeydownCount.value = 0;
    bodyKeydownCount.value = 0;
}

onMounted(async () => {
    await nextTick();
    // 表格根 DOM（即监听 keydown / 带 tabindex 的容器）
    const rootEl = (tableRef.value as any)?.$el as HTMLElement | undefined;
    containerEl = rootEl?.querySelector<HTMLElement>('.stk-table-container') || rootEl || null;
    if (containerEl) {
        containerEl.addEventListener('keydown', onContainerKeydown);
        containerEl.addEventListener('focusin', onFocusIn);
        containerEl.addEventListener('focusout', onFocusOut);
    }
    document.body.addEventListener('keydown', onBodyKeydown);
    document.addEventListener('focusin', updateActiveEl);
    updateActiveEl();
});

onBeforeUnmount(() => {
    if (containerEl) {
        containerEl.removeEventListener('keydown', onContainerKeydown);
        containerEl.removeEventListener('focusin', onFocusIn);
        containerEl.removeEventListener('focusout', onFocusOut);
    }
    document.body.removeEventListener('keydown', onBodyKeydown);
    document.removeEventListener('focusin', updateActiveEl);
});
</script>

<style scoped>
.page {
    padding: 16px;
    width: 1000px;
}
.tips {
    background: #fffbe6;
    border: 1px solid #ffe58f;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    margin-bottom: 12px;
}
.tips ol {
    margin: 4px 0 8px 20px;
    padding: 0;
}
.tips code {
    background: #f5f5f5;
    padding: 0 4px;
    border-radius: 2px;
}
.btns {
    margin-top: 8px;
    display: flex;
    gap: 8px;
}
.btns button {
    padding: 4px 10px;
    cursor: pointer;
}
.cell-input {
    width: 100%;
    box-sizing: border-box;
    padding: 2px 6px;
    outline: none;
    border: 1px solid #ddd;
    border-radius: 2px;
}
</style>
