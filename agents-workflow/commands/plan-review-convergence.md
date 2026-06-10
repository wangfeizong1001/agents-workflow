---
name: plan-review-convergence
description: 计划审查收敛
skill: plan-eng-review
trigger: /plan-review-convergence
category: 审查类
---

## /plan-review-convergence 命令

### 用法
/plan-review-convergence [计划文件]

### 参数
- `--iterations`: 收敛迭代次数
- `--threshold`: 收敛阈值
- `--stakeholders`: 审查参与者

### 行为
1. 分析当前计划状态
2. 识别分歧点
3. 引导收敛讨论
4. 更新计划
5. 验证收敛结果

### 示例
```
/plan-review-convergence project-plan.md --iterations 3 --threshold 80%
```

### 输出
收敛后的计划和收敛报告
