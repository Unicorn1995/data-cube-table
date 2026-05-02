import { watch, onMounted, onBeforeUnmount, type Ref, computed } from 'vue';

/** 全局交互跟踪器（模块级单例） */
const interactionTracker = (() => {
    /** 引用计数：有多少个开启 areaSelection 的实例在用 */
    let instanceCount = 0;
    /** 最后一次交互类型 */
    let interactionType: 'mouse' | 'keyboard' = 'mouse';
    /** 全局监听是否已注册 */
    let documentListenersRegistered = false;

    const onMousedown = () => {
        interactionType = 'mouse';
    };

    const onKeydown = (e: KeyboardEvent) => {
        if (e.key !== 'Meta') {
            interactionType = 'keyboard';
        }
    };

    /** 增加引用，必要时注册全局监听 */
    const acquire = () => {
        instanceCount++;
        if (!documentListenersRegistered) {
            document.addEventListener('mousedown', onMousedown, { capture: true, passive: true });
            document.addEventListener('keydown', onKeydown, { capture: true, passive: true });
            documentListenersRegistered = true;
        }
    };

    /** 减少引用，归零时注销全局监听 */
    const release = () => {
        instanceCount--;
        if (instanceCount <= 0 && documentListenersRegistered) {
            document.removeEventListener('mousedown', onMousedown);
            document.removeEventListener('keydown', onKeydown);
            documentListenersRegistered = false;
            instanceCount = 0; // 防负数
        }
    };

    const getInteraction = (): 'mouse' | 'keyboard' => interactionType;

    return { acquire, release, getInteraction };
})();

export function useFocusoutControll(props: any, tableRef: Ref<HTMLDivElement | undefined>) {
    let handler: ((e: FocusEvent) => void) | null = null;

    const createHandler = () => {
        return (e: FocusEvent) => {
            // 始终通过 tableRef.value 读取最新引用，避免闭包陷阱
            const container = tableRef.value;
            if (!container) return;

            const relatedTarget = e.relatedTarget as HTMLElement | null;

            // 焦点移到了容器外部的元素（用户有意操作其他组件），不干预
            if (relatedTarget && !container.contains(relatedTarget)) {
                return;
            }

            // relatedTarget 为 null 时，只有键盘交互才夺回焦点
            if (!relatedTarget && interactionTracker.getInteraction() === 'keyboard') {
                requestAnimationFrame(() => {
                    container.focus();
                });
            }
        };
    };

    const isAreaSelectionEnabled = computed(() => {
        return typeof props.areaSelection === 'boolean' ? props.areaSelection : props.areaSelection.enabled;
    });

    const mountHandler = () => {
        if (handler) return;
        handler = createHandler();
        tableRef.value!.addEventListener('focusout', handler);
    };

    const unmountHandler = () => {
        if (!handler) return;
        tableRef.value?.removeEventListener('focusout', handler);
        handler = null;
    };

    // 初始注册（DOM 挂载后）
    onMounted(() => {
        if (isAreaSelectionEnabled.value) {
            interactionTracker.acquire();
            mountHandler();
        }
    });

    // areaSelection 切换时注册/注销
    watch(
        () => props.areaSelection,
        areaSelection => {
            const container = tableRef.value;
            if (!container) return;

            const isEnabled = typeof areaSelection === 'boolean' ? areaSelection : areaSelection?.enabled;

            if (isEnabled) {
                interactionTracker.acquire();
                mountHandler();
            } else {
                interactionTracker.release();
                unmountHandler();
            }
        },
    );

    // 组件卸载时统一清理
    onBeforeUnmount(() => {
        if (handler) {
            interactionTracker.release();
            unmountHandler();
        }
    });
}
