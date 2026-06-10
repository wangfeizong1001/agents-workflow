# 项目规则

> 本文件继承 `~/.config/opencode/AGENTS.md` 和 `~/.claude/CLAUDE.md` 的全局规则。

## 语言与沟通
- 始终使用**中文**回复用户
- **思考过程（thinking）也使用中文**，包括分析、推理、决策过程
- 代码内注释使用**中文**
- 用户可见的所有文本（README、提交信息、日志说明、错误解释）使用中文
- 错误信息可保留原始英文原文，但**必须**附中文翻译和解决方案
- 直接使用中文技术术语，无需附英文原文
- 文件名、变量名、API 路径等代码标识符保持英文

## 代码风格
- 优先使用 **TypeScript** 而非 JavaScript
- 命名约定：组件/类用 `PascalCase`，函数/变量用 `camelCase`，常量用 `UPPER_SNAKE_CASE`
- 文件命名：组件用 `PascalCase.tsx`，工具函数用 `kebab-case.ts`
- 函数尽量保持单一职责，超过 50 行考虑拆分
- 避免深度嵌套（if/for 嵌套不超过 3 层）

## TypeScript 类型规则
- **禁止**使用 `any`；不确定类型时使用 `unknown` 并通过类型守卫收窄
- 必须启用 `tsconfig.json` 的 `"strict": true`（包含 `noImplicitAny`、`strictNullChecks` 等）
- 公共函数必须显式声明参数类型与返回类型
- 优先使用 `interface` 定义对象类型；联合/交叉/工具类型用 `type`
- 避免不必要的类型断言 `as`；必要时附中文注释说明原因
- 禁止使用 `@ts-ignore`；如确需临时绕过，使用 `@ts-expect-error` 并附说明
- 枚举优先使用 `as const` 对象 + 字面量联合类型，避免 `enum`
- 不可变数据使用 `readonly`；数组使用 `readonly T[]` 或 `ReadonlyArray<T>`

## 国内环境
- **包管理器镜像源**（按需选用，初始化项目时优先配置）
  - npm/pnpm/yarn/bun：npmmirror（`https://registry.npmmirror.com`）
  - pip：清华源（`https://pypi.tuna.tsinghua.edu.cn/simple`）或阿里源
  - Go：`GOPROXY=https://goproxy.cn,direct`
  - Cargo：rsproxy（`https://rsproxy.cn`）
  - Maven/Gradle：阿里云（`https://maven.aliyun.com/repository/public`）
  - Docker：优先使用国内仓库（`registry.cn-hangzhou.aliyuncs.com` 等）
- **代码托管**：GitHub 拉取/克隆失败时，使用 `ghproxy.com` 或 `mirror.ghproxy.com` 镜像
- **AI 模型/API 优先级**（按需选用）
  - 优先使用国内模型：通义千问 Qwen、智谱 GLM、DeepSeek、Kimi、字节豆包
  - 涉及 OpenAI/Anthropic 等海外服务时先与用户确认网络与费用
- **云服务**：默认推荐阿里云、腾讯云、华为云
- **时区与日期**：使用 `Asia/Shanghai`（UTC+8），日期格式 `YYYY-MM-DD`，时间格式 `HH:mm:ss`

## 安全与 Git
- **禁止**直接 push 到 `main` / `master` 分支
- **禁止**提交 `.env`、`*.key`、`credentials.json` 等敏感文件
- **禁止**使用 `git push --force`（除非用户明确要求）
- **禁止**跳过 hooks（`--no-verify`、`--no-gpg-sign`）
- 提交信息使用中文，格式：`类型: 简述`（如 `修复: 修复登录页样式问题`）
- 涉及生产环境、数据库、密钥的操作必须先与用户确认

## 工作流与确认
- 涉及多个文件或架构变更时，先给出方案再实施
- 修改完成后自动运行 lint 和 typecheck（如项目已配置）
- 创建新功能前先检查项目中是否已有类似实现
- 不要主动创建 `*.md` 文档或 README（除非用户明确要求）
- 完成任务后简要说明修改了哪些文件，不做过度解释
- 优先使用项目已有的库和工具，避免引入重复依赖
