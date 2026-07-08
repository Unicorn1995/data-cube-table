import { CustomHeaderCellProps, UniqKey } from '../../types';
import { VNode } from 'vue';
import { CreateFilterCellOption, FilterComponentConfig, FilterStatus } from './types.js';

/**
 * 表格筛选功能工厂函数 (BETA)
 *
 * Q: 为什么要通过 stkTableInstance 来设置筛选状态，而不是直接在 createFilterCell 中传入dataSource。
 * A: 因为 createFilterCell 不一定有 dataSource的上下文，它可能在独立的js/ts 中使用，而非Vue SFC。而通过 stkTableInstance 可以获取到 dataSource
 * @beta
 * @returns
 */
export declare function createFilterCell(option?: CreateFilterCellOption): {
    Filter: (config?: FilterComponentConfig, component?: VNode | ((props: CustomHeaderCellProps<any>) => VNode)) => import('vue').Raw<import('vue').DefineComponent<{
        col: import('../../types').StkTableColumn<any>;
        rowIndex: number;
        colIndex: number;
    }, () => VNode<import('vue').RendererNode, import('vue').RendererElement, {
        [key: string]: any;
    }>, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<{
        col: import('../../types').StkTableColumn<any>;
        rowIndex: number;
        colIndex: number;
    }> & Readonly<{}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>>;
    filterStatus: import('vue').Ref<Record<UniqKey, FilterStatus>, Record<UniqKey, FilterStatus>>;
};
