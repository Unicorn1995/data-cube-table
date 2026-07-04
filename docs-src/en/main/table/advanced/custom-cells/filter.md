# Filter <Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter is a built-in column header filter component. Click the filter icon in the column header to open the filter panel. It supports manually specified options and automatically extracting options from data.

### Basic Usage

Create a Filter component via the `createFilter` factory function and use it as `customHeaderCell`.

<demo vue="advanced/custom-cells/Filter/index.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/Filter/index.vue"></demo>

### Auto Extract Options

Set `autoOptions: true`, and Filter will automatically extract unique values from the current column's data as filter options.

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // Automatically extract options from data
    }),
}
```

### Custom Filter Logic

You can customize the filter logic via the `filter` parameter:

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: 'Under 30', value: 'young' },
            { label: '30 and above', value: 'old' },
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

### Data Filtering

The Filter component itself does not automatically filter data. It provides filter status through the `filterStatus` reactive object. You need to handle data filtering yourself:

```ts
import { ref, computed } from 'vue';
import { createFilter } from 'stk-table-vue/src/StkTable/custom-cells/Filter';

const { Filter, filterStatus } = createFilter();

const rawData = ref([...]); // Raw data

// Filter data based on filter status
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
                    // Use custom filter function
                    if (!filter.filter({ row, cellValue, filterValues: filter.value })) {
                        return false;
                    }
                } else {
                    // Default filter logic
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

### createFilter Options

The `createFilter` factory function accepts a configuration object:

```ts
interface CreateFilterOption {
    /** Whether to use remote filtering, default false */
    remote?: boolean;
    /** Triggered when filter status changes */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| remote | `boolean` | `false` | Whether to use remote filtering, when set to true, automatic data filtering will not be triggered |
| onChange | `(data) => void` | - | Callback when filter status changes, parameters include `colKey` (column key) and `status` (current column filter status) |

### Configuration Options

`FilterComponent` accepts a configuration object:

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // Filter options list
    filter?: (args) => boolean;     // Custom filter function
    autoOptions?: boolean;          // Whether to automatically extract options from data, default false
}

interface FilterOption {
    label: string;     // Display text
    value: any;        // Filter value
    selected?: boolean; // Whether selected by default
}
```

### FilterStatus Type

```ts
interface FilterStatus {
    /** Currently selected filter values array */
    value: any[];
    /** Custom filter logic function */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
