<template>
    <div style="padding: 16px">
        <CheckItem v-model="keyboard" :text="t('keyboardSelect') + ` (v0.11.0)`"></CheckItem>
        <CheckItem v-model="ctrlEnabled" :text="t('ctrlMultiSelect') + ` (v0.11.10)`"></CheckItem>
        <CheckItem
            v-model="shiftEnabled"
            :text="t('shiftExpandSelect') + ` (v0.11.10)`"
        ></CheckItem>
        <CheckItem v-model="highlightCell" :text="t('cellHighlight') + ` (v0.11.10)`"></CheckItem>
        <CheckItem v-model="highlightRow" :text="t('rowHighlight') + ` (v0.11.10)`"></CheckItem>
        <StkTable
            style="height: 400px"
            row-key="id"
            stripe
            :row-active="false"
            :data-source="rows"
            :columns="cols"
            :area-selection="{
                enabled: true,
                formatCellForClipboard: formatCell,
                keyboard,
                ctrl: ctrlEnabled,
                shift: shiftEnabled,
                highlight: {
                    cell: highlightCell,
                    row: highlightRow,
                },
            }"
            @area-selection-change="onSelectionChange"
        />
        <div style="margin-top: 12px">
            <pre style="white-space: pre-wrap">{{ formatCurrentRange(currentRange) }}</pre>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import StkTable from '../../StkTable.vue';
import { useI18n } from '../../hooks/useI18n/index';
import CheckItem from '../../components/CheckItem.vue';

const { t } = useI18n();

type Row = { id: number; name: string; age: number; city: string };

const keyboard = ref(true);
const ctrlEnabled = ref(true);
const shiftEnabled = ref(true);
const highlightCell = ref(true);
const highlightRow = ref(false);

const cols = [
    { title: 'ID', dataIndex: 'id', fixed: 'left', width: 50 },
    { title: 'Name', dataIndex: 'name', width: 120 },
    { title: 'Age', dataIndex: 'age', width: 80 },
    { title: 'City', dataIndex: 'city', width: 120 },
    { title: 'City', dataIndex: 'city1', width: 120 },
    { title: 'City', dataIndex: 'city2', width: 120 },
    { title: 'City', dataIndex: 'city3', width: 120 },
    { title: 'City', dataIndex: 'city4', width: 120 },
];

const rows = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    name: `User${i + 1}`,
    age: 20 + (i % 30),
    city: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen'][i % 4],
}));

const currentRange = ref(null as any);

function onSelectionChange(ranges: any) {
    currentRange.value = ranges;
}

function formatCell(row: Row, col: any, raw: any) {
    return raw === null ? '' : String(raw);
}

function formatCurrentRange(ranges: any) {
    if (!ranges || !ranges.length) return '[]';
    const rangesStr = ranges
        .map((r: any) => {
            const idx = r?.index || {};
            const keys = Object.keys(idx);
            if (!keys.length) return '    {\n        "index":{}\n    }';
            const props = keys.map(k => `        "${k}":${JSON.stringify(idx[k])}`);
            props[props.length - 1] += '}';
            return ['    {', '        "index":{', props.join(',\n'), '    }'].join('\n');
        })
        .join(',\n');
    return `[\n${rangesStr}\n]`;
}
</script>

<style scoped>
pre {
    padding: 8px;
}
</style>
