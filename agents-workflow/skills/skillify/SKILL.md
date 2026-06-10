---
name: skillify
description: 流程编纂为永久浏览器技能
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## skillify

### 用途
把最近一次成功的 /scrape 流程编纂为磁盘上永久的 browser-skill。以后用相同意图调用的 /scrape 会以编纂后的脚本运行（约 200ms），而不是重新驱动页面。

### 使用方式
1. 回顾最近的 scrape 流程
2. 合成脚本代码
3. 生成测试用例
4. 运行测试验证
5. 保存为永久技能

### 输入
- 最近的 scrape 会话
- 可选：自定义选项

### 输出
- script.ts（编纂脚本）
- script.test.ts（测试）
- fixture（测试数据）
- 技能注册

### 示例
```typescript
// script.ts
export async function scrapeProducts() {
  const browser = await launch();
  await browser.goto('https://example.com/products');
  
  const products = await browser.$$eval('.product-card', cards =>
    cards.map(card => ({
      name: card.querySelector('.name')?.textContent,
      price: card.querySelector('.price')?.textContent,
    }))
  );
  
  return products;
}
```
