export { useAreaSelection } from './features/index';
export { registerFeature } from './registerFeature';
export { default as StkTable } from './StkTable.vue';
export type { Order, SortConfig, SortOption, SortState, StkTableColumn } from './types/index';
export { binarySearch, insertToOrderedArray, strCompare, tableSort } from './utils';
// export custom cells
export { createFilter } from './custom-cells/Filter/index';
export type { CreateFilterOption, FilterStatus } from './custom-cells/Filter/index';
export { createEditableCell } from './custom-cells/EditableCell/index';
export type { CreateEditableCellOptions } from './custom-cells/EditableCell/index';

import './style.less';
