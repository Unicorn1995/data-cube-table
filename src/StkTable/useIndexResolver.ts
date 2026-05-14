import type { ComputedRef, Ref } from 'vue';
import type { StkTableColumn, UniqKey } from './types';

export function useIndexResolver<DT extends Record<string, any>>(
    dataSourceRef: Ref<DT[]>,
    columnsRef: Ref<StkTableColumn<DT>[]>,
    rowKeyGen: (row: DT | null | undefined) => UniqKey,
    colKeyGen: ComputedRef<(col: StkTableColumn<DT>) => UniqKey>,
) {
    function getRowIndex(row: DT): number {
        const targetKey = rowKeyGen(row);
        return dataSourceRef.value.findIndex(item => rowKeyGen(item) === targetKey);
    }

    function getColumnIndex(column: StkTableColumn<DT>): number {
        const targetKey = colKeyGen.value(column);
        return columnsRef.value.findIndex(item => colKeyGen.value(item) === targetKey);
    }

    return [getRowIndex, getColumnIndex] as const;
}
