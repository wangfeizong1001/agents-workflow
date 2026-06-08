# 云枢 (YunShou) · @agents-workflow/yunshou · v0.1.0

> AI 编程工作流框架 —— 统一规格、计划、执行、验证。

## 30 秒上手

```bash
bun add -D @agents-workflow/yunshou   # 或 npm i -D
bunx yunshou init                     # 初始化工作区
bunx yunshou install opencode         # 安装 OpenCode 适配器
bunx yunshou spec create --id s1 --title "示例" --date 2026-06-07 --author me \
  --problem "..." --goal "..." --non-goals "..." --decisions "..." --scenarios "..." --risks "..."
bunx yunshou plan create --id p1 --title t --spec-id s1 --from plan.md
bunx yunshou execute next --plan-id p1
bunx yunshou verify all
```

## 命令清单

| 命令 | 用途 |
|------|------|
| `yunshou init` | 初始化 `.yunshou/` 工作区 |
| `yunshou status` | 查看工作区状态 |
| `yunshou install <adapter>` | 安装 IDE 适配器 (v0.1: `opencode`) |
| `yunshou uninstall <adapter>` | 卸载 IDE 适配器 |
| `yunshou spec create` | 创建规格 |
| `yunshou spec advance` | 推进规格阶段 |
| `yunshou plan create` | 从 Markdown 创建计划 |
| `yunshou plan next` | 下一个可执行任务 |
| `yunshou execute next` | 生成下一个任务提示词 |
| `yunshou execute complete` | 标记任务完成 |
| `yunshou verify all` | 跑 5 层验证 |
| `yunshou verify report` | 输出 JSON 报告 |
| `yunshou mcp` | 启动 MCP 服务器 (stdio) |

## 工作流 4 阶段

1. **spec** — `draft → review → approved → archived`,由 `SpecGuard` 守门。
2. **plan** — 从 Markdown 拆任务,DAG 拓扑排序。
3. **execute** — 选下一个 ready 任务,生成可贴进 IDE 的提示词。
4. **verify** — 5 层:lint / typecheck / test / build / spec-compliance。

## 状态机

任务有 8 个状态:`backlog → ready → in_progress → blocked → review → done / failed / cancelled`。

## 故障排查

- **`yunshou init` 报"已存在"**: 删除 `.yunshou/` 后重试。
- **JSONL 损坏**: 删除 `.yunshou/events.jsonl`,新文件将自动创建。
- **5 层验证失败**: 启动 `yunshou-reviewer` 子代理 (`.opencode/agents/yunshou-reviewer.md`) 复盘。

## 许可

MIT
