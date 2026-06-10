---
name: browse
description: 无头浏览器交互：导航、截图、填表、网络捕获
category: 质量保障类
allowed-tools: [Bash, Read, Write, Edit]
---

## browse

### 用途
快速无头浏览器，用于 QA 测试和站点 dogfooding。可导航页面、与元素交互、验证状态、拍摄带注释的截图、测试响应式布局、处理表单和上传、捕获 bug 证据。每次命令约 100ms。

### 使用方式
1. 使用 `playwright_browser_navigate` 导航到目标 URL
2. 使用 `playwright_browser_snapshot` 获取页面快照
3. 使用 `playwright_browser_click`、`playwright_browser_fill_form` 等与页面交互
4. 使用 `playwright_browser_take_screenshot` 捕获视觉证据

### 输入
- URL 地址或页面选择器
- 交互动作描述（点击、填写等）

### 输出
- 页面快照（accessibility snapshot）
- 截图文件（PNG/JPEG）
- 网络请求日志
- 控制台消息

### 示例
```bash
# 导航到页面并截图
playwright_browser_navigate(url="https://example.com")
playwright_browser_take_screenshot(type="png", filename="homepage.png")

# 填写表单
playwright_browser_snapshot()
playwright_browser_fill_form(fields=[
  {target: "input[name='email']", name: "email", type: "textbox", value: "test@example.com"}
])

# 捕获网络请求
playwright_browser_network_requests(static=false)
```
