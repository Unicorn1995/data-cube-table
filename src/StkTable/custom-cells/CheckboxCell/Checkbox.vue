<template>
    <div class="stk-checkbox-cell">
        <component
            :is="customComponent"
            v-if="customComponent"
            :model-value="checked"
            :indeterminate="indeterminate"
            @update:model-value="handleChange"
            @click.stop
        />
        <input
            v-else
            type="checkbox"
            :checked="checked"
            :indeterminate.prop="indeterminate"
            class="stk-checkbox-native"
            @change="handleChange"
            @click.stop
        />
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    /** 当前是否选中 */
    checked?: boolean;
    /** 是否半选状态 */
    indeterminate?: boolean;
    /** 自定义 checkbox 组件（如 Element Plus / Ant Design Vue 的 Checkbox） */
    customComponent?: any;
}>();

const emit = defineEmits<{
    (e: 'change', checked: boolean): void;
}>();

function handleChange(e: Event | boolean) {
    const checked = typeof e === 'boolean' ? e : (e.target as HTMLInputElement).checked;
    emit('change', checked);
}
</script>
