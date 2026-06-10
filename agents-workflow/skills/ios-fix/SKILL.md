---
name: ios-fix
description: 自动化 iOS bug 修复
category: iOS 相关类
allowed-tools: [Bash, Read, Write, Edit]
---

## ios-fix

### 用途
Autonomous iOS bug fixer. Takes a bug found by /ios-qa, reads the source, writes the fix, rebuilds, redeploys, and verifies the fix on the real device. Closes the loop: find bug → fix bug → confirm fix.

### 使用方式
1. 接收 bug 报告
2. 读取相关 Swift 源码
3. 定位问题代码
4. 编写修复
5. 重新构建
6. 重新部署
7. 验证修复

### 输入
- Bug 报告
- 相关文件路径
- 复现步骤

### 输出
- 修复代码
- 重新部署状态
- 验证结果

### 示例
```markdown
## iOS Bug 修复

### Bug
- 现象: 设置页面崩溃
- 原因: 强制解包 nil 值
- 位置: SettingsView.swift:42

### 修复
```swift
// 修复前
let value = dictionary["key"]!

// 修复后
let value = dictionary["key"] ?? "default"
```

### 验证
- 重新构建: ✅
- 重新部署: ✅
- 崩溃消失: ✅
```
