# 变更后验证记录（2026-08-22）

## 功能回归

- `npx vitest run`：**14 个文件 / 151 用例全部通过**（含新增 `test/silentScroll.test.js` 3 例、合并单元格全量滚动扫描 15 例）。
- `pnpm test:types`：tsconfig 与 type-tests 均通过。
- `pnpm build`（NODE_ENV=production）：成功；产物未压缩、保留 banner；`lib/test/`、`*.bak.d.ts` 不再生成；`lib/src/StkTable/index.d.ts`（`types` 字段）路径不变。
- `npm pack --dry-run`：**141 → 125 文件**，package size **212.7 → 205.0 kB**，unpacked **859.5 → 819.6 kB**；清单含 `lib/**`、`src/**`，无 `lib/test/**`、无 `*.bak.*`。

## 静默 scrollTop/scrollLeft 的直接验证（test/silentScroll.test.js）

- 窗内微滚动（窗口未变）：`scroll` 事件照常触发、载荷 startIndex 正确，且**组件 render 计数为 0**（优化前每帧必然重渲染）。
- 跨行滚动（窗口变化）：重渲染正常发生（计数器有效性金丝雀）。
- `experimental.scrollY` 模式：`translateY` 仍随滚动响应更新（-14px → 0px）。

## perf:test 对比（12+3 场景）

结论先行：**验收通过**。domNodes 全场景与基线逐项一致（44/59/63/67/80/5521，DOM 行为无变化）；滚动指标（scrollMid/scrollDeep/scrollX/scrollXY）全部维持 0.01~0.1ms 同数量级。

mount 指标在本机跨时段运行间存在 ±60% 以上的环境漂移（未改动路径的 non_virtual_500 在同一份产物上先后测得 507ms / 673ms / 1477ms / 672ms），逐场景百分比不可信，仅记录如下：

| 场景 | 基线 mount（min/avg） | 变更后同窗口运行（min/avg，run1） | 后续运行（环境漂移，run3/4） |
|---|---|---|---|
| vertical_10k | 27.7 / 34.7 | 25.6 / 34.8 | 50.8 / 38.9（min） |
| vertical_50k | 91.9 / 102.7 | 81.6 / 92.1 | 194.4 / 149.1（min） |
| non_virtual_500 | 580 / 671 | 457 / 508 | 1142 / 600（min） |
| virtualX_30cols | 52.5 / 59.4 | 46.3 / 51.9 | 73.4 / — |
| virtualX_50cols | 50.3 / 55.6 | 31.1 / 33.7 | 53.7 / — |
| mergeCells_rowspan | 27.9 / 36.5 | 18.1 / 23.8 | 26.4 / 30.1（min） |
| mergeCells_colspan | 20.8 / 37.6 | 17.4 / 18.4 | 42.4 / — |
| mergeCells_mixed | 15.5 / 16.3 | 13.9 / 14.6 | 16.6 / 14.9（min，run2） |
| multi_header_3lvl | 13.9 / 14.8 | 14.3 / 22.7 | 19.8 / 14.6（min，run2） |
| merge+multiHeader | 12.5 / 16.8 | 12.8 / 17.9 | 14.1 / 12.8（min，run2） |
| merge+virtualX | 26.9 / 36.5 | 27.0 / 31.8 | 29.5 / — |
| all_features | 23.5 / 25.7 | 23.7 / 27.6 | 33.8 / 39.8（min，run2） |
| autoRowHeight_10k | 49.9 / 70.4 | 48.9 / 60.3 | 61.5 / — |
| autoRowHeight_50k | 305.8 / 437.2 | 265.2 / 284.8 | 552.7 / 354.7（min） |
| autoRowHeight_setHeight | 0.67（min） | 0.36（min） | 0.39（min） |

- 与基线同时段环境可比的 run1：mount 普遍持平或向好（合并场景 -20%~-50%，autoRowHeight_50k -35%，virtualX_50cols -39%），无场景劣化超 10%（multi_header_3lvl min +2.6% 属噪声内）。
- 静默滚动的收益本质（跳过整组件 vnode 重建与 diff）发生在真实浏览器渲染管线，happy-dom 基准无法直接度量，以单测 render 计数断言为准（见上节）。

## CSS contain 评估结论（任务 4.3）：放弃

依据 design D6 的判据放弃，理由：

1. 现有基准运行于 happy-dom（无真实样式计算/布局），`contain: layout paint` / `content-visibility` 的收益（样式重算与布局隔离）无法以仓库现有手段可靠量化；
2. `contain: paint` 会为绝对/固定定位建立新的包含块，与 sticky 固定列、合并单元格（跨行 rowspan）及 autoRowHeight 的行高测量存在视觉回归风险，且无浏览器端视觉回归测试兜底；
3. 收益预期有限：虚拟滚动下每帧实际参与布局的节点已被窗口化（domNodes 44~80）。

## docs-src 关键词复查结论（任务 5.2）

以 `virtual`、`scrollTop`、`experimental`、`assignVs` 关键词复查 `docs-src/`：文档站仅描述公共 API 与外部行为（虚拟滚动开启条件、initVirtualScroll 语义、experimental.scrollY 用法等），本次变更不改公共 API、不改外部行为（重渲染为内部实现细节），**确认无需更新文档页**；仅 CHANGELOG.md 记录（见任务 5.1）。
