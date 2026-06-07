// 云枢 ESLint v9 flat config (阶段 0 任务 2 升级到 v9 flat config 格式)。
//
// 取代原 .eslintrc.cjs,延续 TypeScript strict + type-aware 规则,
// 复用 v8 plugin (parser 8.60.1 + plugin 8.60.1,已装在 package.json ^8.0.0)。
//
// 规则集与原 .eslintrc.cjs 等价 (v9 flat config 迁移):
//   - parser: @typescript-eslint/parser (启用 type-aware,project 指向
//     tsconfig.eslint.json,包含 src + tests)
//   - extends 等价: flat/recommended-type-checked + 自定义 rules
//   - rules: 5 个 @typescript-eslint 严格 + 2 个内置 (no-console / eqeqeq)
//   - 忽略: dist / node_modules / coverage / *.cjs / .yunshou
//   - globals: 手写 node 常用 (避免新增 globals 依赖)
//
// 与原 .eslintrc.cjs 的等价性:
//   - 原 plugin:@typescript-eslint/recommended-type-checked → 展开为
//     tseslint.configs["flat/recommended-type-checked"].rules
//   - 原 env: { node, es2023 } → 移到 languageOptions.globals
//   - 原 ignorePatterns → 移到顶层 ignores
//   - 原 rules 列表原样保留 (5 个 ts-eslint 严格 + 2 个内置)
//
// 设计权衡:
//   - 新建 tsconfig.eslint.json 包含 tests 仅供 ESLint 用,
//     typecheck 仍走 tsconfig.json (src-only, Commit C 设计)
//   - 这样既保留 type-aware 严格规则,又保持 typecheck 边界清晰

import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**", "*.cjs", ".yunshou/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        process: "readonly",
        console: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        setImmediate: "readonly",
        global: "readonly",
        globalThis: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        fetch: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      // 展开 v8 type-aware 推荐规则 (与 plugin:@typescript-eslint/recommended-type-checked 等价)
      ...tseslint.configs["flat/recommended-type-checked"].rules,
      // 项目级增强规则
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
    },
  },
];
