# EditableCell 編集可能セル(Beta)

EditableCell は組み込みの編集可能セルコンポーネントです。セルをダブルクリックして編集モードに入り、キーボードで保存またはキャンセルできます。

### 基本的な使い方

`createEditableCell` ファクトリ関数で EditableCell コンポーネントを作成し、`customCell` として使用します。

<demo vue="advanced/custom-cells/EditableCell/index.vue"></demo>

```ts
import { createEditableCell } from 'stk-table-vue/src/StkTable/custom-cells/EditableCell';
import { useI18n } from '../../hooks/useI18n';

const { t } = useI18n();

const { EditableCell } = createEditableCell({
    onChange: (newValue, row, dataIndex) => {
        console.log(t('valueChange'), newValue, row, dataIndex);
    },
});

// columns で使用
const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('name'), dataIndex: 'name', width: 100, customCell: EditableCell() },
    { title: t('age'), dataIndex: 'age', width: 80, customCell: EditableCell() },
    { title: t('address'), dataIndex: 'address', customCell: EditableCell() },
];
```

### 設定オプション

`createEditableCell` は設定オブジェクトを受け取ります：

```ts
interface CreateEditableCellOptions {
    /** 編集をトリガーするイベント、デフォルト 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 値変更コールバック */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
```

| プロパティ | 型 | デフォルト | 説明 |
|---|---|---|---|
| trigger | `'dblclick' \| 'click'` | `'dblclick'` | 編集をトリガーするイベントタイプ |
| onChange | `(newValue, row, dataIndex) => void` | - | 編集完了後のコールバック関数 |

### キーボード操作

編集モードで以下のキーボード操作がサポートされています：

| キー | 動作 |
|---|---|
| Enter | 保存して編集モードを終了 |
| Escape | 編集をキャンセルし、元の値に戻す |
| Tab | 保存して編集モードを終了 |
| 方向キー | 入力フィールド内でカーソルを移動（セルナビゲーションはトリガーされません） |
