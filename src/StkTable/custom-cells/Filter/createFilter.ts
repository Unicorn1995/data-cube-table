import { CustomHeaderCellProps, UniqKey } from '@/StkTable/types';
import { computed, defineComponent, getCurrentInstance, h, markRaw, ref, VNode } from 'vue';
import Filter from './Filter.vue';
import type { CreateFilterOption, FilterComponentConfig, FilterOption, FilterStatus } from './types';

/**
 * 从数据源提取筛选选项
 * @param dataSource 数据源
 * @param columnKey 列名
 * @returns 筛选选项数组
 */
function extractFilterOptions(dataSource: any[], columnKey: string): FilterOption[] {
    const uniqueValues = new Set<any>();

    dataSource.forEach(row => {
        const val = row[columnKey];
        if (val !== undefined && val !== null) {
            uniqueValues.add(val);
        }
    });

    return Array.from(uniqueValues).map(value => ({
        label: String(value),
        value,
    }));
}

/**
 * 表格筛选功能工厂函数 (BETA)
 * @beta
 * @returns
 */
export function createFilter(option?: CreateFilterOption) {
    const filterStatus = ref<Record<UniqKey, FilterStatus>>({});

    function FilterComponent(config?: FilterComponentConfig, component?: VNode | ((props: CustomHeaderCellProps<any>) => VNode)) {
        return markRaw(
            defineComponent({
                // eslint-disable-next-line vue/require-prop-types
                props: ['col', 'colIndex'],
                setup(props: CustomHeaderCellProps<any>) {
                    const colKey = props.col.dataIndex;

                    const currentInstance = getCurrentInstance();
                    /**
                     * 查找最近的StkTable组件实例
                     * @returns
                     */
                    function findStkTableInstance(curIns: any) {
                        let current = curIns;
                        while ((current = current.parent)) {
                            if (current.type?.name === 'StkTable') {
                                return current;
                            }
                        }
                        return null;
                    }
                    const stkTableInstance = findStkTableInstance(currentInstance);
                    // 从 StkTable 实例获取 theme
                    const theme = computed(() => stkTableInstance?.props?.theme || 'light');
                    const filterNumber = computed(() => {
                        return filterStatus.value[colKey]?.value.length || 0;
                    });

                    // 自动从数据中提取筛选选项
                    const autoOptions = computed<FilterOption[]>(() => {
                        if (!config?.autoOptions) return [];
                        const dataSource: any[] = stkTableInstance?.props?.dataSource || [];
                        return extractFilterOptions(dataSource, colKey);
                    });

                    // 优先使用 FilterComponent 传入的 options，其次使用自动提取的选项
                    const resolvedOptions = computed(() => config?.options ?? autoOptions.value);

                    function handleChange(value: FilterOption['value'][]) {
                        filterStatus.value[colKey] = {
                            value,
                            filter: config?.filter ?? filterStatus.value[colKey]?.filter,
                        };
                        stkTableInstance?.exposed?.setFilter(filterStatus.value, option);
                    }
                    return () =>
                        h(
                            Filter,
                            {
                                ...props,
                                theme: theme.value,
                                active: filterNumber.value > 0,
                                options: resolvedOptions.value,
                                onChange: handleChange,
                            },
                            [component ? h(component, props) : null],
                        );
                },
            }),
        );
    }

    return {
        Filter: FilterComponent,
        filterStatus,
    };
}
