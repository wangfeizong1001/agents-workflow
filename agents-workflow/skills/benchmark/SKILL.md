---
name: benchmark
description: 性能回归检测：LCP、INP、CLS
category: 回顾类
allowed-tools: [Bash, Read, Write, Edit]
---

## benchmark

### 用途
Performance regression detection using the browse daemon. Establishes baselines for page load times, Core Web Vitals, and resource sizes. Compares before/after on every PR.

### 使用方式
1. 建立性能基线
2. 测量 Core Web Vitals
3. 对比 PR 前后
4. 检测回归
5. 生成报告

### 输入
- 目标 URL
- 基线数据（可选）
- 测试配置

### 输出
- 性能报告
- Core Web Vitals
- 回归检测结果

### 示例
```markdown
## 性能报告

### Core Web Vitals
| 指标 | 基线 | 当前 | 状态 |
|------|------|------|------|
| LCP | 1.8s | 2.1s | ⚠️ +17% |
| INP | 80ms | 75ms | ✅ -6% |
| CLS | 0.05 | 0.04 | ✅ -20% |

### 资源大小
- JS: 245KB → 260KB (+6%)
- CSS: 45KB → 42KB (-7%)
- 图片: 1.2MB → 1.1MB (-8%)

### 回归
- ⚠️ LCP 增加 17%，建议检查 LCP 元素加载
```
