---
title: TopNav 导航布局与文案调整（orBlog + 居中搜索 + 右侧中文菜单）
type: feat
status: active
date: 2026-03-01
origin: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md
---

# TopNav 导航布局与文案调整（orBlog + 居中搜索 + 右侧中文菜单）

## Overview

将当前顶部导航栏调整为以下布局：
- 左侧品牌文案改为 `orBlog`
- 中间放置搜索栏
- 最右侧放置 `分类` 与 `关于`（中文显示）

此改动为 UI/信息架构优化，不涉及数据模型与后端接口变更。

## Problem Statement / Motivation

当前 `TopNav` 信息层级与目标设计不一致：
- 品牌名不是目标文案
- 搜索栏位置不在视觉中心
- 菜单项文案为英文且不在最右侧

会导致导航识别成本偏高，且与既定中文化界面方向不统一。

## Research Summary

### Brainstorm Foundation

发现并沿用 brainstorm：`docs/brainstorms/2026-03-01-personal-blog-brainstorm.md`（2026-03-01）。

继承的关键决策：
- 继续使用 Next.js + Tailwind 的单仓模式（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）
- 博客为自托管个人站，优先简洁可维护 UI（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）
- 保持现有信息架构（首页/分类/关于/搜索）并做导航可用性优化（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）

### Repo Research (local)

- 主要改动文件：`src/components/TopNav.tsx`
- 承载入口：`src/components/BlogLayout.tsx`
- 使用页面：`src/app/page.tsx`, `src/app/search/page.tsx`, `src/app/category/[slug]/page.tsx`, `src/app/posts/[slug]/page.tsx`, `src/app/about/page.tsx`
- 现有模式：导航、搜索均在 `TopNav` 内部实现，适合做局部布局重排，不需要改动后端 action

### Learnings Research

- `docs/solutions/` 不存在，暂无可复用 institutional learnings。

### External Research Decision

- 决策：**跳过外部研究**。
- 原因：需求明确、风险低、代码库已有成熟 `TopNav` 与 Tailwind 布局模式，外部资料增益有限。

## Proposed Solution

在 `TopNav` 中将布局改为三段式结构：

1. 左区（品牌）：`orBlog`
2. 中区（搜索）：搜索输入与图标，视觉居中
3. 右区（菜单）：`分类`、`关于`（中文）

其中：
- `分类` 保留现有 dropdown 行为（可展开类别列表）
- `关于` 保持链接到 `/about`
- 文案统一中文（除品牌名 `orBlog`）

## Technical Considerations

- 不改动 `src/lib/actions.ts` 与数据库层
- 仅调整前端组件结构与 className，保持最小改动
- 响应式下需要验证：小屏不遮挡、不换行错位
- 可访问性：保持按钮语义与可聚焦状态，避免仅靠 hover 可用

## System-Wide Impact

- **Interaction graph**:
  - 点击 `分类` → `TopNav` 内部 `showCategories` 状态切换
  - 点击分类项 → 路由跳转 `/category/[slug]` 并关闭下拉
  - 提交搜索表单 → 跳转 `/search?q=...`
- **Error propagation**:
  - 纯前端布局调整，不引入新异常处理链路
- **State lifecycle risks**:
  - 仅组件内 transient UI state（dropdown 开关），无持久化状态
- **API surface parity**:
  - 不新增 API，不影响 admin 或 server actions
- **Integration test scenarios**:
  - 桌面端：品牌/搜索/右侧菜单位置符合预期
  - 移动端：菜单与搜索可见可点、无重叠
  - 分类下拉：展开、点击分类、自动关闭

## SpecFlow Analysis (Manual)

针对该需求的关键流程与边界：
- Happy path：导航展示正确，搜索可提交，分类/关于可跳转
- Edge case：
  - 类别为空时，`分类` dropdown 行为需稳定（可显示 “全部文章” 或空态）
  - 长搜索词不应撑破布局
  - 小屏宽度下不应产生不可点击区域
- Failure scenario：
  - 若 `/about` 或分类路由不可用，应有标准 Next.js 404，而非导航崩溃

结论：需求完整，无额外阻塞性规格缺口。

## Implementation Checklist

- [ ] 调整 `src/components/TopNav.tsx` 的三段式布局（左/中/右）
- [ ] 品牌文案改为 `orBlog`（`src/components/TopNav.tsx`）
- [ ] 将右侧菜单文案改为中文：`分类`、`关于`（`src/components/TopNav.tsx`）
- [ ] 确保搜索栏位于中间区域且在常见断点布局稳定（`src/components/TopNav.tsx`）
- [ ] 验证 `BlogLayout` 引用无兼容问题（`src/components/BlogLayout.tsx`）
- [ ] 手动验证页面：
  - `src/app/page.tsx`
  - `src/app/search/page.tsx`
  - `src/app/category/[slug]/page.tsx`
  - `src/app/about/page.tsx`
- [ ] 运行质量检查：`npm run lint`、`npm run build`

## Acceptance Criteria

- [ ] 顶栏左侧品牌显示为 `orBlog`
- [ ] 搜索栏在导航视觉中间位置
- [ ] 右侧显示中文菜单项：`分类`、`关于`
- [ ] `分类` 下拉仍可正常打开并跳转到分类页
- [ ] `关于` 链接正常跳转 `/about`
- [ ] 桌面与移动端布局无明显重叠/截断
- [ ] `npm run lint` 与 `npm run build` 通过

## Success Metrics

- 导航主路径点击成功率 100%（手工回归）
- 无新增 lint/build 错误
- 页面首屏导航信息层级与目标一致（品牌-搜索-菜单）

## Dependencies & Risks

- 依赖：现有 `TopNav` 组件与 Tailwind 样式体系
- 风险：响应式断点下中间搜索栏可能挤压右侧菜单
- 缓解：优先使用弹性布局 + 最小宽度约束，并进行多断点截图核对

## Sources & References

- **Origin brainstorm:** [docs/brainstorms/2026-03-01-personal-blog-brainstorm.md](/app/ai-code/brainstorm/docs/brainstorms/2026-03-01-personal-blog-brainstorm.md)
- Existing nav implementation: [src/components/TopNav.tsx](/app/ai-code/brainstorm/src/components/TopNav.tsx)
- Layout entry point: [src/components/BlogLayout.tsx](/app/ai-code/brainstorm/src/components/BlogLayout.tsx)
- Related plan context: [docs/plans/2026-03-01-feat-profile-nav-category-plan.md](/app/ai-code/brainstorm/docs/plans/2026-03-01-feat-profile-nav-category-plan.md)
