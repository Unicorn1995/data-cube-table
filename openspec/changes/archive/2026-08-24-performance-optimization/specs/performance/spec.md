# performance 规格（delta）

## Purpose

定义包体积控制与滚动渲染性能的行为契约：npm 发布产物形态与包内容约束、滚动窗口未变帧的零重渲染行为，以及性能基准防回退的验收要求，保证优化不改变表格既有功能行为。

## ADDED Requirements

### Requirement: 发布产物保持未压缩 ESM 形态

包的 JS 发布产物 SHALL 保持未压缩的可读 ESM 形态（构建配置 `minify` 维持关闭并固化该决策）；压缩与 tree-shaking 由消费方构建工具（Vite/Rspack 等）完成，发布流程 MUST NOT 对产物做压缩处理。

#### Scenario: 产物为未压缩可读 ESM

- **WHEN** 执行生产构建并检查 `lib/` 下的 JS 产物
- **THEN** 产物为未压缩的可读代码，保留版本 banner 注释，且可被消费方打包器正常解析与 tree-shake

#### Scenario: 消费方构建时完成压缩

- **WHEN** 使用方通过 Vite/Rspack 等脚手架引入本组件库并执行生产构建
- **THEN** 进入最终应用的代码由使用方构建链压缩，最终体积不受本库发布形态影响

### Requirement: npm 包发布双形态且不含杂项

包的 `files` 发布范围 SHALL 同时包含 `lib` 运行产物（JS、CSS、类型声明）与 `src` 源码目录（供 Vue 2.7 消费方直接使用源码、经自身编译链构建），MUST NOT 包含测试目录的类型声明（如 `lib/test/`）与备份文件（如 `*.bak.ts`、`*.bak.d.ts`）。

#### Scenario: 包内容清单检查

- **WHEN** 执行 `npm pack --dry-run` 查看包内容
- **THEN** 内容含 `lib/**` 与 `src/**`，不含 `lib/test/**`、`*.bak.ts`、`*.bak.d.ts`

#### Scenario: 主入口与源码路径同时可用

- **WHEN** 使用方分别以 `import { StkTable } from 'stk-table-vue'`（Vue 3 产物）与 deep import `stk-table-vue/src/**` 源码路径（Vue 2.7）引入
- **THEN** 两种路径均正常解析，`types` 字段与 `lib/style.css` 引用不受影响

### Requirement: 滚动窗口未变的滚动帧不触发重渲染

当滚动位置变化但可视行/列范围（startIndex/endIndex）未变时，组件 SHALL 不因该滚动触发组件重渲染；`scroll`/`scroll-x` 事件载荷、自定义滚动条位置、固定列阴影等外部可见行为 MUST 与优化前保持一致。relative 固定模式下若样式依赖滚动位置，SHALL 通过显式驱动保持行为一致。

#### Scenario: 窗内微滚动外部行为不变

- **WHEN** 虚拟滚动表格在可视行窗口内微滚（窗口未变化）并持续触发 scroll 事件
- **THEN** `scroll` 事件正常触发且载荷（startIndex/endIndex）正确，自定义滚动条滑块位置正确更新，行内容与样式无变化

#### Scenario: 横向滚动固定列表现正常

- **WHEN** 开启固定列（sticky 与 relative 两种模式）横向滚动经过固定列边界
- **THEN** 固定列阴影按显式驱动的时机正确显隐，固定列样式与阴影行为与优化前一致

### Requirement: 滚动性能基准防回退

仓库 SHALL 提供可重复运行的性能基准（`test/perf` 既有 12 场景），作为涉及渲染/滚动路径改动的验收手段：基准 MUST 可通过既有 pnpm 脚本一键运行并输出各场景指标；本变更落地时全部场景的关键指标相对变更前基线劣化 MUST NOT 超过 10%。

#### Scenario: 基准可一键运行

- **WHEN** 在仓库内运行性能基准脚本
- **THEN** 输出 12 个场景各自的关键性能指标，可前后对比

#### Scenario: 优化不引起基准回退

- **WHEN** 本变更全部任务完成并运行基准
- **THEN** 每个场景指标不劣于变更前基线 10% 以上，优化场景（纵向滚动、全功能）应有可测量的改善
