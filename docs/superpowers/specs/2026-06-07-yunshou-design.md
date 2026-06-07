# 云枢 (YunShou) 工作流框架 - 设计规格说明书

> **状态**: 待用户审查
> **创建日期**: 2026-06-07
> **作者**: 头脑风暴技能 + 用户
> **范围**: v0.1 核心引擎（spec/plan/execute/verify + Memory/Task/Knowledge + OpenCode 适配）

---

## 目录

- [1. 背景与目标](#1-背景与目标)
- [2. 关键决策摘要](#2-关键决策摘要)
- [3. 总体架构](#3-总体架构)
- [4. 项目目录结构](#4-项目目录结构)
- [5. 核心数据模型](#5-核心数据模型)
- [6. 横向子系统](#6-横向子系统)
  - [6.1 Memory 子系统](#61-memory-子系统)
  - [6.2 Task 子系统](#62-task-子系统)
  - [6.3 Knowledge Base 子系统](#63-knowledge-base-子系统)
- [7. 4 大引擎](#7-4-大引擎)
  - [7.1 Spec Engine](#71-spec-engine)
  - [7.2 Plan Engine](#72-plan-engine)
  - [7.3 Execute Engine](#73-execute-engine)
  - [7.4 Verify Engine](#74-verify-engine)
- [8. OpenCode 适配器](#8-opencode-适配器)
- [9. CLI 与 MCP 接口](#9-cli-与-mcp-接口)
- [10. 错误处理](#10-错误处理)
- [11. 测试策略](#11-测试策略)
- [12. v0.1 交付清单](#12-v01-交付清单)
- [13. 借鉴与超越](#13-借鉴与超越)
- [14. 反模式与不做事项](#14-反模式与不做事项)

---

## 1. 背景与目标

### 1.1 问题陈述

当前 AI 辅助编程的"工程纪律缺失"问题：

- **范围失控**: AI 容易引入用户没要的依赖与框架
- **无人审查**: 单人开发缺少多视角把关
- **纪律缺失**: 跳过 TDD、跳过测试、跳过构建验证
- **上下文腐烂**: 长会话导致早期指令被遗忘
- **知识流失**: 会话结束经验归零，下次从零开始
- **进度丢失**: 任务状态无持久化，跨会话丢失
- **工具碎片化**: GSD/OpenSpec/gstack/Superpowers/Ralph 各管一摊，组合不顺畅

### 1.2 解决方案

**云枢 (YunShou)** 是一个**自包含的 AI 编程工作流框架**，把规范驱动开发 + 多引擎协作 + 记忆/任务/知识管理 + 多 IDE 适配能力，统一在一个独立框架内。

### 1.3 v0.1 范围（必交付）

- 4 大引擎: Spec / Plan / Execute / Verify
- 3 个横向子系统: Memory / Task / Knowledge
- 1 个完整 IDE 适配器: OpenCode
- 2 种接口: CLI + MCP Server
- 自包含、独立分发（npm package）

### 1.4 v0.1 不做（v0.2+ 延后）

- Claude Code / Cursor / Trae / CodeBuddy 完整适配
- 多成员协作 / 状态同步
- 权限与审计
- 插件生态
- 自动 watch / loop 执行模式
- L2/L4/L6 完整 7 层记忆
- Ralph 风格自动循环
- Web UI
- 与 GSD/OpenSpec 桥接（YunShou 是替代品，非包装）

---

## 2. 关键决策摘要

| 决策维度 | 选择 | 理由 |
|---|---|---|
| 框架定位 | **独立框架（自包含、可独立分发）** | 不依赖外部 GSD/OpenSpec/gstack 工具本体 |
| 服务范围 | 全场景（个人→企业，远景） | v0.1 只交付个人/小团队核心能力 |
| 第一阶段 | 核心引擎（spec/plan/execute/verify） | 4 阶段自包含工作流 |
| 技术栈 | Node.js + TypeScript + Bun | IDE 生态兼容 + 启动快 + 类型安全 |
| 适配策略 | 混合（CLI/MCP 入口 + 多端生成器） | 用户少配置 + IDE 中原生命令 |
| 数据模型 | Markdown + YAML frontmatter + JSONL 状态 | 人读 + git diff 友好 |
| 执行机制 | 生成提示 + 用户手动触发 | 不试图自动驱动 IDE AI（v0.1 简化） |
| MVP 范围 | 核心引擎 + CLI + 1 IDE 垂直打通 | 先把 OpenCode 走通完整闭环 |
| 状态机驱动 | 硬门禁（core/guard）+ 软提示（hooks） | 借鉴 gstack 钩子 + superpowers 纪律 |

---

## 3. 总体架构

```
┌──────────────────────────────────────────────────────────────────────┐
│                    YunShou 核心引擎 (v0.1)                           │
│                                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                  │
│  │  Spec   │  │  Plan   │  │ Execute │  │ Verify  │  核心工作流       │
│  │ Engine  │→ │ Engine  │→ │ Engine  │→ │ Engine  │  (纵向)         │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                  │
│         ↑           ↑            ↑           ↑                       │
│         └───────────┴────────────┴───────────┘                       │
│                          ↓                                          │
│              ┌──────────────────────────┐                            │
│              │  State Store (JSONL)     │                            │
│              │  .yunshou/state.jsonl    │                            │
│              └──────────────────────────┘                            │
│                          ↓                                          │
│  ══════════════ 横向支撑子系统（v0.1 必交付）══════════════════════   │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │   Memory     │  │   Task       │  │  Knowledge   │                │
│  │   System     │  │   System     │  │  Base        │                │
│  │  (记忆)      │  │  (任务)      │  │  (知识)      │                │
│  │              │  │              │  │              │                │
│  │ L1 工具结果  │  │ 8 态状态机   │  │ snippets/    │                │
│  │ L3 工作记忆  │  │ 依赖+阻塞    │  │ patterns/    │                │
│  │ L5 自动提取  │  │ 子任务       │  │ decisions/   │                │
│  │ L7 跨代理    │  │ 标签+优先级  │  │ glossary/    │                │
│  └──────────────┘  └──────────────┘  └──────────────┘                │
│                          ↓                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  硬门禁层 (core/guard) — 状态转移合法性检查                    │   │
│  │  - 草稿阶段不能批准                                          │   │
│  │  - 质量门未过不能 ship                                        │   │
│  │  - 依赖未满足不能 start                                       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          ↓                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  IDE Adapter Layer (本期只交付 opencode 适配)                  │   │
│  │  - OpenCode Adapter (v0.1 完整)                              │   │
│  │  - Claude Code / Cursor / Trae / CodeBuddy (v0.2+ 占位)       │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                          ↓                                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Interface Layer (本期交付 CLI + MCP)                         │   │
│  │  - CLI (yunshou <command>)                                   │   │
│  │  - MCP Server (yunshou mcp)                                  │   │
│  │  - File Watcher (v0.2+)                                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.1 4 引擎协作数据流

```
用户想法
   ↓
[Spec Engine] → spec.md (approved)
   ↓
[Plan Engine] → plan.md + Task 子系统 (创建 T-NNN)
   ↓
[Execute Engine] → 循环 (选任务 → 生成提示 → 用户执行 → 回报)
   ↓
[Verify Engine] → VerifyReport (pass/fail)
   ↓                       ↓ fail
   ↓                   [Execute Engine] (重试)
   ↓
[Spec Engine] archive (整个工作流归档)
```

### 3.2 工作流状态机

```
  draft ──approve──→ approved ──generate-plan──→ plan_draft
   ↑                                              │
   └──────────reject──────────────────────────────┤
                                                  ↓
                                            plan_approved
                                                  │
                                                  ↓ execute
                                            executing
                                          ┌──────┼──────┐
                                          ↓      ↓      ↓
                                      completed failed blocked
                                          │      │      │
                                          ↓      ↓      └─→ retry / escalate
                                         done  done_with_concerns
                                          │
                                          ↓ verify
                                       verified | failed_verify
                                          │
                                          ↓ archive
                                       archived
```

---

## 4. 项目目录结构

### 4.1 YunShou 框架仓库（开发态）

```
agents-workflow/                          # YunShou 根目录（即用户当前目录）
├── package.json                          # @agents-workflow/yunshou
├── tsconfig.json                         # strict mode
├── bun.lock
├── README.md
├── AGENTS.md                             # 项目级 Agent 规则
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-06-07-yunshou-design.md  # 本文档
├── src/
│   ├── core/                             # 核心引擎
│   │   ├── spec/                         # 规格引擎
│   │   ├── plan/                         # 计划引擎
│   │   ├── execute/                      # 执行引擎
│   │   ├── verify/                       # 验证引擎
│   │   ├── guard/                        # 硬门禁（v0.1 新增）
│   │   └── state/                        # 状态管理
│   ├── memory/                           # 记忆子系统
│   │   ├── l1-tool-results/
│   │   ├── l3-working/
│   │   ├── l5-extractor/
│   │   └── l7-handoff/
│   ├── task/                             # 任务子系统
│   │   ├── manager.ts
│   │   ├── state-machine.ts
│   │   ├── dependency.ts
│   │   └── template.ts
│   ├── knowledge/                        # 知识库
│   │   ├── snippets/
│   │   ├── patterns/
│   │   ├── decisions/
│   │   └── glossary/
│   ├── adapters/                         # IDE 适配器
│   │   ├── opencode/                     # v0.1 唯一完整适配
│   │   ├── claude-code/                  # v0.2 占位
│   │   ├── cursor/                       # v0.2 占位
│   │   ├── trae/                         # v0.2 占位
│   │   └── codebuddy/                    # v0.2 占位
│   ├── interfaces/                       # 用户接口
│   │   ├── cli/                          # CLI 入口
│   │   ├── mcp/                          # MCP Server
│   │   └── lib/                          # 公共库
│   └── shared/                           # 共享工具
├── templates/                            # 模板库
│   ├── spec.md.tmpl                      # 借鉴 OpenSpec delta 风格
│   ├── plan.md.tmpl
│   └── tasks.md.tmpl                     # 借鉴 OpenSpec checkbox 格式
├── tests/                                # 测试
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── examples/                             # 示例项目
    └── hello-world/
```

### 4.2 YunShou 用户项目（运行态）

```
my-project/                               # 用户项目
├── .yunshou/                             # YunShou 状态与配置
│   ├── config.yaml                       # 框架配置
│   ├── state.jsonl                       # 工作流事件流（git 跟踪）
│   ├── memory/                           # 记忆子系统
│   │   ├── l1/                           # L1: 工具结果
│   │   ├── l3/working.md                 # L3: 工作记忆
│   │   ├── l5/long-term/                 # L5: 长期记忆
│   │   │   ├── facts.md
│   │   │   ├── decisions.md
│   │   │   ├── patterns.md
│   │   │   └── gotchas.md
│   │   └── l7/handoff/                   # L7: 跨代理交接
│   ├── tasks/                            # Task 子系统
│   │   ├── index.jsonl
│   │   ├── tasks/<T-NNN>.json
│   │   └── templates/
│   ├── knowledge/                        # 知识库
│   │   ├── snippets/
│   │   ├── patterns/
│   │   ├── decisions/ADR-NNN.md
│   │   └── glossary/terms.yaml
│   ├── specs/<id>/spec.md                # 规格产物
│   ├── plans/<id>/plan.md                # 计划产物
│   └── progress/                         # 进度跟踪
├── specs/                                # 软链 → .yunshou/specs/
├── plans/                                # 软链 → .yunshou/plans/
├── AGENTS.md                             # YunShou 生成的 Agent 规则
├── CLAUDE.md / .cursorrules / ...        # 5 IDE 各自配置文件
```

---

## 5. 核心数据模型

### 5.1 spec.md 模板（借鉴 OpenSpec delta 风格）

```yaml
---
id: 2026-06-07-hello-world
title: 用户认证系统
status: draft | approved | archived
version: 1
created: 2026-06-07T17:30:00+08:00
approved: 2026-06-07T17:45:00+08:00
qualityScore: 8.5/10    # codex 评分（v0.1 可选）
priority: high
tags: [auth, security]
---

# 用户认证系统

## 目的与背景
（用户描述 + AI 提炼）

## ADDED Requirements

### Requirement: 用户能通过邮箱密码注册
系统 MUST 提供邮箱+密码注册能力。

#### Scenario: 有效输入
- **WHEN** 用户提交 { email: "x@y.com", password: "12345678" }
- **THEN** 返回 201 + 用户 ID
- **AND** 自动登录返回 JWT token

#### Scenario: 邮箱重复
- **WHEN** 邮箱已存在
- **THEN** 返回 409 + 错误信息

### Requirement: 用户能通过邮箱密码登录
系统 MUST 提供登录能力，登录成功返回 24h 过期 JWT。

#### Scenario: 正确凭据
- **WHEN** 用户提交正确邮箱密码
- **THEN** 返回 200 + JWT token

#### Scenario: 错误凭据
- **WHEN** 邮箱或密码错误
- **THEN** 返回 401

## 范围

### 包含
- 用户注册、登录、登出
- 会话管理（JWT，24h 过期）

### 不包含
- 第三方登录（OAuth）
- 密码重置邮件

## 失败模式
- 输入为空 / null / 巨大 / 重复时怎么办
- 并发注册同一邮箱的竞态
- JWT 密钥泄露的回滚策略

## 依赖与约束
- 技术栈: Node.js + Express + TypeScript
- 数据库: PostgreSQL
- 认证: jsonwebtoken 库
- 文件路径引用: src/api/auth/register.ts（待创建）
```

**关键约束**（来自 OpenSpec 实战经验）：
- Scenario 标题必须用 `####`（4 个井号），否则静默忽略
- `### Requirement:` 后正文使用 SHALL / MUST 关键字
- delta 节（ADDED / MODIFIED / REMOVED / RENAMED）只在 change 模式下使用

### 5.2 plan.md 模板

```yaml
---
spec: 2026-06-07-hello-world
planId: 2026-06-07-hello-world-p1
status: draft | approved | executing | completed
totalTasks: 12
totalEstMin: 180
generated: 2026-06-07T17:40:00+08:00
---

# 用户认证系统 - 实施计划

## 阶段划分
- **Phase 1: 基础设施** (T-001 ~ T-003, 30min)
- **Phase 2: 核心 API** (T-004 ~ T-008, 90min)
- **Phase 3: 测试与文档** (T-009 ~ T-012, 60min)

## 任务清单（checkbox 格式，借鉴 OpenSpec）

## 1. 基础设施

- [ ] 1.1 创建项目骨架 (T-001, 10min)
- [ ] 1.2 数据库 schema (T-002, 15min)
- [ ] 1.3 用户模型 (T-003, 10min)

## 2. 核心 API

- [ ] 2.1 注册 API (T-004, 20min)
- [ ] 2.2 登录 API (T-005, 20min)
- [ ] 2.3 登出 API (T-006, 10min)
- [ ] 2.4 中间件 (T-007, 20min)
- [ ] 2.5 错误处理 (T-008, 20min)

## 3. 测试与文档

- [ ] 3.1 单元测试 (T-009, 20min)
- [ ] 3.2 集成测试 (T-010, 20min)
- [ ] 3.3 README (T-011, 10min)
- [ ] 3.4 API 文档 (T-012, 10min)

## 依赖图 (DAG)

```
T-001 → T-002 → T-003 → T-004 → T-005
                  ↓
              T-006 → T-007 → T-008
                                ↓
                          T-009 → T-010
                                   ↓
                              T-011 → T-012
```

## 风险与回滚
- 风险 1: 数据库迁移失败 → 回滚命令
- 风险 2: JWT 密钥泄露 → 立即轮换 + 强制所有用户重新登录
```

### 5.3 state.jsonl 事件流

```jsonl
{"ts":"2026-06-07T17:30:00+08:00","event":"spec.created","id":"2026-06-07-hello-world","actor":"user"}
{"ts":"2026-06-07T17:35:00+08:00","event":"spec.advance","id":"2026-06-07-hello-world","toPhase":3,"actor":"user"}
{"ts":"2026-06-07T17:40:00+08:00","event":"spec.approved","id":"2026-06-07-hello-world","version":1}
{"ts":"2026-06-07T17:45:00+08:00","event":"plan.generated","id":"2026-06-07-hello-world","tasks":12}
{"ts":"2026-06-07T17:50:00+08:00","event":"plan.approved","id":"2026-06-07-hello-world"}
{"ts":"2026-06-07T17:55:00+08:00","event":"task.created","id":"T-001","planId":"2026-06-07-hello-world"}
{"ts":"2026-06-07T18:00:00+08:00","event":"task.started","id":"T-001","actor":"opencode"}
{"ts":"2026-06-07T18:10:00+08:00","event":"task.completed","id":"T-001","commit":"abc123"}
```

---

## 6. 横向子系统

### 6.1 Memory 子系统

#### 架构

```
┌────────────────────────────────────────────────────────────────┐
│  Memory Subsystem v0.1                                         │
│                                                                │
│  L1 工具结果存储 (Tool Result Store)                            │
│    - 大输出 (>10KB) 自动落盘 .yunshou/memory/l1/               │
│    - 上下文中只保留摘要 (前 500 字符 + 文件路径)                │
│                                                                │
│  L3 会话工作记忆 (Working Memory)                               │
│    - 当前会话的"黑板": 决策、上下文锚点、未决问题               │
│    - 存储: .yunshou/memory/l3/working.md (YAML)                │
│                                                                │
│  L5 自动记忆提取 (Auto Extractor) — Hook                       │
│    - 触发: 任务完成 / 会话结束 / 显式调用                      │
│    - 存储: .yunshou/memory/l5/long-term/                       │
│      ├── facts.md       (项目事实)                             │
│      ├── decisions.md   (决策日志 + 原因)                       │
│      ├── patterns.md    (发现的可复用模式)                      │
│      └── gotchas.md     (踩坑笔记)                             │
│                                                                │
│  L7 跨代理交接 (Cross-Agent Handoff)                            │
│    - 写入: .yunshou/memory/l7/handoff/<session-id>.json       │
│    - 读取: 下个会话启动时自动加载最近一次 handoff               │
│                                                                │
│  未实现 (v0.2+): L2 微压缩、L4 全压缩、L6 做梦机制             │
└────────────────────────────────────────────────────────────────┘
```

#### 关键 API

```typescript
// L1
store.put(toolName: string, result: unknown, opts?: { ttl?: number }): { id: string, path: string }
store.get(id: string): Promise<unknown>
store.summarize(id: string): string

// L3
working.set(key: string, value: unknown, opts?: { ttl?: 'session' | 'task' | 'permanent' }): void
working.get<T = unknown>(key: string): T | undefined
working.list(): Array<{ key: string, value: unknown, ttl: string }>
working.flush(): void

// L5
extract.trigger(reason: 'task_done' | 'session_end' | 'manual', sessionData: SessionData): Promise<ExtractionResult>
extract.list(category: 'facts' | 'decisions' | 'patterns' | 'gotchas'): MemoryEntry[]

// L7
handoff.write(sessionId: string, data: HandoffData): void
handoff.readLatest(): HandoffData | null
```

### 6.2 Task 子系统

#### 状态机

```
   pending ──start──→ in_progress ──finish──→ review
      ↑                    │                    │
      │                    ↓                    ↓
      │                 blocked            approved
      │                    │                    │
      │                    └──unblock──→ in_progress
      │                                         │
      └──reset──────────────────────────────────┤
      │                                         ↓
      │                                       done
      │                                         │
      │                                         ↓
      └──────────────archive──────────────────→ archived

   并行终态: cancelled / failed
```

#### 存储结构

```
.yunshou/tasks/
├── index.jsonl              # 任务索引（每行一条事件）
├── tasks/
│   ├── T-001.json           # 单个任务详情
│   ├── T-002.json
│   └── ...
├── archive/                 # 归档任务
│   └── 2026-06/
└── templates/
    ├── bug-fix.json
    ├── feature.json
    ├── refactor.json
    └── chore.json
```

#### 任务数据结构

```typescript
interface Task {
  id: string                   // T-001, T-002...
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'review' | 'done' 
        | 'blocked' | 'cancelled' | 'failed' | 'archived'
  priority: 'urgent' | 'high' | 'medium' | 'low'
  tags: string[]
  assignee?: string            // IDE 名 / 用户名 / agent id
  created: string              // ISO
  updated: string
  due?: string
  estimateMin?: number
  actualMin?: number
  dependsOn: string[]          // 阻塞本任务的任务 ID
  blocks: string[]             // 被本任务阻塞的任务
  parentId?: string            // 子任务的父任务
  subtaskIds: string[]
  checklist: Array<{ id: string, text: string, done: boolean }>
  spec?: string                // 关联的 spec id
  plan?: string                // 关联的 plan id
  artifacts: string[]          // 关联的工作流产物
  comments: Comment[]
  activity: ActivityLog[]      // 每次状态变更记录
}
```

#### 关键 API

```typescript
task.create(input: TaskCreateInput): Task
task.get(id: string): Task | null
task.update(id: string, patch: Partial<Task>): Task
task.start(id: string, assignee: string): Task
task.finish(id: string, opts: { comment?: string, commit?: string }): Task
task.block(id: string, reason: string, blockedBy: string[]): Task
task.unblock(id: string): Task
task.list(filter?: TaskFilter): Task[]
task.dependency.check(id: string): { blocked: boolean, blockers: string[] }
task.dashboard(projectId: string): DashboardData  // 状态分布、燃尽
```

### 6.3 Knowledge Base 子系统

#### 架构

```
┌────────────────────────────────────────────────────────────────┐
│  Knowledge Base v0.1                                          │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  snippets/   │  │  patterns/   │  │  decisions/  │          │
│  │  代码片段    │  │  可复用模式   │  │  决策日志     │          │
│  │  *.code.md   │  │  *.pattern.md│  │  ADR-NNN.md  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                │
│  ┌──────────────┐                                              │
│  │  glossary/   │                                              │
│  │  术语表      │                                              │
│  │  terms.yaml  │                                              │
│  └──────────────┘                                              │
│                                                                │
│  全文索引: .yunshou/knowledge/.index/                          │
└────────────────────────────────────────────────────────────────┘
```

#### 与 Memory 的区别

- **Memory**：会话级 / 项目级，自动提取，可能过时
- **Knowledge**：手动维护、版本化、可跨项目共享、作为权威源

#### 关键 API

```typescript
knowledge.snippet.add(category: string, title: string, code: string, lang: string): Snippet
knowledge.pattern.add(name: string, when: string, how: string, examples: string[]): Pattern
knowledge.decision.record(title: string, context: string, options: Option[], chosen: string, reasoning: string): Decision
knowledge.glossary.add(term: string, definition: string, alias?: string[]): void
knowledge.search(query: string, scope?: 'all' | 'snippets' | 'patterns' | 'decisions'): SearchResult[]
knowledge.export(scope: KnowledgeScope): KnowledgeBundle
```

---

## 7. 4 大引擎

### 7.1 Spec Engine

#### 职责

把模糊想法 → 精确可执行的规格，借鉴 gstack `/spec` 的 5 阶段 + OpenSpec 的轻量契约。

#### 5 阶段流程

```
Phase 1: 理解为什么
  - who / what / why / when / done-criteria
  ↓
Phase 2: 范围与边界
  - in/out / dependencies / MVP
  ↓
Phase 3: 技术审问
  - 必须先读代码（不读不问）
  ↓
Phase 4: 草稿审查
  - Socratic 追问，直到用户批准
  ↓
Phase 5: 质量门
  - codex 评分 + redact 扫描
  ↓
归档: .yunshou/specs/<id>/spec.md + meta.json
```

#### 状态机

```
draft → reviewing → approved → archived
   ↑         │
   └─────────┘
   rejected (回到 Phase 1)
```

#### 关键 API

```typescript
spec.create(input: { title: string, tags?: string[] }): SpecDraft
spec.interview(id: string, userResponse: string): Promise<SpecQuestion[]>
spec.advance(id: string, targetPhase: 1 | 2 | 3 | 4 | 5): Promise<SpecState>
spec.draft(id: string): SpecDocument
spec.qualityGate(id: string): QualityReport
spec.approve(id: string, version: number): Spec
spec.reject(id: string, reason: string): void
spec.archive(id: string): void
spec.list(filter?: SpecFilter): Spec[]
```

### 7.2 Plan Engine

#### 职责

把 approved spec → 可执行的微任务清单（5-15 分钟粒度），借鉴 GSD 的原子化拆分 + superpowers writing-plans 的文件级别细节。

#### 流程

1. 读取 spec.md + 扫一遍相关源码
2. 生成 phase 划分（粗粒度里程碑）
3. 拆分 task（5-15 分钟粒度）
4. 建立依赖图（DAG）
5. 用户审阅 + 批准
6. 同步到 Task 子系统（创建 T-001, T-002...）

#### 关键 API

```typescript
plan.generate(input: {
  specId: string,
  granularity?: 'phase' | 'task' | 'subtask',
  maxTaskMin?: number,
  targetIDE?: 'opencode' | 'claude-code' | ...
}): PlanDraft

plan.refine(planId: string, taskId: string, instruction: string): PlanDraft
plan.dependency.build(planId: string): DependencyGraph
plan.dependency.cycle(planId: string): string[][]
plan.approve(planId: string): void
plan.materialize(planId: string): { created: string[] }
plan.list(filter?: PlanFilter): Plan[]
```

### 7.3 Execute Engine

#### 职责

驱动 IDE AI 实际执行任务，借鉴 Ralph 循环 + 用户手动触发（避免自动驱动风险）。

#### 流程

1. 选下一个 ready task（无未满足依赖 + 状态=pending）
2. 生成 IDE-specific 提示（SKILL.md / 命令）
3. 写入提示到 `.yunshou/prompts/next.md`
4. 等待用户手动在 IDE 中执行
5. 用户执行后回报结果 → 更新 task 状态
6. 重复 1-5 直到 plan 全部 done

#### 关键 API

```typescript
execute.next(planId: string): NextTask
execute.prompt(taskId: string, ideTarget: string): Prompt
execute.report(taskId: string, outcome: {
  status: 'completed' | 'failed' | 'blocked',
  commit?: string,
  notes?: string,
  artifacts?: string[]
}): Task
execute.skip(taskId: string, reason: string): Task
execute.pause(planId: string): void
execute.resume(planId: string): void
execute.status(planId: string): ExecutionStatus
```

#### 生成的 IDE 提示示例（opencode）

```markdown
# YunShou 任务提示

## 任务
T-004: 注册 API

## 上下文
- Spec: specs/2026-06-07-hello-world/spec.md
- Plan: plans/2026-06-07-hello-world-p1/plan.md
- 前置任务: T-001 (✅), T-002 (✅), T-003 (✅)

## 改动文件
- src/api/auth/register.ts (新建)
- src/api/auth/register.test.ts (新建)

## 验收标准
1. POST /api/auth/register 接受 { email, password }
2. 邮箱重复时返回 409
3. 密码强度: ≥8 字符
4. 写完 .test.ts 并通过

## 完成后
请回报:
- commit hash
- 任何偏差
- 阻塞点 (如有)
```

### 7.4 Verify Engine

#### 职责

验证任务结果是否符合 spec/plan 验收标准，借鉴 gstack /qa + 质量门禁。

#### 验证层

```
L1: 静态检查 (lint, typecheck, format)
L2: 单元/集成测试 (npm test, vitest, jest...)
L3: 构建 (npm run build)
L4: 契约验证 (spec 验收标准 vs 实际实现)
L5: 端到端 (gstack browse 自动浏览器, v0.2+)
```

#### 关键 API

```typescript
verify.task(taskId: string, opts?: VerifyOpts): VerifyReport
verify.plan(planId: string): VerifyReport
verify.spec(specId: string): SpecComplianceReport
verify.gate(planId: string, gate: 'lint' | 'typecheck' | 'test' | 'build'): GateResult
verify.history(planId: string): VerifyReport[]
```

#### VerifyReport 数据结构

```typescript
interface VerifyReport {
  taskId: string
  timestamp: string
  layers: {
    lint: { passed: boolean, errors: string[] }
    typecheck: { passed: boolean, errors: string[] }
    test: { passed: boolean, passedN: number, failedN: number, details: string[] }
    build: { passed: boolean, output: string }
    specCompliance: { 
      passed: boolean, 
      criteriaResults: Array<{ criterion: string, met: boolean, evidence?: string }> 
    }
  }
  overall: 'passed' | 'failed' | 'partial'
  duration: number
  artifacts: string[]
}
```

### 7.5 硬门禁层（core/guard）

借鉴 gstack 钩子 + superpowers 纪律，在状态转移时强制检查：

```typescript
// 硬门禁示例
const specGuard = {
  canApprove(spec: Spec): GuardResult {
    if (spec.status !== 'reviewing') {
      return { ok: false, reason: '规格不在 reviewing 阶段' }
    }
    if (!spec.qualityGate?.passed) {
      return { ok: false, reason: '质量门未通过' }
    }
    return { ok: true }
  }
  
  canArchive(spec: Spec): GuardResult {
    if (spec.status !== 'approved') {
      return { ok: false, reason: '只能归档已批准的规格' }
    }
    return { ok: true }
  }
}

const taskGuard = {
  canStart(task: Task): GuardResult {
    // 检查依赖
    for (const depId of task.dependsOn) {
      const dep = task.get(depId)
      if (dep.status !== 'done') {
        return { ok: false, reason: `依赖 ${depId} 未完成` }
      }
    }
    return { ok: true }
  }
  
  canFinish(task: Task): GuardResult {
    // 借鉴 gstack: 必须有 verify pass
    const verify = verify.task(task.id)
    if (verify.overall !== 'passed') {
      return { ok: false, reason: '质量门未通过', verify }
    }
    return { ok: true }
  }
}
```

---

## 8. OpenCode 适配器

### 8.1 职责

把 YunShou 工作流产物同步到 OpenCode 期望的位置。

### 8.2 生成的产物清单

```
.opencode/
├── opencode.json                # 包含 yunshou MCP 入口
├── skills/
│   ├── yunshou/
│   │   └── SKILL.md             # 总入口，路由到各阶段
│   ├── yunshou-spec/
│   │   └── SKILL.md             # 规格阶段技能
│   ├── yunshou-plan/
│   │   └── SKILL.md             # 计划阶段技能
│   ├── yunshou-execute/
│   │   └── SKILL.md             # 执行阶段技能
│   └── yunshou-verify/
│       └── SKILL.md             # 验证阶段技能
├── commands/
│   ├── ys-spec.md
│   ├── ys-plan.md
│   ├── ys-execute.md
│   ├── ys-verify.md
│   └── ys-status.md
├── agents/
│   └── yunshou-orchestrator.md  # 编排代理
└── hooks/
    └── yunshou-state-watcher.js  # 状态变更 hook
```

### 8.3 总入口 SKILL.md 路由逻辑

```markdown
# YunShou 入口

根据用户意图路由到对应引擎:

| 用户说 | 调用 |
|--------|------|
| "我想做 X" | /ys-spec |
| "为 <id> 制定计划" | /ys-plan <id> |
| "继续执行" / "下一个任务" | /ys-execute |
| "验证一下" | /ys-verify |
| "看看进度" | /ys-status |

先读 .yunshou/state.jsonl 最近 5 条事件，了解当前阶段，再决定路由。
```

### 8.4 关键 API

```typescript
adapter.install(target: 'opencode', opts): InstallResult
adapter.uninstall(target: 'opencode'): void
adapter.sync(target: 'opencode', diff: StateDiff): SyncResult
adapter.status(target: 'opencode'): AdapterStatus
```

### 8.5 生成时机

- **首次安装**: `yunshou init` + `yunshou install opencode`
- **状态变更后**: 增量同步（只在必要时重新生成）

---

## 9. CLI 与 MCP 接口

### 9.1 CLI 命令

```bash
# 初始化
yunshou init [path]                       # 初始化项目
yunshou install <ide>                    # 安装 IDE 适配器
yunshou uninstall <ide>

# 规格阶段
yunshou spec new "<title>"
yunshou spec interview <id>
yunshou spec advance <id> --to=phase3
yunshou spec draft <id>
yunshou spec approve <id>
yunshou spec reject <id> --reason="..."
yunshou spec list

# 计划阶段
yunshou plan new --spec=<id>
yunshou plan refine <plan-id> <task-id>
yunshou plan approve <plan-id>
yunshou plan materialize <plan-id>
yunshou plan list

# 执行阶段
yunshou execute next <plan-id>
yunshou execute prompt <task-id> --ide=opencode
yunshou execute report <task-id> --status=completed --commit=abc
yunshou execute skip <task-id> --reason="..."
yunshou execute status <plan-id>
yunshou execute pause <plan-id>
yunshou execute resume <plan-id>

# 验证阶段
yunshou verify task <task-id>
yunshou verify plan <plan-id>
yunshou verify spec <spec-id>
yunshou verify gate <plan-id> --gate=test

# 记忆
yunshou memory working set <key> <value>
yunshou memory working get <key>
yunshou memory working list
yunshou memory extract --reason=task_done
yunshou memory handoff write
yunshou memory handoff read

# 任务
yunshou task new "<title>" --priority=high --assignee=claude-code
yunshou task list
yunshou task start <id>
yunshou task finish <id> --commit=abc
yunshou task dashboard
yunshou task report

# 知识库
yunshou knowledge snippet add <category> <title>
yunshou knowledge pattern add <name>
yunshou knowledge decision record
yunshou knowledge search "<query>"

# 状态
yunshou status
yunshou state tail -n 20
yunshou doctor

# 全局
yunshou --version
yunshou --help
yunshou upgrade
```

### 9.2 实现要点

- 用 `commander` 或 `yargs` 做命令解析
- 错误时退出码：0 (成功) / 1 (业务错误) / 2 (使用错误)
- 输出风格：人读模式（默认）+ JSON 模式 (`--json`)

### 9.3 MCP Server

```
启动: yunshou mcp [--port=7891]
协议: JSON-RPC over stdio (默认) 或 TCP (可选)
```

**暴露的工具 (Tools)**：
- yunshou_spec_create, yunshou_spec_approve, yunshou_spec_reject
- yunshou_plan_generate, yunshou_plan_approve, yunshou_plan_materialize
- yunshou_execute_next, yunshou_execute_prompt, yunshou_execute_report
- yunshou_verify_task, yunshou_verify_plan, yunshou_verify_spec
- yunshou_memory_working_set, yunshou_memory_extract, yunshou_memory_handoff
- yunshou_task_new, yunshou_task_finish, yunshou_task_dashboard
- yunshou_knowledge_search
- yunshou_status, yunshou_doctor

**暴露的资源 (Resources)**：
- `yunshou://specs/{id}`
- `yunshou://plans/{id}`
- `yunshou://tasks/{id}`
- `yunshou://state/recent`

**暴露的提示 (Prompts)**：
- `yunshou://prompts/spec-interview`
- `yunshou://prompts/plan-generation`
- `yunshou://prompts/execute-task`

### 9.4 在 opencode.json 中注册

```json
{
  "mcp": {
    "yunshou": {
      "type": "stdio",
      "command": "yunshou",
      "args": ["mcp"]
    }
  }
}
```

---

## 10. 错误处理

### 10.1 错误分类

```
1. 用户错误 (User Error) — 退出码 2
   - 命令用法错 → 显示帮助
   - 必填参数缺失 → 提示
   - 状态不合法 (如批准 draft 阶段的 spec) → 提示原因

2. 配置错误 (Config Error) — 退出码 1
   - .yunshou/config.yaml 损坏
   - 适配器配置冲突

3. 文件系统错误 (FS Error) — 退出码 1
   - 权限不足
   - 磁盘满
   - 文件不存在

4. 引擎错误 (Engine Error) — 退出码 1
   - 规格被 quality gate 拒绝 → 返回报告
   - 计划循环依赖 → 自动检测并提示
   - 执行超时

5. 适配器错误 (Adapter Error) — 退出码 1
   - 目标 IDE 未安装
   - 同步冲突 → 备份原文件

6. 内部错误 (Internal Error) — 退出码 99
   - 未捕获异常 → 写 crash log
```

### 10.2 错误码规范

```
E_USAGE_*       命令用法错误 (退出码 2)
E_CONFIG_*      配置错误 (退出码 1)
E_FS_*          文件系统错误 (退出码 1)
E_ENGINE_*      引擎逻辑错误 (退出码 1)
E_ADAPTER_*     适配器错误 (退出码 1)
E_INTERNAL_*    内部未捕获错误 (退出码 99)
```

### 10.3 全局原则

- 错误信息必含：错误码 + 中文描述 + 解决方案链接
- 不可恢复错误：写入 crash log，提示用户提交 issue
- 可恢复错误：给出 2-3 个明确的下一步选项

---

## 11. 测试策略

### 11.1 测试金字塔

```
       ╱╲      E2E (Playwright + 真实 CLI)
      ╱  ╲     - 模拟完整工作流
     ╱────╲    - 用临时目录，每个测试独立
    ╱      ╲
   ╱ 集成测试 ╲  跨模块协作
  ╱────────────╲
 ╱    单元测试   ╲  纯函数 + 类
╱────────────────╲
```

### 11.2 覆盖率目标

- 核心引擎：≥ 80%
- 适配器：≥ 70%
- CLI：≥ 60%（端到端覆盖核心命令）
- MCP：100% 协议层

### 11.3 关键测试场景

1. **状态机测试**：每个状态的合法/非法转移
2. **依赖图测试**：DAG 构建、循环检测、拓扑排序
3. **适配器测试**：生成产物 → 解析回来 → 内容一致（往返测试）
4. **CLI E2E**：`yunshou init` → `yunshou spec new` → `yunshou spec approve` → `yunshou plan new` → 完整链路
5. **MCP 协议测试**：JSON-RPC 请求/响应符合规范
6. **并发安全**：多 IDE 适配器同时 sync 不冲突

### 11.4 测试工具栈

- `vitest` 单元 + 集成测试
- `@playwright/test` E2E
- `memfs` 模拟文件系统
- `tsx` 运行 TypeScript 测试

---

## 12. v0.1 交付清单

### ✅ 范围内（必交付）

```
□ 核心引擎 (4 个)
  □ Spec Engine: 5 阶段 + quality gate
  □ Plan Engine: 任务拆分 + DAG
  □ Execute Engine: 提示生成 + 手动触发
  □ Verify Engine: 5 层验证 (lint/typecheck/test/build/spec)

□ 横向子系统 (3 个)
  □ Memory System: L1 + L3 + L5 + L7
  □ Task System: 8 态状态机 + 依赖 + 仪表盘
  □ Knowledge Base: snippets/patterns/decisions/glossary

□ 硬门禁层 (1 个)
  □ core/guard: 状态转移合法性检查

□ 适配器 (1 个完整 + 4 个占位)
  □ OpenCode Adapter: 完整安装/同步/卸载
  □ Claude Code / Cursor / Trae / CodeBuddy: 目录占位 + 文档说明

□ 接口 (2 个)
  □ CLI: 50+ 命令
  □ MCP Server: 20+ 工具 + 5 资源

□ 基础设施
  □ 包结构: @agents-workflow/yunshou (npm)
  □ TypeScript strict mode
  □ 完整中文文档 (README + 概念指南 + 命令手册)
  □ 1 个完整示例项目 (hello-world)
  □ GitHub Actions CI (lint + typecheck + test + build)
```

### ❌ 范围外（v0.2+）

- 4 个非 opencode IDE 的完整适配
- 多成员协作 / 状态同步
- 权限与审计
- 插件生态
- 4 IDE 自动化驱动模式 (watch/loop)
- L2/L4/L6 记忆层
- Ralph 风格自动循环
- 与 Spec-Kit/GSD 的桥接
- Web UI

---

## 13. 借鉴与超越

### 13.1 直接借鉴（P0 必做）

| 来源 | 能力 | YunShou 实现位置 |
|---|---|---|
| OpenSpec | delta spec 的 `## ADDED Requirements` 格式 | spec.md 模板 |
| OpenSpec | tasks.md 的 `- [ ]` checkbox 格式 | plan.md 模板 |
| OpenSpec | `applyRequires` 状态机驱动 | Plan Engine |
| OpenSpec | `archive/YYYY-MM-DD-<name>/` 归档格式 | spec.archive() |
| Superpowers | 5 阶段规格流程（Phase 1-5） | Spec Engine |
| Superpowers | TDD 红-绿-重构纪律（作为文档） | Verify Engine 文档 |

### 13.2 借鉴但调整（P1）

| 来源 | 能力 | YunShou 调整 |
|---|---|---|
| gstack | 5 层验证（lint/typecheck/test/build/spec） | 完整采用 |
| gstack | `~/.gstack/projects/$SLUG/` 双根模式 | 改为 `.yunshou/{项目级,用户级}/` |
| gstack | CHANGELOG 用 `Edit` 不用 `Write` | Verify 阶段强制 |

### 13.3 YunShou 超越

| 超越点 | 优势 |
|---|---|
| 4 引擎 + 3 子系统 + 5 IDE 适配，统一在一个框架 | 替代多工具组合 |
| 硬门禁 + 软提示双层纪律 | 借鉴 gstack 钩子 + superpowers 纪律 |
| delta spec 模板内置 | 借鉴 OpenSpec 实战经验 |
| `core/guard` 状态机驱动 | 避免 superpowers "事后追责" |

### 13.4 不做事项

- **不强制 TDD**：这是 IDE/AI 责任，不是工作流引擎责任
- **不自动驱动 IDE AI**：v0.1 简化为"生成提示 + 手动触发"，v0.2+ 再考虑
- **不替代 IDE 自身能力**：YunShou 只管工作流，不管代码补全/聊天 UI
- **不桥接 GSD/OpenSpec**：YunShou 是替代品，不是包装层

---

## 14. 反模式与不做事项

### 14.1 v0.1 反模式

| ❌ 错误做法 | ✅ 正确做法 | 原因 |
|---|---|---|
| 把所有引擎塞进一个 mega-class | 4 引擎独立，通过事件流协作 | 易测试、易演进 |
| 用 `Write` 覆盖 CHANGELOG/状态文件 | 用 `Edit` 精确匹配 | 防误覆盖事故 |
| 任务拆得太大 (>30min) | 严格 5-15 分钟粒度 | 上下文容量限制 |
| 跳过 quality gate 直接 approve | 5 阶段流程必须走完 | 纪律约束 |
| prd.json 写大任务 | 每个 task 5-15 分钟 | GSD 经验 |
| 自动 watch/loop 执行（v0.1） | 生成提示 + 手动触发 | 安全第一 |

### 14.2 范围外（v0.2+）

- 多 IDE 全自动化驱动
- 多成员协作
- 权限审计
- 插件生态
- L2/L4/L6 完整 7 层记忆
- Web UI

---

## 附录 A: 关键决策回顾

| # | 决策 | 选择 | 时间点 |
|---|---|---|---|
| 1 | 框架定位 | 独立框架（自包含） | 第 1 问 |
| 2 | 目标用户 | 全功能（远景），v0.1 个人/小团队 | 第 2 问 |
| 3 | 第一阶段 | 核心引擎 | 第 3 问 |
| 4 | 技术栈 | Node.js + TypeScript + Bun | 第 4 问 |
| 5 | 适配策略 | 混合（CLI/MCP + 多端生成） | 第 5 问 |
| 6 | 数据模型 | Markdown + YAML + JSONL | 第 6 问 |
| 7 | 执行机制 | 生成提示 + 手动触发 | 第 7 问 |
| 8 | MVP 范围 | 核心引擎 + CLI + 1 IDE 垂直打通 | 第 8 问 |
| 9 | 横向子系统 | Memory + Task + Knowledge（第 1 轮修订） | 第 1 轮修订 |
| 10 | 借鉴 P0 项 | OpenSpec delta + superpowers 5 阶段 | 第 3 轮分析 |

---

## 附录 B: 后续步骤

- [ ] **本规格获用户批准**
- [ ] 调用 `writing-plans` 技能创建实现计划
- [ ] 实现计划分阶段执行（spec.md → 模板 → 引擎 → 适配器 → 接口）
- [ ] 每个阶段 commit + 测试
- [ ] 发布 @agents-workflow/yunshou@0.1.0 到 npm

---

*文档版本: v0.1 设计稿*
*最后更新: 2026-06-07*
