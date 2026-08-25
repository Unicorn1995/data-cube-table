# 性能与包体积优化 — 任务清单

## 1. 基线记录

- [x] 1.1 运行 `pnpm perf:test` 记录变更前 12 场景基准数据，与 `npm pack --dry-run` 清单一并存入本变更目录（`baseline.md`），作为验收对照基线

## 2. 发布内容清理（design D1/D2）

- [x] 2.1 在 `vite.config.ts` 注释固化「产物不压缩」决策（`minify` 维持关闭），说明压缩与摇树由消费方脚手架完成，防止后续误开
- [x] 2.2 删除遗留备份 `src/StkTable/features/useAreaSelection.bak.ts`（确认无引用；git 历史可找回）
- [x] 2.3 收窄 `vite-plugin-dts` 生成范围，确认 `lib/test/` 与 `*.bak.d.ts` 不再生成、`types` 路径（`lib/src/StkTable/index.d.ts`）不变；确认 `files: ["lib","src"]` 与 `sideEffects` 维持现状不动
- [x] 2.4 构建产物验证：`npm pack --dry-run` 清单含 `lib/**`、`src/**`，不含 `lib/test/**`、`*.bak.*`；产物保持未压缩 ESM 且保留 banner；`pnpm test:types` 通过

## 3. 滚动帧优化：静默 scrollTop/scrollLeft（design D4，默认生效）

- [x] 3.1 核实 `useFixedStyle`（`cellStyleMap` computed 调用链）是否以响应式方式读取 `scrollLeft`/`scrollTop`，确定静默策略（无条件静默或 relative 模式例外）
- [x] 3.2 `useVirtualScroll.ts` 的 `assignVs` 支持静默字段：`scrollTop`/`scrollLeft` 写入 store 但不触发 `triggerRef`，在 `VirtualScrollStore` 类型与实现处注释约束「不得以响应式方式依赖」
- [x] 3.3 适配与验证滚动处理链中的显式驱动（`updateFixedShadow`、`updateCustomScrollbar`）：窗内滚动时固定列阴影、自定义滚动条行为不变
- [x] 3.4 新增单测：窗内微滚动（窗口未变）时 `scroll`/`scroll-x` 事件载荷与滚动条位置仍正确更新；`experimental.scrollY` 模式 `translateY` 仍随滚动响应
- [x] 3.5 基准复测：纵向（10k/50k）与横向场景帧耗时对比 1.1 基线，确认窗内滚动零重渲染生效

## 4. 渲染分配与 CSS 评估（design D5/D6）

- [x] 4.1 `getTDProps`/`getTHProps` 的 class 数组改为预拼接字符串
- [x] 4.2 `mergeCellsWrapper` 返回值按 `(row, col)` 记忆化（仅 `col.mergeCells` 列，与 `mergeCellsCache` 代际联动失效）
- [x] 4.3 CSS `contain`/`content-visibility` 评估：如无法可靠验证收益或存在 sticky/合并视觉回归风险即放弃，并在变更记录中写明结论
- [x] 4.4 逐项基准复测 4.1–4.3，无收益或劣化的项回退并记录

## 5. 文档同步（独立于代码任务）

- [x] 5.1 `CHANGELOG.md`：记录发布内容清理与滚动帧渲染优化（对外非破坏）
- [x] 5.2 以 `virtual`、`scrollTop`、`experimental` 关键词复查 `docs-src/`，确认无需更新文档页（本次不改公共 API 与外部行为），在变更目录记录复查结论

## 6. 总验收

- [x] 6.1 `pnpm build`、`pnpm test` 全量、`pnpm test:types` 全部通过
- [x] 6.2 `pnpm perf:test` 12 场景对比 1.1 基线：劣化 ≤ 10%，优化场景有可测量改善；前后数据写入本变更目录（`perf-results.md`）
- [x] 6.3 完成标准自查：以 `scrollTop`、`assignVs`、`useAreaSelection.bak`、`dts` 关键词复查改动范围与 `docs-src/`，确认同步完整
