---
name: cleanup
description: 清理
skill: apply-change
trigger: /cleanup
category: 工具类
---

## /cleanup 命令

### 用法
/cleanup [清理范围]

### 参数
- `--dry-run`: 模拟清理
- `--aggressive`: 深度清理
- `--preserve`: 保留项

### 行为
1. 扫描待清理项目
2. 分类整理
3. 执行清理操作
4. 验证清理结果
5. 生成清理报告

### 示例
```
/cleanup --dry-run
/cleanup --aggressive --preserve node_modules
```

### 输出
清理报告和释放空间统计
