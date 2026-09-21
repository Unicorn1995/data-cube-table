import { Ref, shallowRef } from 'vue';
import { PrivateRowDT, PrivateStkTableColumn, StkTableColumn } from './types';
import { getColWidth } from './utils/constRefUtils';
import { howDeepTheHeader } from './utils/index';

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
export function useTableColumns<DT extends Record<string, any>>(virtualX: boolean, isRelativeMode: Ref<boolean>) {
    /**
     * 表头.内容是 props.columns 的引用集合
     * @eg
     * ```js
     * [
     *      [{dataIndex:'id',...}], // 第0行列配置
     *      [], // 第一行列配置
     *      //...
     * ]
     * ```
     */
    const tableHeaders = shallowRef<PrivateStkTableColumn<PrivateRowDT>[][]>([]);

    /**
     * 用于计算多级表头的tableHeaders。模拟rowSpan 位置的辅助数组。用于计算固定列。
     */
    const tableHeadersForCalc = shallowRef<PrivateStkTableColumn<PrivateRowDT>[][]>([]);

    /**
     * 处理多级表头
     * @param columns 原始列配置
     */
    function dealColumns(columns: StkTableColumn<DT>[]) {
        // reset
        const tableHeadersTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
        const tableHeadersForCalcTemp: PrivateStkTableColumn<PrivateRowDT>[][] = [];
        let copyColumn: StkTableColumn<DT>[] = columns; // do not deep clone

        // relative 模式下不支持sticky列。因此就放在左右两侧。
        if (isRelativeMode.value) {
            const leftCol: StkTableColumn<DT>[] = [];
            const centerCol: StkTableColumn<DT>[] = [];
            const rightCol: StkTableColumn<DT>[] = [];

            for (let i = 0, len = copyColumn.length; i < len; i++) {
                const col = copyColumn[i];
                if (col.fixed === 'left') {
                    leftCol.push(col);
                } else if (col.fixed === 'right') {
                    rightCol.push(col);
                } else {
                    centerCol.push(col);
                }
            }
            copyColumn = leftCol.concat(centerCol).concat(rightCol);
        }

        const maxDeep = howDeepTheHeader(copyColumn);

        for (let i = 0; i <= maxDeep; i++) {
            tableHeadersTemp[i] = [];
            tableHeadersForCalcTemp[i] = [];
        }

        /** 叶子列索引计数器，用于标注每个列在 tableHeaderLast 中的叶子范围 */
        let leafIndex = 0;

        /**
         * flat columns
         * @param arr
         * @param depth 深度
         * @param parent 父节点引用，用于构建双向链表。
         */
        function flat(arr: PrivateStkTableColumn<PrivateRowDT>[], parent: PrivateStkTableColumn<PrivateRowDT> | null, depth = 0): [number, number] {
            /** 所有子节点数量 */
            let allChildrenLen = 0;
            let allChildrenWidthSum = 0;

            for (let i = 0, len = arr.length; i < len; i++) {
                const col = arr[i];
                if (col.hidden) continue;
                col.__P__ = parent;
                col.__LF_S__ = leafIndex;

                /** 一列中的子节点数量 */
                let colChildrenLen = 1;
                /** 多级表头的父节点宽度，通过叶子节点宽度计算得到 */
                let colWidth = 0;

                if (col.children) {
                    // DFS
                    const [len, widthSum] = flat(col.children, col, depth + 1);
                    colChildrenLen = len;
                    colWidth = widthSum;
                    tableHeadersForCalcTemp[depth].push(col);
                } else {
                    colWidth = getColWidth(col);
                    leafIndex++;
                    for (let j = depth; j <= maxDeep; j++) {
                        // 如有rowSpan 向下复制一个表头col，用于计算固定列
                        tableHeadersForCalcTemp[j].push(col);
                    }
                }

                // 回溯
                col.__LF_E__ = leafIndex;
                col.__W__ = colWidth;
                tableHeadersTemp[depth].push(col);
                const rowSpan = col.children ? 1 : maxDeep - depth + 1;
                const colSpan = colChildrenLen;

                if (rowSpan > 1) {
                    col.__R_SP__ = rowSpan;
                }
                if (colSpan > 1) {
                    col.__C_SP__ = colSpan;
                }

                allChildrenLen += colChildrenLen;
                allChildrenWidthSum += colWidth;
            }
            return [allChildrenLen, allChildrenWidthSum];
        }

        flat(copyColumn as PrivateStkTableColumn<PrivateRowDT>[], null);
        tableHeaders.value = tableHeadersTemp;
        tableHeadersForCalc.value = tableHeadersForCalcTemp;
    }

    return [tableHeaders, tableHeadersForCalc, dealColumns] as const;
}
