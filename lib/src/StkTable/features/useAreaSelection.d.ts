import { Ref, ShallowRef } from 'vue';
import { AreaSelectionConfig, AreaSelectionRange, CellKeyGen, ColKeyGen, StkTableColumn, AreaSelectionSetterRange, AreaSelectionSetterOption } from '../types';
import { VirtualScrollStore, VirtualScrollXStore } from '../useVirtualScroll';

/**
 * 单元格区域选择功能（Excel 式交互）。
 * 支持鼠标拖拽选择、键盘导航（方向键/Tab/Shift+Tab，Ctrl 多选、Shift 扩选）、复制到剪贴板。
 * en: Cell area selection feature with mouse drag, keyboard navigation, copy-paste, etc.
 *
 * 分区说明：
 * - 选区状态：锚点 begin / 终点 end、选区集合、是否正在拖拽选中（isAreaSelecting）。
 * - 鼠标交互：mousedown 起锚、mousemove 扩展选区、拖拽靠近容器边缘时自动滚动（EDGE_ZONE/SCROLL_SPEED_MAX）。
 * - 键盘交互：方向键/Tab 移动选区（见 useKeyboardArrowScroll 联动）、Ctrl 切换多选、Shift 扩选。
 * - 复制：通过 formatCellForClipboard 回调（若配置了 customCell 应自定义）生成剪贴板文本。
 * - 选区转换：单元格的可见/数据坐标通过 getRowIndex/getColumnIndex、cellKeyGen/colKeyGen 与
 *   虚拟滚动(虚拟窗口裁剪)和列宽缓存(getCalculatedColWidth)相互换算。
 *
 * 对外返回：选区配置/状态、选区范围读写(setAreaSelection/getAreaSelection)、复制处理、选择/取消等。
 */
declare function useAreaSelectionImpl<DT extends Record<string, any>>(props: any, emits: any, tableContainerRef: Ref<HTMLDivElement | undefined>, dataSourceCopy: ShallowRef<DT[]>, tableHeaderLast: ShallowRef<StkTableColumn<DT>[]>, colKeyGen: ColKeyGen, cellKeyGen: CellKeyGen, scrollTo: (top: number | null, left: number | null) => void, virtualScroll: Ref<VirtualScrollStore>, virtualScrollX: Ref<VirtualScrollXStore>, getRowIndex: (row: DT) => number, getColumnIndex: (col: StkTableColumn<DT>) => number): {
    config: import('vue').ComputedRef<AreaSelectionConfig>;
    isSelecting: Ref<boolean, boolean>;
    get: () => {
        rows: DT[];
        cols: StkTableColumn<DT>[];
        ranges: AreaSelectionRange[];
    };
    set: (ranges?: AreaSelectionSetterRange<DT>, option?: AreaSelectionSetterOption) => AreaSelectionRange[];
    clear: () => void;
    copy: () => string;
    onMD: (e: MouseEvent) => void;
};
export declare const useAreaSelectionName = "useAreaSelection";
export declare const useAreaSelection: typeof useAreaSelectionImpl;
export {};
