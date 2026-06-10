---
name: ios-sync
description: 同步 iOS debug bridge
category: iOS 相关类
allowed-tools: [Bash, Read, Write, Edit]
---

## ios-sync

### 用途
根据最新的上游模板重新生成 iOS debug bridge。更新 StateServer.swift、DebugOverlay.swift、Package.swift，以及带类型的 @Observable 状态访问器。

### 使用方式
1. 检查当前版本
2. 下载最新模板
3. 更新 StateServer
4. 更新 DebugOverlay
5. 更新 Package.swift
6. 重新生成访问器

### 输入
- 项目路径
- 可选：模板版本

### 输出
- 更新后的文件
- 版本信息
- 验证结果

### 示例
```bash
# 同步 debug bridge
ios-sync --project /path/to/project

# 输出
✅ iOS debug bridge 已同步
- StateServer.swift: 已更新
- DebugOverlay.swift: 已更新
- Package.swift: 已更新
- 访问器: 已重新生成
- 版本: 2.1.0
```
