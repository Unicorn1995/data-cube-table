import { CustomHeaderCellProps, StkTableColumn } from '../../types';
import { FilterOption } from './types';

declare const _default: import('vue').DefineComponent<import('vue').ExtractPropTypes<__VLS_TypePropsToRuntimeProps<CustomHeaderCellProps<any> & {
    theme?: "light" | "dark";
    active?: boolean;
    options?: FilterOption[];
    dataSource: any[];
    col: StkTableColumn<any>;
    colIndex: number;
}>>, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    change: (value: any[], column: StkTableColumn<any>, colIndex: number) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_TypePropsToRuntimeProps<CustomHeaderCellProps<any> & {
    theme?: "light" | "dark";
    active?: boolean;
    options?: FilterOption[];
    dataSource: any[];
    col: StkTableColumn<any>;
    colIndex: number;
}>>> & Readonly<{
    onChange?: ((value: any[], column: StkTableColumn<any>, colIndex: number) => any) | undefined;
}>, {}, {}, {}, {}, string, import('vue').ComponentProvideOptions, true, {}, any>;
export default _default;
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToRuntimeProps<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
