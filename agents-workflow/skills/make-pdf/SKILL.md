---
name: make-pdf
description: markdown → 出版品质 PDF
category: 文档类
allowed-tools: [Bash, Read, Write, Edit]
---

## make-pdf

### 用途
Turn any markdown file into a publication-quality PDF. Proper 1in margins, intelligent page breaks, page numbers, cover pages, running headers, curly quotes and em dashes, clickable TOC.

### 使用方式
1. 读取 markdown 文件
2. 应用排版规则
3. 生成目录
4. 添加页眉页脚
5. 输出 PDF

### 输入
- Markdown 文件路径
- 可选：封面信息
- 可选：样式选项

### 输出
- 出版品质 PDF
- 可点击目录
- 页码和页眉

### 示例
```bash
# 生成 PDF
make-pdf --input docs/README.md --output docs.pdf

# 带封面
make-pdf --input docs/README.md --output docs.pdf \
  --title "项目文档" --author "团队"
```

```markdown
## PDF 特性
- 1 英寸页边距
- 智能分页
- 页码
- 封面页
- 运行页眉
- 可点击目录
```
