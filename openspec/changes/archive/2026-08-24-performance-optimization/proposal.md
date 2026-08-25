# 性能与包体积优化（performance-optimization）

## Why

1. **包体积**：npm 包内混入非必要文件——`lib/test/*.d.ts` 类型杂项、`src/StkTable/features/useAreaSelection.bak.ts` 遗留备份（随之生成 `.bak.d.ts`）。`src` 目录本身必须发布（Vue 2.7 消费方需直接使用源码、经自身编译链构建），产物形态保持未压缩 ESM——消费方（Vite/Rspack 等脚手架）构建时自会压缩与摇树，发布层压缩对最终应用体积无收益。
2. **渲染帧成本**：滚动重算路径（Fenwick 树定位、`assignVs` 变更检测、rAF 合并）已多轮优化，但每次滚动帧 `triggerRef(virtualScroll)` 仍触发组件整体 re-render——而滚动窗口（startIndex/endIndex）未变的帧（窗内微滚动、横向滚动）本可完全不触发渲染；`getTRProps`/`getTDProps`/`getTHProps` 每行每格新建对象与 class 数组，加重 GC 压力。瓶颈在渲染帧本身。
3. 需要用已有的 `test/perf` 基准（12 场景）作为验收门槛，防止优化互相回退。

## What Changes

### 1. 发布内容清理（非破坏）

- **保持产物未压缩**：`minify: false` 维持不变并在构建配置注释固化决策。
- `files: ["lib","src"]` 与 `sideEffects` 维持现状不动（`src` 为 Vue 2.7 消费方必需路径）。
- 删除遗留备份 `src/StkTable/features/useAreaSelection.bak.ts`（git 历史可找回）；收窄 `vite-plugin-dts` 生成范围，`lib/test/` 与 `*.bak.d.ts` 不再生成与发布。

### 2. 滚动帧渲染优化（默认生效，无新 API）

- **静默 scrollTop/scrollLeft**：滚动窗口未变的帧，滚动位置字段写入 store 但不触发 `triggerRef`，组件不再整体 re-render；固定列阴影、自定义滚动条等改为在滚动处理链中显式驱动。外部可见行为（DOM、事件、滚动条）保持不变。
- 内部优化（无行为变化）：`getTDProps`/`getTHProps` 的 class 由数组改为预拼接字符串；`mergeCellsWrapper` 返回值记忆化（仅 `col.mergeCells` 列）。
- CSS `contain` 布局隔离评估：A/B 基准收益不足或与 sticky 固定列/合并单元格有冲突即放弃并记录结论。

### 3. 滚动性能防回退

- 以 `test/perf` 既有基准（`pnpm perf` / `pnpm perf:test`，12 场景）作为验收门槛：全部场景关键指标劣化不得超过 10%。

### 文档同步范围（按仓库规则登记）

- `CHANGELOG.md`：记录发布内容清理与滚动帧渲染优化（对外非破坏）。
- 以 `virtual`、`scrollTop`、`experimental` 关键词复查 `docs-src/`：本次不改变公共 API 与外部行为，预期无需更新文档页，复查确认后记录结论。

## Capabilities

### New Capabilities

- `performance`: 包内容与产物形态约束、滚动窗口未变帧的零重渲染行为、滚动性能基准防回退要求。

### Modified Capabilities

（无——custom-cells 子路径按需导出经评估收益有限（CSS 仅约 3~4KB、JS 可被消费方摇树），从本变更裁剪。）

## Impact

- **构建/发布**：`vite.config.ts`（dts 生成范围；`minify` 维持关闭并注释决策）。
- **源码**：`src/StkTable/useVirtualScroll.ts`（assignVs 静默字段）、`src/StkTable/StkTable.vue`（滚动处理链显式驱动适配）、`src/StkTable/useMergeCells.ts`（mergeCellsWrapper 记忆化）；删除 `src/StkTable/features/useAreaSelection.bak.ts`。
- **公共 API**：无新增、无变更、无移除。
- **测试**：`test/perf` 基准作为验收门槛；新增窗内滚动行为一致性单测；`pnpm test:types` 验证类型产物。
- **文档**：`CHANGELOG.md`；`docs-src/` 关键词复查（预期无需更新）。
