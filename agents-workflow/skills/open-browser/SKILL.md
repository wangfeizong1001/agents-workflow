---
name: open-browser
description: 启动可见 AI 控制浏览器窗口
category: 工具类
allowed-tools: [Bash, Read, Write, Edit]
---

## open-browser

### 用途
启动 Browser——内置侧边栏扩展的 AI 控制 Chromium。打开一个可见的浏览器窗口，你可以实时观察每个动作。侧边栏显示实时活动 feed 和聊天。

### 使用方式
1. 启动浏览器实例
2. 打开可见窗口
3. 显示侧边栏
4. 开始 AI 控制
5. 实时监控活动

### 输入
- 初始 URL（可选）
- 窗口大小（可选）
- 侧边栏选项

### 输出
- 可见浏览器窗口
- 侧边栏界面
- 实时活动 feed

### 示例
```bash
# 启动浏览器
open-browser

# 指定 URL
open-browser --url "https://example.com"

# 窗口大小
open-browser --width 1280 --height 720

# 输出
✅ 浏览器已启动
- 窗口: 可见
- 侧边栏: 已启用
- AI 控制: 就绪
```
