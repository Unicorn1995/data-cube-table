<script setup lang="ts">
import { ref } from 'vue';
import StkTable from '../../StkTable.vue';
import CheckItem from '../../components/CheckItem.vue';
import { StkTableColumn } from '../../../src/StkTable/index';
import { useI18n } from '../../hooks/useI18n';

const { t } = useI18n();
const virtual = ref(true);
const columns: StkTableColumn<any>[] = [
    {
        dataIndex: 'Basic',
        label: t('basic'),
        children: [
            { dataIndex: 'id', label: t('id'), width: 100 },
            {
                dataIndex: 'lv2',
                label: t('lv2'),
                width: 100,
                children: [
                    { dataIndex: 'lv2_1', label: t('lv2_1'), width: 100 },
                    { dataIndex: 'lv2_2', label: t('lv2_2'), width: 100 },
                ],
            },
        ],
    },
    {
        dataIndex: 'age',
        label: t('age'),
        width: '50px',
        children: [
            { dataIndex: 'id3', label: t('id'), width: 50 },
            {
                dataIndex: 'lv5',
                label: t('lv2'),
                width: 100,
            },
        ],
    },
    { dataIndex: 'email', label: t('email'), width: '130px' },
    {
        dataIndex: 'other',
        label: t('other'),
        children: new Array(4).fill(0).map((it, i) => {
            return {
                dataIndex: 'other' + i,
                label: t('other') + ' ' + i,
                width: 100,
            };
        }),
    },
    {
        dataIndex: 'right',
        label: t('right'),
        children: [
            { dataIndex: 'right-1', label: t('right1'), width: 50 },
            { dataIndex: 'right-2', label: t('right2'), width: 100 },
        ],
    },
];
const dataSource = new Array(50).fill(0).map((it, i) => {
    return {
        id: i,
        lv2_1: 'lv2.1',
        lv2_2: 'lv2.2',
        age: i,
        email: i + '@email.com',
    };
});
</script>
<template>
    <CheckItem v-model="virtual" text="virtual"></CheckItem>
    <StkTable
        style="height: 200px"
        row-key="id"
        fixed-col-shadow
        :virtual="virtual"
        :columns="columns"
        :data-source="dataSource"
    >
    </StkTable>
</template>
