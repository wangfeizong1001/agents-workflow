---
name: ios-qa
description: 真实设备上的 iOS QA
category: iOS 相关类
allowed-tools: [Bash, Read, Write, Edit]
---

## ios-qa

### 用途
真实设备上的 iOS QA（针对 SwiftUI app）。通过 USB CoreDevice IPv6 隧道连接真实 iPhone，读取 Swift 源码以理解每个屏幕，然后运行由视觉驱动的 agent 循环：截图 → 分析 → 决策 → 行动 → 验证 → 重复。

### 使用方式
1. 连接到真实 iPhone
2. 安装测试 app
3. 读取 Swift 源码
4. 截图当前状态
5. 分析 UI 问题
6. 执行交互操作
7. 验证结果

### 输入
- Swift 项目路径
- 设备标识符
- 测试用例

### 输出
- 截图序列
- UI 问题报告
- 交互日志
- 修复建议

### 示例
```markdown
## iOS QA 报告

### 设备信息
- 设备: iPhone 15 Pro
- 系统: iOS 17.2
- App 版本: 1.0.0

### 测试结果
1. ✅ 登录流程正常
2. ⚠️ 表单提交后无反馈
3. ❌ 设置页面崩溃

### 截图
- login-success.png
- form-no-feedback.png
- settings-crash.png
```
