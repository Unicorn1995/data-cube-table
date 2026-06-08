import { Ref } from 'vue';
import { StkTableColumn, UniqKey } from './types';

export declare function useIndexResolver<DT extends Record<string, any>>(dataSourceRef: Ref<DT[]>, columnsRef: Ref<StkTableColumn<DT>[]>, rowKeyGen: (row: DT | null | undefined) => UniqKey): readonly [(row: DT) => number, (column: StkTableColumn<DT>) => number];
