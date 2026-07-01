<template>
    <StkTable
        cell-hover
        cell-active
        :selected-cell-revokable="false"
        :row-active="false"
        :row-hover="false"
        :columns="columns"
        :data-source="dataSource"
        row-key="id"
    />
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import StkTable from '../../../StkTable.vue';
import { createEditableCell, StkTableColumn } from 'stk-table-vue';
import { useI18n } from '../../../hooks/useI18n/index';

const { t } = useI18n();

const { EditableCell } = createEditableCell({
    onChange: (newValue, row, dataIndex) => {
        console.log(t('valueChange'), { newValue, row, dataIndex });
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
    { title: t('name'), dataIndex: 'name', width: 100, customCell: EditableCell() },
    { title: t('age'), dataIndex: 'age', width: 80, customCell: EditableCell() },
    { title: t('address'), dataIndex: 'address', customCell: EditableCell() },
];

const dataSource = ref<RowData[]>([
    { id: 1, name: t('zhangSan'), age: 28, address: t('haidian') },
    { id: 2, name: t('liSi'), age: 32, address: t('pudong') },
    { id: 3, name: t('wangWu'), age: 25, address: t('tianhe') },
]);
</script>
