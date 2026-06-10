---
name: document-release
description: 发布后文档同步更新
category: 文档类
allowed-tools: [Bash, Read, Write, Edit]
---

## document-release

### 用途
发布后文档更新。读取项目所有文档、与 diff 交叉对照、构建 Diataxis 覆盖图、更新 README/ARCHITECTURE/CONTRIBUTING 以匹配已发布内容。

### 使用方式
1. 分析发布的变更
2. 检查现有文档覆盖
3. 识别文档差距
4. 更新受影响的文档
5. 同步版本信息

### 输入
- 发布的变更内容
- 现有文档
- CHANGELOG

### 输出
- 更新后的文档
- 文档覆盖报告
- 版本同步确认

### 示例
```markdown
## 文档更新报告

### 变更分析
- 新增 API: POST /api/users/avatar
- 修改 API: GET /api/users (添加分页)

### 文档更新
- ✅ API.md: 添加 avatar 端点
- ✅ README.md: 更新功能列表
- ⚠️ CHANGELOG.md: 需要添加条目

### 覆盖率
- Tutorial: 85%
- How-to: 70%
- Reference: 90%
- Explanation: 60%
```
