<template>
    <div>
        <h2>StkTable 首次加载飞入动画测试</h2>
        <button :disabled="hasData" @click="loadData">加载数据</button>
        <button :disabled="!hasData" @click="resetData">重置数据</button>

        <StkTable
            ref="stkTableRef"
            class="fly-in-table"
            row-key="id"
            headless
            :row-hover="false"
            :row-active="false"
            cell-hover
            cell-active
            :columns="columns"
            :data-source="dataSource"
            :row-height="100"
        />
    </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { StkTable } from '../src/StkTable/index';

const stkTableRef = ref();
const hasData = ref(false);
const dataSource = ref<any[]>([]);

const columns = [
    { title: '序号', dataIndex: 'id', width: 100 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '年龄', dataIndex: 'age', width: 100 },
    { title: '地址', dataIndex: 'address', width: 100 },
    { title: '邮箱', dataIndex: 'email', width: 100 },
];

function generateData(count: number) {
    const data = [];
    for (let i = 1; i <= count; i++) {
        data.push({
            id: i,
            name: `用户${i}`,
            age: 20 + (i % 30),
            address: `北京市${i}号`,
            email: `user${i}.com`,
        });
    }
    return data;
}

function loadData() {
    dataSource.value = generateData(5);
    hasData.value = true;
}

function resetData() {
    dataSource.value = [];
    hasData.value = false;
}

/**
 * 使用 setHighlightDimCell 实现 Win8 开始菜单风格动画
 */
function playFlyInAnimation() {
    nextTick(() => {
        const tableElement = stkTableRef.value?.$el;
        if (!tableElement) return;

        // 遍历所有数据行和列
        columns.forEach((col, colIndex) => {
            dataSource.value.forEach((row, rowIndex) => {
                // 计算延迟时间 - 从左到右，从上到下依次出现
                const delay = rowIndex * 0.06 + colIndex * 0.1;

                // 延迟后执行高亮动画
                setTimeout(() => {
                    // 动画时长随机波动

                    // 使用 setHighlightDimCell 方法，使用 CSS 方式
                    stkTableRef.value?.setHighlightDimCell(row.id, col.dataIndex, {
                        method: 'css',
                        className: 'fly-in-cell',
                        duration: 0,
                    });
                }, delay * 1000);
            });
        });
    });
}

// 监听数据变化，当数据加载时触发动画
watch(dataSource, newVal => {
    if (newVal && newVal.length > 0) {
        playFlyInAnimation();
    }
});
</script>

<style scoped lang="less">
button {
    padding: 8px 16px;
    margin-right: 10px;
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:hover:not(:disabled) {
    background: #f0f0f0;
}

/* 飞入动画表格 - 初始时所有 td 不可见 */
:deep(.fly-in-table) {
    width: fit-content;
    overflow: hidden;
    table {
        border-spacing: 10px;
    }
    tr {
        perspective: 1000px;
        // transform-style: preserve-3d;
    }
    td {
        visibility: hidden;
        transform-origin: -10px 50%;
        background-color: rgba(0, 0, 0, 0.1);
    }
    /* 高亮动画的单元格变为可见 */
    td.fly-in-cell {
        visibility: visible;
        animation: flyIn 1s cubic-bezier(0.12, 1.15, 0, 1) forwards;
    }
}

/* 飞入动画关键帧 */
@keyframes flyIn {
    0% {
        opacity: 0;
        transform: rotateY(90deg) scale(0.8);
    }
    100% {
        opacity: 1;
        transform: rotateY(0deg);
    }
}
</style>
