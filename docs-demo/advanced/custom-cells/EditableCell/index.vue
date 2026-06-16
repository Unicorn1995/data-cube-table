<template>
    <StkTable :columns="columns" :data-source="dataSource" row-key="id" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import StkTable from '../../../StkTable.vue';
import { createEditableCell, StkTableColumn } from 'stk-table-vue';

const { EditableCell } = createEditableCell({
    onChange: (newValue, row, dataIndex) => {
        console.log('值变更:', { newValue, row, dataIndex });
    },
});

interface RowData {
    id: number;
    name: string;
    age: number;
    address: string;
}

const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name', width: 100, customCell: EditableCell() },
    { title: '年龄', dataIndex: 'age', width: 80, customCell: EditableCell() },
    { title: '地址', dataIndex: 'address', customCell: EditableCell() },
];

const dataSource = ref<RowData[]>([
    { id: 1, name: '张三', age: 28, address: '北京市海淀区' },
    { id: 2, name: '李四', age: 32, address: '上海市浦东新区' },
    { id: 3, name: '王五', age: 25, address: '广州市天河区' },
]);
</script>
