# EditableCell (Beta)

EditableCell is a built-in editable cell component. Double-click a cell to enter edit mode, with keyboard support for saving or canceling.

### Basic Usage

Create an EditableCell component via the `createEditableCell` factory function and use it as `customCell`.

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

// Use in columns
const columns: StkTableColumn<RowData>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: t('name'), dataIndex: 'name', width: 100, customCell: EditableCell() },
    { title: t('age'), dataIndex: 'age', width: 80, customCell: EditableCell() },
    { title: t('address'), dataIndex: 'address', customCell: EditableCell() },
];
```

### Configuration Options

`createEditableCell` accepts a configuration object:

```ts
interface CreateEditableCellOptions {
    /** Event that triggers editing, default 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** Value change callback */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| trigger | `'dblclick' \| 'click'` | `'dblclick'` | Event type that triggers editing |
| onChange | `(newValue, row, dataIndex) => void` | - | Callback after editing is complete |

### Keyboard Shortcuts

The following keyboard shortcuts are supported in edit mode:

| Key | Behavior |
|---|---|
| Enter | Save and exit edit mode |
| Escape | Cancel editing, restore original value |
| Tab | Save and exit edit mode |
| Arrow keys | Move cursor within input (does not trigger cell navigation) |
