---
name: archive-change
description: 归档已完成变更
category: 变更管理类
allowed-tools: [Bash, Read, Write, Edit]
---

## archive-change

### 用途
在实验性工作流中归档一个已完成的 change。当用户希望在实施完成后定稿并归档某个 change 时使用本技能。

### 使用方式
1. 验证所有任务已完成
2. 检查测试通过
3. 确认代码已合并
4. 更新文档
5. 移动到归档目录
6. 清理临时文件

### 输入
- Change 目录路径
- 可选：归档原因

### 输出
- 归档目录结构
- 变更摘要
- 经验总结
- 清理后的代码库

### 示例
```bash
# 验证完成状态
cat proposal/tasks.md | grep "\[x\]"

# 归档
mv changes/user-avatar changes/_archive/user-avatar-2024-01-15

# 生成归档摘要
echo "## Change: 用户头像上传" > changes/_archive/user-avatar-2024-01-15/README.md
echo "- 状态: 已完成" >> changes/_archive/user-avatar-2024-01-15/README.md
echo "- 完成日期: 2024-01-15" >> changes/_archive/user-avatar-2024-01-15/README.md
```
