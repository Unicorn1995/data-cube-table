import { Ref } from 'vue';
import { PrivateRowDT, PrivateStkTableColumn, StkTableColumn } from './types';

/**
 * Table Columns Processing Hook
 * Handles multi-level header processing and column flattening
 *
 * 核心职责：
 * - 将用户传入的 `columns`（可能含 children 多级表头）摊平为「按层级划分」的二维数组 `tableHeaders`，
 *   每层是同一行的 th 集合；同时生成 `tableHeadersForCalc`（复制 rowSpan 位置）用于固定列计算。
 * - 为每个列补充私有元数据（@private 字段）：
 *   - __P__    父列引用（双向链表）
 *   - __LF_S__ / __LF_E__  该列在叶子列中的起止索引，用于多级表头横向虚拟滚动
 *   - __W__    计算宽度（子列累加 / 叶子列取配置宽度）
 *   - __R_SP__ / __C_SP__  th 的 rowSpan / colSpan
 * - 在 relative 模式（isRelativeMode）下，固定列不再用 sticky，而是重排到左右两侧。
 * - 叶子列宽度是 X 轴虚拟滚动的依据（getColWidth）。
 */
export declare function useTableColumns<DT extends Record<string, any>>(virtualX: boolean, isRelativeMode: Ref<boolean>): readonly [import('vue').ShallowRef<PrivateStkTableColumn<PrivateRowDT>[][], PrivateStkTableColumn<PrivateRowDT>[][]>, import('vue').ShallowRef<PrivateStkTableColumn<PrivateRowDT>[][], PrivateStkTableColumn<PrivateRowDT>[][]>, (columns: StkTableColumn<DT>[]) => void];
