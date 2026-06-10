---
name: land-and-deploy
description: 合并 PR → 等待 CI → 金丝雀检查 → 验证生产
category: 交付部署类
allowed-tools: [Bash, Read, Write, Edit]
---

## land-and-deploy

### 用途
合并与部署工作流。合并 PR、等待 CI 通过、执行金丝雀检查验证生产环境健康。在 /ship 创建 PR 之后接管流程。

### 使用方式
1. 合并 PR（使用 gh pr merge）
2. 监控 CI 状态
3. 等待部署完成
4. 执行金丝雀检查
5. 验证生产环境健康

### 输入
- PR 编号
- 部署配置（来自 setup-deploy）
- 可选：生产环境 URL

### 输出
- 合并状态
- CI 通过确认
- 金丝雀检查报告
- 生产环境验证结果

### 示例
```bash
# 合并 PR
gh pr merge 123 --merge

# 等待 CI
gh pr checks 123 --watch

# 金丝雀检查
curl -s https://production.example.com/health | jq .

# 验证部署
playwright_browser_navigate(url="https://production.example.com")
playwright_browser_take_screenshot(type="png")
```
