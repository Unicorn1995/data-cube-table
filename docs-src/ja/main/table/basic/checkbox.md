# チェックボックス
## 組み込み拡張機能を使用 <Badge type="tip" text="^1.0.0" />
[CheckboxCell](/main/table/advanced/custom-cells/checkbox-cell)

## 独自実装

`customCell` と `customHeaderCell` 設定オプションを通じてチェックボックス機能を実装します。このアプローチは非常に柔軟で、異なるビジネス要件を満たすことができます。
## 例

<demo vue="basic/checkbox/Checkbox.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/basic/checkbox/Checkbox.vue"></demo>

## コード実装

列設定にカスタム列を追加してチェックボックスを表示します：

```javascript
{
  customHeaderCell: () => {
    return h('span', [
        h('input', {
            type: 'checkbox',
            style: 'vertical-align:middle',
            checked: isCheckAll.value,
            indeterminate: isCheckPartial.value,
            onChange: (e: Event) => {
                const checked = (e.target as HTMLInputElement).checked;
                dataSource.value.forEach(item => {
                    item._isChecked = checked;
                });
            },
        }),
    ]);
  },
  customCell: ({ row }) => {
    return h('div', { style: 'display:flex;align-items:center;justify-content:center' }, [
        h('input', {
            type: 'checkbox',
            checked: row._isChecked,
            onChange: (e: Event) => {
                row._isChecked = (e.target as HTMLInputElement).checked;
            },
        }),
    ]);
  },
}
```

input要素を垂直方向の中央配置のために親要素でラップします。

プロジェクトのVueコンポーネントライブラリ（Element Plus、Ant Design Vue、Naive UIなど）から `Checkbox` コンポーネントに `input` を置き換えて、プロジェクト全体で一貫したスタイルを維持できます。
