---
name: ui-review
description: UI 审查
skill: design-review
trigger: /ui-review
category: 审查类
---

## /ui-review 命令

### 用法
/ui-review [页面/组件]

### 参数
- `--accessibility`: 无障碍审查
- `--responsive`: 响应式审查
- `--consistency`: 一致性审查

### 行为
1. 截图当前界面
2. 分析视觉设计
3. 检查交互模式
4. 评估用户体验
5. 生成审查报告

### 示例
```
/ui-review dashboard --accessibility --responsive
```

### 输出
UI 审查报告，包含视觉问题和修复建议
