---
name: verification-before-completion
description: 完成前验证
category: 其他类
allowed-tools: [Bash, Read, Write, Edit]
---

## verification-before-completion

### 用途
在宣称工作完成、已修复或测试通过之前使用，在提交或创建 PR 之前——必须运行验证命令并确认输出后才能声称成功；始终用证据支撑断言。

### 使用方式
1. 识别验证标准
2. 运行验证命令
3. 收集证据
4. 确认结果
5. 记录验证状态

### 输入
- 验证标准
- 验证命令
- 预期结果

### 输出
- 验证报告
- 证据收集
- 状态确认

### 示例
```markdown
## 完成前验证

### 验证标准
- [ ] 所有测试通过
- [ ] Lint 无警告
- [ ] 类型检查通过
- [ ] 构建成功

### 验证执行
1. `npm test` → ✅ 150/150 通过
2. `npm run lint` → ✅ 0 警告
3. `npm run typecheck` → ✅ 无错误
4. `npm run build` → ✅ 构建成功

### 证据
- test-results.log
- lint-output.log
- build-output.log

### 结论
✅ 验证通过，可以完成
```
