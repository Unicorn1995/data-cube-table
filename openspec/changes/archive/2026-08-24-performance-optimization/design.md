# 性能与包体积优化 — 技术设计

## Context

见 proposal.md（动机与量化现状）。补充实现层现状约束：

- 构建为 Vite lib 模式单入口（`src/StkTable/index.ts`），产物：`lib/stk-table-vue.js`（入口，含 custom cells 工厂）、`lib/StkTable-*.js`（组件主体）、`lib/Dropdown-*.js`、`lib/style.css`（全量样式聚合）；`minify: false`。
- 滚动帧驱动链：`onTableScroll`（rAF 合并）→ `updateVirtualScrollY` → `assignVs(virtualScroll, patch)`，其中 `assignVs` 已做 hasChanged 检测（`src/StkTable/useVirtualScroll.ts:542`）。但 patch 中 `scrollTop` 每帧必变，因此**即使滚动窗口（startIndex/endIndex）未变，每帧仍触发组件整体 re-render**（thead、tfoot、全部行 vnode 重建）。
- 组件需同时兼容 Vue 3 与 Vue 2.7；`v-memo` 为 Vue 3.2+ 编译器能力，2.7 无对应导出（本次变更已裁剪记忆化项，不再涉及）。
- `test/perf` 已有 12 场景基准（`pnpm perf:test` 当前工作区、`pnpm perf` 跨版本），可直接作为验收工具。
- `package.json` 的 `types` 指向 `lib/src/StkTable/index.d.ts`（vite-plugin-dts 产物），`files: ["lib","src"]`；`src` 为 Vue 2.7 消费方必需（源码需经 2.7 自身编译链处理 SFC，`lib` 仅面向 Vue 3），不可移出发布。

## Goals / Non-Goals

**Goals:**

- npm 包保留 `lib`+`src` 双形态且不含杂项（`lib/test`、`*.bak.*`），既有导入路径全部不受影响；发布产物保持未压缩 ESM。
- 滚动窗口未变的帧做到零组件 re-render（默认生效，无 API）。
- 降低 `getTDProps`/`getTHProps` 等渲染热路径的对象分配。
- 全部优化以既有 12 场景基准验证不回退。

**Non-Goals:**

- 不改变任何公共 API；不引入运行时第三方依赖。
- 不做 custom-cells 子路径按需导出（已评估后裁剪：CSS 仅约 3~4KB 可省、JS 可被消费方打包器摇树，收益不抵构建与文档复杂度）。
- 不做行级渲染记忆化（v-memo 类方案需兼容 Vue 2.7，手动 vnode 缓存风险高，裁剪）。
- 不重构虚拟滚动核心算法（Fenwick 树 / 二分 / 占位合并等已优化，不动）。

## Decisions

### D1: 体积——保持产物未压缩，优化发布「内容」

`build.minify` 维持 `false`，并在 `vite.config.ts` 注释固化决策（防止后续被「顺手」打开）。依据：库产物为纯 ESM（`formats: ['es']`），主路径消费方（Vite/Rspack 等脚手架）在应用构建时统一压缩与摇树，发布层压缩对最终应用体积零收益，反而损失错误栈可读性与调试体验；npm registry 传输本身走 gzip，未压缩主要影响包 raw 体积而非下载体积。体积控制的重心放在「发布什么」：杂项清理（D2）。不生成 sourcemap（产物本身可读）。
*备选（否决）*：开启 esbuild minify——仅缩小 npm 包 raw 体积，不影响消费方最终产物，且牺牲调试体验；CDN 直连场景 jsdelivr 等会自动提供 `.min.js` 版本。

### D2: 包内容——保留 `lib`+`src` 双形态，仅清杂项

- `files` 维持 `["lib", "src"]` 不变：`src` 是 Vue 2.7 消费路径，移除即破坏该支持，明确不做。
- 删除遗留备份 `src/StkTable/features/useAreaSelection.bak.ts`（git 历史可找回），从源头消除 `.bak.d.ts`；`vite-plugin-dts` 显式限定生成范围，消除 `lib/test/` 类型杂项；`types` 字段与现有产物路径（`lib/src/**`）保持不变。
- `sideEffects` 声明维持现状：`./src/**` 的副作用标记不影响 `lib` 消费方的 tree-shaking（路径不匹配 lib 文件），且为 1.2.1 修复结论，不动。
- *备选（否决）*：`files` 收窄为 `["lib"]`——直接破坏 Vue 2.7 源码消费路径，否决。

