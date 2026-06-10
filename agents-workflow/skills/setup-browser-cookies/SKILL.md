---
name: setup-browser-cookies
description: 从真实浏览器导入 cookie
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## setup-browser-cookies

### 用途
Import cookies from your real Chromium browser into the headless browse session. Opens an interactive picker UI where you select which cookie domains to import. Use before QA testing authenticated pages.

### 使用方式
1. 检测本地 Chromium 浏览器
2. 读取 cookie 存储
3. 显示域名选择器
4. 导入选定的 cookie
5. 验证导入成功

### 输入
- 可选：特定域名
- 可选：cookie 过滤条件

### 输出
- 导入的 cookie 列表
- 验证结果
- 浏览器会话配置

### 示例
```bash
# 导入所有域名的 cookie
setup-browser-cookies

# 导入特定域名
setup-browser-cookies --domains "example.com,api.example.com"

# 输出
✅ Cookie 导入完成
- 域名数: 5
- Cookie 数: 23
- 已验证: 21/23
```
