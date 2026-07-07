<script setup lang="ts">
import { computed, ref } from 'vue';
import StkTable from '../../StkTable.vue';
import CheckItem from '../../components/CheckItem.vue';
import { StkTableColumn } from '../../../src/StkTable/index';
import { useI18n } from '../../hooks/useI18n/index.js';

const { t } = useI18n();
const virtual = ref(true);
const virtualX = ref(true);
const fixedLeft = ref(true);
const fixedRight = ref(true);

const columns = computed(() => {
    return [
        {
            dataIndex: 'Basic',
            label: t('basic'),
            fixed: fixedLeft.value ? 'left' : null,
            children: [
                {
                    dataIndex: 'id',
                    label: t('id'),
                    width: 100,
                    fixed: fixedLeft.value ? 'left' : null,
                },
                {
                    dataIndex: 'lv2',
                    label: t('lv2'),
                    width: 100,
                    fixed: fixedLeft.value ? 'left' : null,
                    children: [
                        {
                            dataIndex: 'lv2_1',
                            label: t('lv2_1'),
                            width: 100,
                            fixed: fixedLeft.value ? 'left' : null,
                        },
                        {
                            dataIndex: 'lv2_2',
                            label: t('lv2_2'),
                            width: 100,
                            fixed: fixedLeft.value ? 'left' : null,
                        },
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
            children: new Array(10).fill(0).map((it, i) => {
                return {
                    dataIndex: 'other' + i,
                    label: t('other') + ' ' + i,
                    width: 100,
                };
            }),
        },
        ...new Array(5).fill(0).map((it, i) => {
            return {
                dataIndex: 'lv1' + i,
                label: t('lv1') + ' ' + i,
                width: 100,
            };
        }),
        {
            dataIndex: 'right',
            label: t('right'),
            fixed: fixedRight.value ? 'right' : null,
            children: [
                {
                    dataIndex: 'right-1',
                    label: t('right1'),
                    width: 50,
                    fixed: fixedRight.value ? 'right' : null,
                },
                {
                    dataIndex: 'right-2',
                    label: t('right2'),
                    width: 100,
                    fixed: fixedRight.value ? 'right' : null,
                },
            ],
        },
    ];
});
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
    <CheckItem v-model="virtualX" text="virtual-x(^1.0.0)"></CheckItem>
    <CheckItem v-model="fixedLeft" text="fixed-left(Basic)"></CheckItem>
    <CheckItem v-model="fixedRight" text="fixed-right(right)"></CheckItem>
    <StkTable
        style="height: 200px"
        row-key="id"
        fixed-col-shadow
        :virtual="virtual"
        :virtual-x="virtualX"
        :columns="columns"
        :data-source="dataSource"
    >
    </StkTable>
</template>
