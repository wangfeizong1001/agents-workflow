---
name: design-html
description: 生产质量 Pretext HTML/CSS
category: 设计类
allowed-tools: [Bash, Read, Write, Edit]
---

## design-html

### 用途
设计定稿：生成生产质量的 Pretext-native HTML/CSS。文本实际回流，高度被计算，布局是动态的。30KB 开销，零依赖。智能 API 路由：为每种设计类型选择正确的 Pretext 模式。

### 使用方式
1. 收集设计需求
2. 选择 Pretext 模式
3. 编写语义化 HTML
4. 应用 CSS 样式
5. 验证响应式布局
6. 输出生产代码

### 输入
- 设计稿或描述
- 布局要求
- 响应式断点
- 可选：交互需求

### 输出
- HTML 文件
- CSS 文件
- 响应式布局
- 无依赖生产代码

### 示例
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>产品页面</title>
  <style>
    :root {
      --primary: #2563EB;
      --spacing: 16px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    @media (max-width: 768px) {
      .container { padding: 0 var(--spacing); }
    }
  </style>
</head>
<body>
  <!-- 生产质量 HTML -->
</body>
</html>
```
