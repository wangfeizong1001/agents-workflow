---
name: audit-uat
description: UAT 审计
skill: qa
trigger: /audit-uat
category: 项目类
---

## /audit-uat 命令

### 用法
/audit-uat [功能模块]

### 参数
- `--test-cases`: 测试用例文件
- `--environment`: 测试环境
- `--report`: 报告格式

### 行为
1. 加载测试用例
2. 执行 UAT 测试
3. 记录测试结果
4. 分析测试问题
5. 生成 UAT 报告

### 示例
```
/audit-uat user-management --test-cases uat-cases.md --environment staging
```

### 输出
UAT 审计报告，包含测试结果和问题列表
