export { useAreaSelection } from './features/index';
export { registerFeature } from './registerFeature';
export { default as StkTable } from './StkTable.vue';
export type { Order, SortConfig, SortOption, SortState, StkTableColumn } from './types/index';
export { binarySearch, insertToOrderedArray, strCompare, tableSort } from './utils';
// export custom cells
export { createFilter } from './custom-cells/Filter';
export type { CreateFilterOption, FilterStatus } from './custom-cells/Filter';
export { createEditableCell } from './custom-cells/EditableCell';
export type { CreateEditableCellOptions } from './custom-cells/EditableCell';

import './style.less';