### D3: custom-cells 子路径按需导出——已裁剪（范围决策）

评估结论：CSS 按需仅省约 3~4KB（5 个 cell 样式合计 185 行 less）；JS 按需对主流打包器用户是伪收益（未用导出本就会被消费方摇树，lib JS 未被 sideEffects 标记）；真实收益仅剩懒加载（动态 import）与无打包器场景，与本库主流用户画像不匹配，且引入多入口构建与共享 chunk、文档教学成本。裁剪，不在本变更实施。

### D4: 滚动帧成本——静默 scrollTop/scrollLeft（默认生效）

- `assignVs` 增加静默字段机制：`scrollTop`/`scrollLeft` 写入 store 但不参与 `triggerRef` 判定。窗口未变的滚动帧由此不再触发组件整体 re-render（thead、全部行 vnode 重建归零）。
- 依据：模板不直接消费 `virtualScroll.scrollTop`；依赖它的逻辑（滚动条滑块位置、滚动方向判断、`scroll` 事件载荷）都在滚动处理函数中即时读取 `.value`，不依赖响应式。`experimental.scrollY` 模式下 `translateY` 仍为响应式字段（tbody transform 需要它），不受影响。
- **relative 固定模式例外**：若固定列样式计算（`useFixedStyle`，被 `cellStyleMap` computed 调用）以响应式方式读取 `scrollLeft`/`scrollTop`，静默会使其失联。实施时先核实该依赖：存在则仅在该模式下保留滚动位置字段的响应式（条件静默），或改为在滚动处理链中显式触发所需更新。sticky 模式（默认）固定列为纯 CSS，无此依赖。
- `updateFixedShadow`、`updateCustomScrollbar` 均已是滚动处理链中的显式调用（`onTableScroll` 内），核实其内部状态写入仍被正确触发即可。

### D5: props 函数分配优化（内部）

- `getTDProps`/`getTHProps` 的 `class` 由数组改为预拼接字符串（`getTRProps` 已是字符串）；数组→字符串降低 vnode diff 与 GC 开销。
- `mergeCellsWrapper` 的返回对象按 `(row, col)` 记忆化（仅 `col.mergeCells` 存在时），与 `mergeCellsCache` 代际联动失效。
- 逐项以基准验证，无收益或劣化的项回退。

### D6: CSS contain 评估（实验，允许放弃）

对 `.table-cell-wrapper` / 行评估 `contain: layout paint` 与 `content-visibility`。风险点是 sticky 固定列与合并单元格的视觉回归；且现有基准（happy-dom）无法测真实浏览器样式/布局开销。若无法以可靠手段验证收益，或存在视觉回归风险，即放弃并在变更记录中写明结论。

### D7: 验收方式

- 变更前后各跑一次 `pnpm perf:test`，12 场景指标对齐比较（劣化 ≤ 10%，优化场景应有改善）；`pnpm test` 全量功能回归；`pnpm test:types` 验证 dts 调整；`npm pack --dry-run` 检查包内容；`pnpm build` 产物检查（banner、未压缩、无 lib/test 与 *.bak.*）。

### 受影响文档页面（按仓库规则注明）

- `CHANGELOG.md`：发布内容清理与滚动帧渲染优化（对外非破坏）。
- `docs-src/`：以 `virtual`、`scrollTop`、`experimental` 关键词复查；本次不改公共 API 与外部行为，预期无需更新，复查后记录结论。

## Risks / Trade-offs

- [静默 scrollTop 后，未来代码以响应式方式订阅 `virtualScroll.scrollTop` 会不更新] → 在 `VirtualScrollStore` 类型与 `assignVs` 处注释明确约束；单测覆盖滚动条位置与 `scroll` 事件载荷在窗内滚动时仍正确。
- [relative 固定模式横向滚动时固定列样式失联] → 实施时先核实 `useFixedStyle` 的响应式依赖，条件静默或显式驱动；sticky/relative 两种模式各做行为验证。
- [未压缩产物使 npm 包 raw 体积偏大] → npm 传输走 gzip，实际下载影响有限；CDN 场景由 jsdelivr 等自动提供 min 版本；不做双格式发布。

## Migration Plan

1. 先落地杂项清理与构建注释（D1/D2），验证产物与类型。
2. 再落地静默滚动字段（D4）与分配优化（D5），基准与回归验证。
3. 回滚策略：各决策点相互独立，任一项基准劣化超阈值即单独 revert，不影响其余项。
