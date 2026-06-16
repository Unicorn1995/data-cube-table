<template>
    <StkTable :columns="columns" :data-source="dataSource" row-key="id" />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import StkTable from '../../../StkTable.vue';
import { createFilter, StkTableColumn } from 'stk-table-vue';

const { Filter, filterStatus } = createFilter();

interface RowData {
    id: number;
    name: string;
    city: string;
    department: string;
}

const rawData = ref<RowData[]>([
    { id: 1, name: '张三', city: '北京', department: '技术部' },
    { id: 2, name: '李四', city: '上海', department: '产品部' },
    { id: 3, name: '王五', city: '北京', department: '技术部' },
    { id: 4, name: '赵六', city: '广州', department: '运营部' },
    { id: 5, name: '孙七', city: '上海', department: '技术部' },
    { id: 6, name: '周八', city: '深圳', department: '产品部' },
]);

const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
        title: '姓名',
        dataIndex: 'name',
        customHeaderCell: Filter({
            options: [
                { label: '张三', value: '张三' },
                { label: '李四', value: '李四' },
                { label: '王五', value: '王五' },
            ],
        }),
    },
    {
        title: '城市',
        dataIndex: 'city',
        customHeaderCell: Filter({
            autoOptions: true, // 自动从数据提取选项
        }),
    },
    {
        title: '部门',
        dataIndex: 'department',
        customHeaderCell: Filter({
            options: [
                { label: '技术部', value: '技术部' },
                { label: '产品部', value: '产品部' },
                { label: '运营部', value: '运营部' },
            ],
        }),
    },
];

// 根据筛选状态过滤数据
const dataSource = computed(() => {
    const filters = filterStatus.value;
    const filterKeys = Object.keys(filters);
    if (filterKeys.length === 0) return rawData.value;

    return rawData.value.filter(row => {
        for (const key of filterKeys) {
            const filter = filters[key];
            if (filter.value.length > 0) {
                const cellValue = row[key as keyof RowData];
                if (filter.filter) {
                    if (!filter.filter({ row, cellValue, filterValues: filter.value })) {
                        return false;
                    }
                } else {
                    if (!filter.value.includes(cellValue)) {
                        return false;
                    }
                }
            }
        }
        return true;
    });
});
</script>
