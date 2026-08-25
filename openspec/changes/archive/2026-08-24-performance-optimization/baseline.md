# 变更前基线（2026-08-22，master@55f46d1 工作区）

## perf:test 基准（15 场景，happy-dom，单次值 + 均值）

| 场景 | mount | 滚动指标 |
|---|---|---|
| vertical_10k | 31.72ms (avg 34.67) | scrollMid=0.02ms (avg 0.037) / scrollDeep=0.03ms (avg 0.031) |
| vertical_50k | 106.10ms (avg 102.73) | scrollDeep=0.02ms (avg 0.039) |
| non_virtual_500 | 673.27ms (avg 671.10) | - |
| virtualX_30cols | 56.47ms (avg 59.43) | scrollX=0.01ms (avg 0.022) / scrollXY=0.02ms (avg 0.035) |
| virtualX_50cols | 53.72ms (avg 55.63) | scrollX=0.01ms (avg 0.021) |
| mergeCells_rowspan | 31.61ms (avg 36.46) | scrollMid=0.02ms (avg 0.026) |
| mergeCells_colspan | 28.81ms (avg 37.59) | scrollMid=0.01ms (avg 0.022) |
| mergeCells_mixed | 15.93ms (avg 16.29) | scrollMid=0.01ms (avg 0.020) |
| multi_header_3lvl | 14.37ms (avg 14.77) | scrollMid=0.01ms (avg 0.018) |
| merge+multiHeader | 13.14ms (avg 16.79) | scrollMid=0.01ms (avg 0.017) |
| merge+virtualX | 36.10ms (avg 36.54) | scrollXY=0.02ms (avg 0.028) |
| all_features | 25.21ms (avg 25.74) | scrollXY=0.02ms (avg 0.031) |
| autoRowHeight_10k | 70.60ms (avg 70.37) | scrollMid=0.04ms (avg 0.053) / scrollDeep=0.03ms (avg 0.046) |
| autoRowHeight_50k | 461.34ms (avg 437.22) | scrollDeep=0.25ms (avg 0.31) |
| autoRowHeight_setHeight | - | set100=0.70ms (avg 0.71) |

domNodes 基线：虚拟场景 44~80；non_virtual_500=5521。

## npm pack 基线

- package size: **212.7 kB**；unpacked size: **859.5 kB**；total files: **141**
- 待清理杂项：
  - `lib/test/**`（15 个 .d.ts，含 `lib/test/utils/*`）
  - `lib/src/StkTable/features/useAreaSelection.bak.d.ts`（1.6kB）
  - `src/StkTable/features/useAreaSelection.bak.ts`（35.8kB）

## 产物体积（参考，非验收指标）

- lib JS：stk-table-vue.js 24.1KB + StkTable-*.js 232.2KB + Dropdown-*.js 5.5KB（未压缩，gzip 约 69.6KB）
- lib/style.css 19.2KB（gzip 3.8KB）
