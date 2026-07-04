# Filter フィルター<Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter は組み込みの列ヘッダーフィルターコンポーネントです。列ヘッダーのフィルターアイコンをクリックするとフィルターパネルが表示されます。手動でオプションを指定する方法と、データから自動的にオプションを抽出する方法をサポートしています。

### 基本的な使い方

`createFilter` ファクトリ関数で Filter コンポーネントを作成し、`customHeaderCell` として使用します。

<demo vue="advanced/custom-cells/Filter/index.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/Filter/index.vue"></demo>

### オプションの自動抽出

`autoOptions: true` を設定すると、Filter は現在の列のデータから重複を除いた値を自動的に抽出し、フィルターオプションとして使用します。

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // データから自動的にオプションを抽出
    }),
}
```

### フィルターロジックのカスタマイズ

`filter` パラメータを使用して、フィルターロジックをカスタマイズできます：

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30歳未満', value: 'young' },
            { label: '30歳以上', value: 'old' },
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

### データのフィルタリング

Filter コンポーネント自体はデータを自動的にフィルタリングしません。`filterStatus` リアクティブオブジェクトを通じてフィルター状態を提供するため、データフィルタリングは自行う必要があります：

```ts
import { ref, computed } from 'vue';
import { createFilter } from 'stk-table-vue/src/StkTable/custom-cells/Filter';

const { Filter, filterStatus } = createFilter();

const rawData = ref([...]); // 元データ

// フィルター状態に基づいてデータをフィルタリング
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
                    // カスタムフィルター関数を使用
                    if (!filter.filter({ row, cellValue, filterValues: filter.value })) {
                        return false;
                    }
                } else {
                    // デフォルトのフィルターロジック
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

### createFilter オプション

`createFilter` ファクトリ関数は設定オブジェクトを受け取ります：

```ts
interface CreateFilterOption {
    /** リモートフィルタリングを使用するかどうか、デフォルト false */
    remote?: boolean;
    /** フィルター状態が変更されたときにトリガーされます */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| remote | `boolean` | `false` | リモートフィルタリングを使用するかどうか、true に設定すると自動データフィルタリングはトリガーされません |
| onChange | `(data) => void` | - | フィルター状態が変更されたときのコールバック、パラメータには `colKey`（列キー）と `status`（現在の列フィルター状態）が含まれます |

### 設定オプション

`FilterComponent` は設定オブジェクトを受け取ります：

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // フィルターオプションリスト
    filter?: (args) => boolean;     // カスタムフィルター関数
    autoOptions?: boolean;          // データから自動的にオプションを抽出するかどうか、デフォルト false
}

interface FilterOption {
    label: string;     // 表示テキスト
    value: any;        // フィルター値
    selected?: boolean; // デフォルトで選択されているかどうか
}
```

### FilterStatus 型

```ts
interface FilterStatus {
    /** 現在選択されているフィルター値の配列 */
    value: any[];
    /** カスタムフィルターロジック関数 */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```
