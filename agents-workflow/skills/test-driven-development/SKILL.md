---
name: test-driven-development
description: 红 → 绿 → 重构 TDD 循环
category: 开发方法类
allowed-tools: [Bash, Read, Write, Edit]
---

## test-driven-development

### 用途
在实现任何功能或修复 bug 时使用，在编写实现代码之前。遵循红 → 绿 → 重构循环。

### 使用方式
1. **红**: 编写失败的测试
2. **绿**: 编写最小代码使测试通过
3. **重构**: 改善代码结构
4. 重复循环

### 输入
- 功能需求
- 接口定义
- 验收标准

### 输出
- 测试套件
- 实现代码
- 重构后的代码

### 示例
```typescript
// 红: 编写失败的测试
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});

// 绿: 最小实现
function add(a: number, b: number): number {
  return a + b;
}

// 重构: 改善
function add(a: number, b: number): number {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Arguments must be numbers');
  }
  return a + b;
}
```
