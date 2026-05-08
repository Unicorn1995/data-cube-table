import type { CustomCellProps } from '../../types';
import { defineComponent, h, markRaw } from 'vue';
import EditableCellVue from './EditableCell.vue';

/** createEditableCell 配置选项 */
export interface CreateEditableCellOptions {
    /** 触发编辑的事件，默认 'dblclick' */
    trigger?: 'dblclick' | 'click';
    /** 值变更回调 */
    onChange?: (newValue: any, row: Record<string, any>, dataIndex: string) => void;
}

/**
 * 可编辑单元格工厂函数
 * @param option 配置选项
 * @returns EditableCell 组件
 */
export function createEditableCell(option?: CreateEditableCellOptions) {
    function EditableCellComponent() {
        return markRaw(
            defineComponent({
                // eslint-disable-next-line vue/require-prop-types
                props: ['row', 'col', 'cellValue', 'rowIndex', 'colIndex', 'expanded', 'treeExpanded'],
                setup(props: CustomCellProps<any>) {
                    return () =>
                        h(EditableCellVue, {
                            ...props,
                            trigger: option?.trigger || 'dblclick',
                            onChange: (newValue: any) => {
                                option?.onChange?.(newValue, props.row, props.col.dataIndex);
                            },
                        });
                },
            }),
        );
    }

    return {
        EditableCell: EditableCellComponent,
    };
}
