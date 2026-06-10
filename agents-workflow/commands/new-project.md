---
name: new-project
description: 新建项目
skill: writing-plans
trigger: /new-project
category: 项目类
---

## /new-project 命令

### 用法
/new-project [项目名称]

### 参数
- `--template`: 项目模板
- `--init`: 初始化选项
- `--remote`: 远程仓库配置

### 行为
1. 创建项目目录结构
2. 初始化版本控制
3. 配置项目设置
4. 创建基础文档
5. 设置开发环境

### 示例
```
/new-project my-saas --template typescript --init git
```

### 输出
新项目目录和初始化文件
