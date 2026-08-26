/**
 * @vitest-environment happy-dom
 *
 * 回归测试：fixedColClassMap 存储值从 string[] 改为预拼接 string 后，
 * 固定列单元格的 class 属性应包含空格分隔的类名，而非逗号连接。
 */
import { mount } from '@vue/test-utils';
import { StkTable } from '@/StkTable';
import { describe, expect, test } from 'vitest';

describe('Fixed column class serialization', () => {
    const columns = [
        { dataIndex: 'id', title: 'ID', width: 100, fixed: 'left' },
        { dataIndex: 'name', title: 'Name', width: 200 },
        { dataIndex: 'age', title: 'Age', width: 100 },
        { dataIndex: 'op', title: 'Op', width: 100, fixed: 'right' },
    ];
    const dataSource = [
        { id: 1, name: 'Alice', age: 25 },
        { id: 2, name: 'Bob', age: 30 },
    ];

    test('fixed column th class should be space-separated, not comma-separated', async () => {
        const wrapper = mount(StkTable, {
            props: {
                rowKey: 'id',
                columns,
                dataSource,
            },
        });

        const ths = wrapper.findAll('.stk-table-main thead > tr > th');
        // First th is the left-fixed column (ID)
        const leftFixedTh = ths[0];
        const leftFixedClass = leftFixedTh.attributes('class');
        // class should contain space-separated fixed-cell classes
        expect(leftFixedClass).toContain('fixed-cell');
        expect(leftFixedClass).toContain('fixed-cell--left');
        // class should NOT contain commas (which would indicate array toString bug)
        expect(leftFixedClass).not.toContain(',');

        // Last th is the right-fixed column (Op)
        const rightFixedTh = ths[ths.length - 1];
        const rightFixedClass = rightFixedTh.attributes('class');
        expect(rightFixedClass).toContain('fixed-cell');
        expect(rightFixedClass).toContain('fixed-cell--right');
        expect(rightFixedClass).not.toContain(',');
    });

    test('fixed column td class should be space-separated, not comma-separated', async () => {
        const wrapper = mount(StkTable, {
            props: {
                rowKey: 'id',
                columns,
                dataSource,
            },
        });

        const tds = wrapper.findAll('.stk-table-main tbody > tr:first-child > td');
        // First td is the left-fixed column
        const leftFixedTd = tds[0];
        const leftFixedClass = leftFixedTd.attributes('class');
        expect(leftFixedClass).toContain('fixed-cell');
        expect(leftFixedClass).toContain('fixed-cell--left');
        expect(leftFixedClass).not.toContain(',');

        // Last td is the right-fixed column
        const rightFixedTd = tds[tds.length - 1];
        const rightFixedClass = rightFixedTd.attributes('class');
        expect(rightFixedClass).toContain('fixed-cell');
        expect(rightFixedClass).toContain('fixed-cell--right');
        expect(rightFixedClass).not.toContain(',');
    });

    test('non-fixed column should not have fixed-cell class', async () => {
        const wrapper = mount(StkTable, {
            props: {
                rowKey: 'id',
                columns,
                dataSource,
            },
        });

        const ths = wrapper.findAll('.stk-table-main thead > tr > th');
        // Middle th (Name) is not fixed
        const nonFixedTh = ths[1];
        const nonFixedClass = nonFixedTh.attributes('class');
        expect(nonFixedClass).not.toContain('fixed-cell');
    });
});
