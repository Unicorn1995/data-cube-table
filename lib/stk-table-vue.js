/**
 * name: stk-table-vue
 * version: v10.0.0-beta.1
 * description: High performance realtime virtual table for vue3 and vue2.7
 * author: japlus
 * homepage: https://ja-plus.github.io/stk-table-vue/
 * license: MIT
 */
import { a as insertToOrderedArray, i as binarySearch, n as registerFeature, o as strCompare, r as useAreaSelection, s as tableSort, t as StkTable_default } from "./StkTable-Br7RcAo_.js";
import { computed, createApp, createElementBlock, createElementVNode, createTextVNode, defineComponent, getCurrentInstance, h, markRaw, normalizeClass, openBlock, ref, renderSlot, toDisplayString } from "vue";
//#region src/StkTable/components/Filter/Dropdown/index.ts
var DropdownIns = null;
async function getDropdownIns() {
	if (!DropdownIns) {
		const div = document.createElement("div");
		div.classList.add("stk-filter-dropdown-wrapper");
		document.body.appendChild(div);
		DropdownIns = createApp(await import("./Dropdown-D0UxKIKs.js").then((module) => module.default)).mount(div);
	}
	return DropdownIns;
}
//#endregion
//#region src/StkTable/components/Filter/Filter.vue
var Filter_default = /* @__PURE__ */ defineComponent({
	__name: "Filter",
	props: {
		col: {},
		rowIndex: {},
		colIndex: {},
		theme: {},
		active: { type: Boolean },
		options: {}
	},
	emits: ["change"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const theme = computed(() => props.theme || "light");
		const emit = __emit;
		function handleIconClick(e) {
			e.stopPropagation();
			const pos = e.target.getBoundingClientRect();
			getDropdownIns().then((ins) => {
				ins.setTheme(theme.value);
				if (ins.visible) {
					ins.hide();
					return;
				}
				ins.show({
					x: pos.left,
					y: pos.bottom
				}, props.options, handleConfirm);
			});
		}
		function handleConfirm(value) {
			emit("change", value);
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["stk-filter", [{ "stk-filter--active": props.active }, `stk-filter--${theme.value}`]]) }, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(props.col.title), 1)]), (openBlock(), createElementBlock("svg", {
				class: "stk-filter-icon",
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: "0 0 1024 1024",
				onClick: handleIconClick
			}, [..._cache[0] || (_cache[0] = [createElementVNode("path", {
				fill: "currentColor",
				d: "M609.508 463.246H414.492l-243.825-292.58h682.666zm0 48.754v212.878L414.492 853.333V512z"
			}, null, -1)])]))], 2);
		};
	}
});
//#endregion
//#region src/StkTable/components/Filter/useFilter.ts
/**
* 从数据源提取筛选选项
* @param dataSource 数据源
* @param columnKey 列名
* @returns 筛选选项数组
//  */
/**
* 表格筛选功能Hook (BETA)
* @beta
* @returns
*/
function useFilter(option) {
	const filterStatus = ref({});
	function FilterComponent(config, component) {
		return markRaw(defineComponent({
			props: ["col", "colIndex"],
			setup(props) {
				const colKey = props.col.dataIndex;
				const currentInstance = getCurrentInstance();
				/**
				* 查找最近的StkTable组件实例
				* @returns
				*/
				function findStkTableInstance(curIns) {
					let current = curIns;
					while (current = current.parent) {
						var _current$type;
						if (((_current$type = current.type) === null || _current$type === void 0 ? void 0 : _current$type.name) === "StkTable") return current;
					}
					return null;
				}
				const stkTableInstance = findStkTableInstance(currentInstance);
				const theme = computed(() => {
					var _stkTableInstance$pro;
					return (stkTableInstance === null || stkTableInstance === void 0 || (_stkTableInstance$pro = stkTableInstance.props) === null || _stkTableInstance$pro === void 0 ? void 0 : _stkTableInstance$pro.theme) || "light";
				});
				const filterNumber = computed(() => {
					var _filterStatus$value$c;
					return ((_filterStatus$value$c = filterStatus.value[colKey]) === null || _filterStatus$value$c === void 0 ? void 0 : _filterStatus$value$c.value.length) || 0;
				});
				function handleChange(value) {
					var _stkTableInstance$exp;
					filterStatus.value[colKey] = { value };
					stkTableInstance === null || stkTableInstance === void 0 || (_stkTableInstance$exp = stkTableInstance.exposed) === null || _stkTableInstance$exp === void 0 || _stkTableInstance$exp.setFilter(filterStatus.value, option);
				}
				return () => h(Filter_default, {
					...props,
					theme: theme.value,
					active: filterNumber.value > 0,
					options: (config === null || config === void 0 ? void 0 : config.options) || [],
					onChange: handleChange
				}, [component ? h(component, props) : null]);
			}
		}));
	}
	return {
		Filter: FilterComponent,
		filterStatus
	};
}
//#endregion
export { StkTable_default as StkTable, binarySearch, insertToOrderedArray, registerFeature, strCompare, tableSort, useAreaSelection, useFilter };
