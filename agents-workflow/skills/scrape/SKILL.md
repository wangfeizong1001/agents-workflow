---
name: scrape
description: 网页数据抓取，可编纂为持久脚本
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## scrape

### 用途
Pull data from a web page. First call on a new intent prototypes the flow via primitives and returns JSON. Subsequent calls on a matching intent route to a codified browser-skill and return in ~200ms. Read-only.

### 使用方式
1. 导航到目标页面
2. 选择数据提取策略
3. 执行抓取
4. 返回 JSON 数据
5. 可选：编纂为持久脚本

### 输入
- URL
- 数据选择器
- 可选：抓取选项

### 输出
- JSON 数据
- 抓取元数据
- 可选：持久脚本

### 示例
```bash
# 抓取产品列表
scrape --url "https://example.com/products" \
  --selector ".product-card" \
  --fields "name,price,rating"

# 输出
[
  {
    "name": "产品 A",
    "price": "¥99",
    "rating": "4.5"
  },
  ...
]
```
