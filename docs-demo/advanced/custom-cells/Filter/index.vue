<template>
    <StkTable :columns="columns" :data-source="dataSource" row-key="id" />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import StkTable from '../../../StkTable.vue';
import { createFilter, StkTableColumn } from 'stk-table-vue';
import { useI18n } from '../../../hooks/useI18n/index';

const { t } = useI18n();

const { Filter, filterStatus } = createFilter();

interface RowData {
    id: number;
    name: string;
    city: string;
    department: string;
}

const rawData = ref<RowData[]>([
    { id: 1, name: t('zhangSan'), city: t('beijing'), department: t('techDept') },
    { id: 2, name: t('liSi'), city: t('shanghai'), department: t('productDept') },
    { id: 3, name: t('wangWu'), city: t('beijing'), department: t('techDept') },
    { id: 4, name: t('zhaoLiu'), city: t('guangzhou'), department: t('opsDept') },
    { id: 5, name: t('sunQi'), city: t('shanghai'), department: t('techDept') },
    { id: 6, name: t('zhouBa'), city: t('shenzhen'), department: t('productDept') },
]);

const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
        title: t('name'),
        dataIndex: 'name',
        customHeaderCell: Filter({
            options: [
                { label: t('zhangSan'), value: t('zhangSan') },
                { label: t('liSi'), value: t('liSi') },
                { label: t('wangWu'), value: t('wangWu') },
            ],
        }),
    },
    {
        title: t('city'),
        dataIndex: 'city',
        customHeaderCell: Filter({
            autoOptions: true,
        }),
    },
    {
        title: t('department'),
        dataIndex: 'department',
        customHeaderCell: Filter({
            options: [
                { label: t('techDept'), value: t('techDept') },
                { label: t('productDept'), value: t('productDept') },
                { label: t('opsDept'), value: t('opsDept') },
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
