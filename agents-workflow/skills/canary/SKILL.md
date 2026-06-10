---
name: canary
description: 部署后生产监控：控制台错误、性能回归、截图比对
category: 交付部署类
allowed-tools: [Bash, Read, Write, Edit]
---

## canary

### 用途
部署后金丝雀监控。使用浏览器守护进程观察线上 app 的控制台错误、性能回归和页面失败。定期截图、与部署前基线对比，并在异常时告警。

### 使用方式
1. 连接到生产环境
2. 监控控制台错误
3. 测量性能指标
4. 截图关键页面
5. 与基线对比
6. 异常时告警

### 输入
- 生产环境 URL
- 基线截图（可选）
- 监控间隔（默认 5 分钟）

### 输出
- 控制台错误日志
- 性能指标（LCP、INP、CLS）
- 截图时间线
- 异常告警

### 示例
```markdown
## 金丝雀报告 - 2024-01-15

### 控制台错误
- ❌ 14:32:05 - TypeError: Cannot read property 'map' of undefined
- ❌ 14:35:12 - NetworkError: Failed to fetch

### 性能指标
- LCP: 2.3s (基线: 1.8s) ⚠️ +27%
- INP: 120ms ✅
- CLS: 0.05 ✅

### 截图对比
- homepage-before.png vs homepage-after.png
- 差异: 导航栏样式变化
```
