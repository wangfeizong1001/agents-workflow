---
name: framework
description: 浏览器自动化引擎（核心依赖）
category: 框架类
allowed-tools: [Bash, Read, Write, Edit]
---

## framework

### 用途
Fast headless browser for QA testing and site dogfooding. Navigate pages, interact with elements, verify state, diff before/after, take annotated screenshots, test responsive layouts, forms, uploads, dialogs, and capture bug evidence.

### 使用方式
1. 初始化浏览器实例
2. 导航到目标页面
3. 与元素交互
4. 验证页面状态
5. 截图和记录

### 输入
- URL 或页面选择器
- 交互动作
- 验证条件

### 输出
- 页面状态
- 截图
- 网络日志
- 控制台消息

### 示例
```typescript
// 初始化
const browser = await framework.launch();

// 导航
await browser.goto('https://example.com');

// 交互
await browser.click('button#submit');
await browser.fill('input[name="email"]', 'test@example.com');

// 验证
const title = await browser.title();
expect(title).toBe('Example');

// 截图
await browser.screenshot({ path: 'screenshot.png' });
```
