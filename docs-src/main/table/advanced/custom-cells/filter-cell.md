# Filter 筛选 <Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter 是一个内置的列头筛选组件，点击列头筛选图标即可弹出筛选面板，支持手动指定选项和自动从数据提取选项。

### 基础使用

通过 `createFilterCell` 工厂函数创建 Filter 组件，并将其作为 `customHeaderCell` 使用。

<demo vue="advanced/custom-cells/FilterCell/index.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/FilterCell/index.vue"></demo>

### 自动提取选项

设置 `autoOptions: true`，Filter 会自动从当前列的数据中提取去重后的值作为筛选选项。

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // 自动从数据提取选项
    }),
}
```

::: tip 局限性
* `autoOption` 作为少量数据下方便开发使用。对于**大量数据**，要全量遍历，可能会有性能问题。
* option 顺序不固定。
:::

::: warning autoOptions 缓存刷新时机
`autoOptions` 会缓存提取结果。当 `props.dataSource` 引用发生变化时（例如 `sort-remote` 场景下父组件将已过滤的数据回传为 `dataSource`），缓存会被清除并在下次打开下拉时从新数据中重新提取选项，可能导致筛选选项减少。如需保持选项稳定，请使用 `options` 手动指定固定选项列表。
:::

### 自定义筛选逻辑

通过 `filter` 参数可以自定义筛选逻辑：

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30岁以下', value: 'young' },
            { label: '30岁以上', value: 'old' },
        ],
        filter: ({ row, cellValue, filterValues }) => {
            return filterValues.some(v => {
                if (v === 'young') return cellValue < 30;
                if (v === 'old') return cellValue >= 30;
                return false;
            });
        },
    }),
}
```

<demo vue="advanced/custom-cells/FilterCell/CustomFilter.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/FilterCell/CustomFilter.vue"></demo>

### createFilterCell 选项

`createFilterCell` 工厂函数接受一个配置对象：

```ts
interface CreateFilterCellOption {
    /** 是否远程筛选，默认 false */
    remote?: boolean;
    /** 筛选状态改变时触发 */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| remote | `boolean` | `false` | 是否远程筛选，设置为 true 时不会自动触发数据过滤 |
| onChange | `(data) => void` | - | 筛选状态改变时的回调，参数包含 `colKey`（列键）和 `status`（当前列筛选状态） |

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

## 注意远程排序冲突

在 `sort-remote` 远程排序模式下，`@sort-change` 事件的第三个参数 `data` 是表格当前的工作数据副本，**如果此时有激活的筛选条件，该数据仅包含筛选后的行**，而非完整的原始 `props.dataSource`。

如果直接将该 `data` 赋值给 `dataSource`，被筛选掉的行将**永久丢失**。

::: warning 正确做法
远程排序时，父组件应始终基于自己维护的**原始数据源**进行排序，而不是使用 `sort-change` 事件的 `data` 参数。
```ts
// ✘ 错误：data 可能已被筛选，直接赋值会丢失数据
function handleSortChange(col, order, data) {
    dataSource.value = data;
}

// ✔ 正确：基于原始数据源排序
function handleSortChange(col, order) {
    // originalData = dataSource.value
    dataSource.value = sortMyData(originalData, col, order);
}
```
:::
