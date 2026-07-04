<template>
    <StkTable :columns="columns" :data-source="dataSource" row-key="id" />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
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

const dataSource = ref<RowData[]>([
    { id: 1, name: t('zhangSan'), city: t('beijing'), department: t('techDept') },
    { id: 2, name: t('liSi'), city: t('shanghai'), department: t('productDept') },
    { id: 3, name: t('wangWu'), city: t('beijing'), department: t('techDept') },
    { id: 4, name: t('zhaoLiu'), city: t('guangzhou'), department: t('opsDept') },
    { id: 5, name: t('sunQi'), city: t('shanghai'), department: t('techDept') },
    { id: 6, name: t('zhouBa'), city: t('shenzhen'), department: t('productDept') },
]);

const NameFilter = Filter({
    options: [
        { label: t('zhangSan'), value: t('zhangSan') },
        { label: t('liSi'), value: t('liSi') },
        { label: t('wangWu'), value: t('wangWu') },
    ],
});
const CityFilter = Filter({ autoOptions: true });
const DepartmentFilter = Filter({
    options: [
        { label: t('techDept'), value: t('techDept') },
        { label: t('productDept'), value: t('productDept') },
        { label: t('opsDept'), value: t('opsDept') },
    ],
});

const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('name'), dataIndex: 'name', customHeaderCell: NameFilter },
    { title: t('city'), dataIndex: 'city', customHeaderCell: CityFilter },
    { title: t('department'), dataIndex: 'department', customHeaderCell: DepartmentFilter },
];
</script>
