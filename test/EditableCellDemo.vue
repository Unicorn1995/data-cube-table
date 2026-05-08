<template>
    <div class="page">
        <h3>EditableCell Demo - Excel 风格单元格编辑</h3>
        <div class="tips">
            <p><strong>操作说明：</strong></p>
            <ol>
                <li>双击单元格进入编辑模式，输入内容后按 Enter 确认，按 Esc 取消。</li>
                <li>启用 areaSelection 后，可使用方向键 / Tab 键移动选区。</li>
                <li>编辑完成后焦点自动回到表格容器，键盘导航不会中断。</li>
            </ol>
        </div>

        <StkTable
            row-key="id"
            stripe
            virtual
            :row-height="36"
            :columns="columns"
            :data-source="tableData"
            :area-selection="areaSelectionConfig"
            style="height: 360px"
        />

        <div class="data-preview">
            <div>data-source:</div>
            <div>
                <div>[</div>
                <div v-for="row in tableData" :key="row.id" style="padding-left: 16px">{{ row }},</div>
                <div>]</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { StkTable, registerFeature, useAreaSelection, createEditableCell } from '../src/StkTable';
import type { StkTableColumn } from '../src/StkTable';

registerFeature([useAreaSelection]);

const { EditableCell } = createEditableCell();
const EditableCellComponent = EditableCell();

type RowType = {
    id: number;
    name: string;
    age: number;
    city: string;
    email: string;
};

const areaSelectionConfig = {
    enabled: true,
    keyboard: true,
    ctrl: true,
    shift: true,
    highlight: { cell: true, row: false },
} as any;

const columns: StkTableColumn<RowType>[] = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '姓名', dataIndex: 'name', width: 120, customCell: EditableCellComponent },
    { title: '年龄', dataIndex: 'age', width: 80, customCell: EditableCellComponent },
    { title: '城市', dataIndex: 'city', width: 140, customCell: EditableCellComponent },
    { title: '邮箱', dataIndex: 'email', customCell: EditableCellComponent },
];

const tableData = ref<RowType[]>([
    { id: 1, name: '张三', age: 28, city: '北京市海淀区', email: 'zhangsan@example.com' },
    { id: 2, name: '李四', age: 32, city: '上海市浦东新区', email: 'lisi@example.com' },
    { id: 3, name: 'Jack', age: 45, city: 'London', email: 'jack@example.com' },
    { id: 4, name: 'Rose', age: 22, city: 'New York', email: 'rose@example.com' },
    { id: 5, name: '王五', age: 35, city: '广州市天河区', email: 'wangwu@example.com' },
    { id: 6, name: '赵六', age: 29, city: '深圳市南山区', email: 'zhaoliu@example.com' },
    { id: 7, name: 'Alice', age: 31, city: 'Paris', email: 'alice@example.com' },
    { id: 8, name: 'Bob', age: 27, city: 'Berlin', email: 'bob@example.com' },
    { id: 9, name: '孙七', age: 40, city: '杭州市西湖区', email: 'sunqi@example.com' },
    { id: 10, name: '周八', age: 33, city: '成都市武侯区', email: 'zhouba@example.com' },
    { id: 11, name: '吴九', age: 26, city: '南京市鼓楼区', email: 'wujiu@example.com' },
    { id: 12, name: '郑十', age: 38, city: '武汉市洪山区', email: 'zhengshi@example.com' },
    { id: 13, name: 'Tom', age: 24, city: 'Tokyo', email: 'tom@example.com' },
    { id: 14, name: 'Jerry', age: 36, city: 'Sydney', email: 'jerry@example.com' },
    { id: 15, name: '陈一', age: 41, city: '重庆市渝中区', email: 'chenyi@example.com' },
    { id: 16, name: '林二', age: 30, city: '厦门市思明区', email: 'liner@example.com' },
    { id: 17, name: '黄三', age: 25, city: '长沙市岳麓区', email: 'huangsan@example.com' },
    { id: 18, name: 'David', age: 34, city: 'Toronto', email: 'david@example.com' },
    { id: 19, name: 'Emma', age: 28, city: 'Melbourne', email: 'emma@example.com' },
    { id: 20, name: '刘四', age: 37, city: '西安市雁塔区', email: 'liusi@example.com' },
]);
</script>

<style scoped>
.page {
    padding: 16px;
    width: 1000px;
}
.tips {
    background: #fffbe6;
    border: 1px solid #ffe58f;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    margin-bottom: 12px;
}
.tips ol {
    margin: 4px 0 8px 20px;
    padding: 0;
}
.data-preview {
    margin-top: 16px;
    font-size: 12px;
    font-family: monospace;
    background: #f5f5f5;
    padding: 8px 12px;
    border-radius: 4px;
    max-height: 300px;
    overflow: auto;
}
</style>
