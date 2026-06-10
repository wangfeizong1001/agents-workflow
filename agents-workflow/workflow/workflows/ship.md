---
name: 发布
description: 发布项目到生产环境
stages: [准备, 发布, 验证]
estimated-time: 30分钟
category: 日常类
---

## 发布

> **触发条件**：代码准备发布到生产环境时使用
> **预计耗时**：30分钟
> **产出物**：生产环境部署

### 阶段 1：准备（10分钟）

- ① ship → 准备发布
- ② verification-before-completion → 最终验证
- 门禁：发布准备就绪

### 阶段 2：发布（15分钟）

- ① land-and-deploy → 执行部署
- ② canary → 金丝雀监控
- 门禁：部署成功

### 阶段 3：验证（5分钟）

- ① health → 健康检查
- ② stats → 查看发布统计
- 门禁：发布验证通过

### 回滚方案
- 使用 canary 监控并准备回滚