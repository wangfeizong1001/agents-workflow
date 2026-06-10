---
name: eval-review
description: 评估审查
skill: review
trigger: /eval-review
category: 审查类
---

## /eval-review 命令

### 用法
/eval-review [评估对象]

### 参数
- `--criteria`: 评估标准
- `--weight`: 权重配置
- `--benchmark`: 基准比较

### 行为
1. 定义评估维度
2. 收集评估数据
3. 计算评估分数
4. 与基准比较
5. 生成评估报告

### 示例
```
/eval-review api-performance --criteria latency,throughput --benchmark production
```

### 输出
评估报告，包含分数、比较结果和改进建议
