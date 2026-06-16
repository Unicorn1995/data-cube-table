<script setup lang="ts">
import { layout, prepare } from '@chenglou/pretext';
import mockjs from 'mockjs';
import { onMounted, useTemplateRef } from 'vue';
import { StkTableColumn } from '@/StkTable/index';
import StkTable from '../../../StkTable.vue';
import type { DataType } from './types';
import { getIsZH } from '../../../hooks/getIsZH';

const isZH = getIsZH();
const stkTableRef = useTemplateRef('stkTableRef');

const columns: StkTableColumn<DataType>[] = [
    { dataIndex: 'id', title: 'ID', width: 26, align: 'center' },
    { dataIndex: 'content', title: 'Content', width: 200 },
    { dataIndex: 'date', title: 'Date', width: 70, align: 'center' },
];

const data = new Array(100).fill(0).map((_, i) => ({
    id: i,
    content: isZH ? mockjs.Random.cparagraph(1, 8) : mockjs.Random.paragraph(1, 3),
    date: isZH ? mockjs.Random.datetime('yyyy-MM-dd') : mockjs.Random.datetime('MM/dd/yyyy'),
}));

onMounted(() => {
    preCalculateAllRowHeights();
});

/**
 * 使用 pretext 计算文本在指定宽度下的高度
 */
function calculateHeightWithPretext(text: string, width: number): number {
    const prepared = prepare(text, '14px system-ui');
    const { height } = layout(prepared, width, 20);
    return Math.max(height + 16, 36); // 加上 cell padding
}

/**
 * 预计算所有行的行高
 */
function preCalculateAllRowHeights() {
    // 通过 DOM 获取第一个单元格的实际宽度
    const firstCell = document.querySelector(
        '.pretext-table [data-col-key="content"] .table-cell-wrapper',
    );
    const contentColumnWidth = firstCell ? firstCell.clientWidth : 184;
    data.forEach(row => {
        const height = calculateHeightWithPretext(row.content, contentColumnWidth);
        stkTableRef.value?.setAutoHeight(row.id, height);
    });
}

function autoResize() {
    preCalculateAllRowHeights();
}
</script>

<template>
    <StkTable
        ref="stkTableRef"
        class="pretext-table"
        row-key="id"
        style="height: 400px"
        stripe
        virtual
        auto-row-height
        :row-height="50"
        :columns="columns"
        :data-source="data"
        :auto-resize="autoResize"
    ></StkTable>
</template>
<style scoped>
:deep(.v-head) {
    background-color: #333;
    font-weight: bold;
}

.stk-table {
    line-height: 20px;
}
</style>
