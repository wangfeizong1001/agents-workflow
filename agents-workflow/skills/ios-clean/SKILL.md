---
name: ios-clean
description: 移除 iOS debug bridge
category: iOS 相关类
allowed-tools: [Bash, Read, Write, Edit]
---

## ios-clean

### 用途
Remove the DebugBridge SPM package and all #if DEBUG wiring from an iOS app. Cleans up StateServer, DebugOverlay, accessor codegen output, and app-side hooks.

### 使用方式
1. 检测 DebugBridge 引用
2. 移除 SPM 依赖
3. 清理 #if DEBUG 代码
4. 移除 StateServer
5. 清理 DebugOverlay
6. 验证构建

### 输入
- iOS 项目路径
- 可选：保留选项

### 输出
- 清理后的代码
- 移除的文件列表
- 构建验证

### 示例
```bash
# 清理 debug bridge
ios-clean --project /path/to/project

# 输出
✅ DebugBridge 清理完成
- 移除 SPM 依赖: 1
- 清理 #if DEBUG: 15 处
- 移除 StateServer: 1 文件
- 清理 DebugOverlay: 1 文件
- 构建验证: ✅
```
