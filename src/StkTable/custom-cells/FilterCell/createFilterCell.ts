import { CustomHeaderCellProps, UniqKey } from '@/StkTable/types';
import { computed, defineComponent, getCurrentInstance, h, markRaw, ref, VNode, watch } from 'vue';
import Filter from './Filter.vue';
import type { CreateFilterCellOption, FilterComponentConfig, FilterOption, FilterStatus } from './types.js';

/**
 * 从数据源提取筛选选项
 *
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
 *
 * Q: 为什么要通过 stkTableInstance 来设置筛选状态，而不是直接在 createFilterCell 中传入dataSource。
 * A: 因为 createFilterCell 不一定有 dataSource的上下文，它可能在独立的js/ts 中使用，而非Vue SFC。而通过 stkTableInstance 可以获取到 dataSource
 * @beta
 * @returns
 */
export function createFilterCell(option?: CreateFilterCellOption) {
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

                    // 自动从数据中提取筛选选项（懒计算，仅在下拉打开时触发）
                    let cachedAutoOptions: FilterOption[] | null = null;
                    // 数据源变化时清除缓存，下次打开下拉时重新计算
                    watch(
                        () => stkTableInstance?.props?.dataSource,
                        () => {
                            cachedAutoOptions = null;
                        },
                    );
                    function getAutoOptions(): FilterOption[] {
                        if (!config?.autoOptions) return [];
                        if (cachedAutoOptions) return cachedAutoOptions;
                        const dataSource: any[] = stkTableInstance?.props?.dataSource || [];
                        cachedAutoOptions = extractFilterOptions(dataSource, colKey);
                        return cachedAutoOptions;
                    }

                    // 优先使用 FilterComponent 传入的 options，其次使用自动提取的选项
                    function getResolvedOptions(): FilterOption[] {
                        return config?.options ?? getAutoOptions();
                    }

                    function handleChange(value: FilterOption['value'][]) {
                        filterStatus.value[colKey] = {
                            value,
                            filter: config?.filter ?? filterStatus.value[colKey]?.filter,
                            column: props.col,
                            colIndex: props.colIndex,
                        };
                        option?.onChange?.({ colKey, status: filterStatus.value[colKey] });
                        stkTableInstance?.exposed?.setFilter(filterStatus.value, option);
                    }
                    return () =>
                        h(
                            Filter,
                            {
                                ...props,
                                theme: theme.value,
                                active: filterNumber.value > 0,
                                getOptions: getResolvedOptions,
                                onChange: handleChange,
                                dataSource: stkTableInstance?.props?.dataSource || [],
                            },
                            component ? { default: () => [h(component, props)] } : undefined,
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
