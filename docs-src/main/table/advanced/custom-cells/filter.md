# Filter 筛选(Beta)

Filter 是一个内置的列头筛选组件，点击列头筛选图标即可弹出筛选面板，支持手动指定选项和自动从数据提取选项。

### 基础使用

通过 `createFilter` 工厂函数创建 Filter 组件，并将其作为 `customHeaderCell` 使用。

<demo vue="advanced/custom-cells/Filter/index.vue"></demo>

```ts
import { createFilter } from 'stk-table-vue/src/StkTable/custom-cells/Filter';

const { Filter, filterStatus } = createFilter();

// 在 columns 中使用
const columns: StkTableColumn<RowData>[] = [
    {
        title: '姓名',
        dataIndex: 'name',
        customHeaderCell: Filter({
            options: [
                { label: '张三', value: '张三' },
                { label: '李四', value: '李四' },
            ],
        }),
    },
];
```

### 自动提取选项

设置 `autoOptions: true`，Filter 会自动从当前列的数据中提取去重后的值作为筛选选项。

```ts
{
    title: '城市',
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // 自动从数据提取选项
    }),
}
```

### 自定义筛选逻辑

通过 `filter` 参数可以自定义筛选逻辑：

```ts
{
    title: '年龄',
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30岁以下', value: 'young' },
            { label: '30岁以上', value: 'old' },
        ],
        filter: ({ row, cellValue, filterValues }) => {
            if (filterValues.includes('young')) {
                return cellValue < 30;
            }
            if (filterValues.includes('old')) {
                return cellValue >= 30;
            }
            return true;
        },
    }),
}
```

### 数据过滤

Filter 组件本身不自动过滤数据，它通过 `filterStatus` 响应式对象提供筛选状态，需要自行处理数据过滤：

```ts
import { ref, computed } from 'vue';
import { createFilter } from 'stk-table-vue/src/StkTable/custom-cells/Filter';

const { Filter, filterStatus } = createFilter();

const rawData = ref([...]); // 原始数据

// 根据筛选状态过滤数据
const dataSource = computed(() => {
    const filters = filterStatus.value;
    const filterKeys = Object.keys(filters);
    if (filterKeys.length === 0) return rawData.value;

    return rawData.value.filter(row => {
        for (const key of filterKeys) {
            const filter = filters[key];
            if (filter.value.length > 0) {
                const cellValue = row[key as keyof typeof row];
                if (filter.filter) {
                    // 使用自定义过滤函数
                    if (!filter.filter({ row, cellValue, filterValues: filter.value })) {
                        return false;
                    }
                } else {
                    // 默认过滤逻辑
                    if (!filter.value.includes(cellValue)) {
                        return false;
                    }
                }
            }
        }
        return true;
    });
});
```

### 配置选项

`FilterComponent` 接受一个配置对象：

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // 筛选选项列表
    filter?: (args) => boolean;     // 自定义筛选函数
    autoOptions?: boolean;          // 是否自动从数据提取选项，默认 false
}

interface FilterOption {
    label: string;     // 显示文本
    value: any;        // 筛选值
    selected?: boolean; // 是否默认选中
}
```

### FilterStatus 类型

```ts
interface FilterStatus {
    /** 当前选中的筛选值数组 */
    value: any[];
    /** 自定义筛选逻辑函数 */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
