// Filter组件相关类型定义

// 筛选选项接口
export interface FilterOption {
    label: string;
    value: any;
    selected?: boolean;
}

// 筛选状态接口
export interface FilterStatus {
    value: FilterOption['value'][];
}

// createFilter选项接口
export interface CreateFilterOption {
    /** 是否远程筛选 */
    remote?: boolean;
    /** 是否自动从数据中提取筛选选项，默认 false */
    autoExtractOptions?: boolean;
}
