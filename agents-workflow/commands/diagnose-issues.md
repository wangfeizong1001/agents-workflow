---
name: diagnose-issues
description: 问题诊断
skill: investigate
trigger: /diagnose-issues
category: 调试类
---

## /diagnose-issues 命令

### 用法
/diagnose-issues [症状描述]

### 参数
- `--logs`: 日志文件路径
- `--metrics`: 性能指标
- `--history`: 历史记录

### 行为
1. 收集问题信息
2. 分析日志数据
3. 识别异常模式
4. 关联相关事件
5. 生成诊断报告

### 示例
```
/diagnose-issues "API 响应慢" --logs server.log --metrics performance.json
```

### 输出
问题诊断报告，包含根因分析和解决方案
