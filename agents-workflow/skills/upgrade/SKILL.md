---
name: upgrade
description: 框架版本升级
category: 框架类
allowed-tools: [Bash, Read, Write, Edit]
---

## upgrade

### 用途
Upgrade to the latest version. Detects global vs vendored install, runs the upgrade, and shows what's new.

### 使用方式
1. 检测当前版本
2. 检查最新版本
3. 执行升级
4. 显示变更日志
5. 验证升级成功

### 输入
- 无（或可选：特定版本）

### 输出
- 版本对比
- 升级日志
- 新功能列表

### 示例
```bash
# 检查当前版本
framework --version

# 升级到最新
framework upgrade

# 升级到特定版本
framework upgrade --version 2.0.0

# 显示新功能
framework changelog
```

```markdown
## 升级报告

### 版本
- 之前: 1.5.2
- 之后: 1.6.0

### 新功能
- ✨ 新增批量操作 API
- ✨ 支持自定义选择器
- 🐛 修复超时处理

### 破坏性变更
- ⚠️ `waitForSelector` 默认超时改为 30s
```
