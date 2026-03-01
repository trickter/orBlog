---
title: Add infinite scroll loading for blog post feed
type: feat
status: completed
date: 2026-03-01
origin: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md
---

# Add Infinite Scroll Loading for Blog Post Feed

## Overview

为博客首页增加“滚动到底部再加载下一批文章”的动态加载能力，目标体验接近知乎信息流：首屏只加载一批文章，用户下滑时才请求下一批，直到数据结束。

Found brainstorm from 2026-03-01: personal blog platform. Using as foundation for planning.

本方案沿用既有架构决策：

- Next.js 全栈单仓（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）
- SQLite + Prisma 数据访问（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）
- Tailwind 组件风格与现有博客布局保持一致（see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md）

## Problem Statement / Motivation

当前首页在服务端一次性加载全部文章（`getPosts` 无分页参数），会带来：

- 初始负载随着文章数增长而变慢
- 数据库查询和渲染成本不必要地集中在首屏
- 用户无法获得连续流式浏览体验

需要改为按需分页加载，保证首屏快、滚动平滑、失败可恢复。

## Research Summary

### Local Research (repo-research-analyst + learnings-researcher)

- 现状入口：`src/app/page.tsx:13-44` 使用 `getPosts(category)` 一次性取数据。
- 数据层：`src/lib/actions.ts:23-48` 的 `getPosts` 无 `take/cursor`。
- 展示层：`src/components/PostCard.tsx:19-51` 已可复用，无需重写卡片。
- 布局层：`src/components/BlogLayout.tsx:25-42` + `TopNav` 可保留。
- Institutional learnings：仓库当前不存在 `docs/solutions/` 与 `critical-patterns`，无可继承历史条目。

### External Research Decision (Step 1.5)

Decision: **进行外部研究**。原因：仓库内没有现成 infinite scroll 模式，且分页策略（offset/cursor）会显著影响后续性能与复杂度。

### External Research (best-practices + framework-docs)

- Next.js App Router 官方建议：动态数据使用 `fetch(..., { cache: 'no-store' })` 或路由动态化策略，避免误缓存旧列表（Next.js docs v16.1.6）。
- React 官方建议：异步加载必须有 cleanup / ignore 机制，防止旧请求覆盖新状态；浏览器 API（IntersectionObserver）应在 `useEffect` 中正确 `disconnect()` 清理。
- Prisma 官方建议：
  - offset 分页（`skip/take`）简单但大偏移性能差。
  - cursor 分页更适合 infinite scroll（按稳定排序字段向后取）。
- MDN：IntersectionObserver 是实现触底加载的标准方案，可替代高频 scroll 监听，减少主线程负担。

## Proposed Solution

采用“**服务端首批 + 客户端触底增量加载 + cursor 分页**”方案：

1. 首页服务端渲染首批（例如 10 条）保证 SEO 和首屏内容。
2. 新增分页读取接口（Route Handler 或 server action 专用分页函数），返回：
   - `items`
   - `nextCursor`
   - `hasMore`
3. 客户端 `InfinitePostList` 组件维护列表状态，使用 `IntersectionObserver` 观察底部 sentinel。
4. 触底时请求下一页，成功 append，失败显示“重试加载”入口。
5. 加载完成时停止观察，避免无意义请求。

## Technical Considerations

- Architecture impacts:
  - 新增分页读模型，但不改写现有 PostCard/BlogLayout 主结构。
  - 仅对首页流式列表生效，后台管理与详情页逻辑不受影响。
- Performance implications:
  - 首屏 payload 与查询显著下降。
  - cursor 分页避免大 offset 扫描。
  - IntersectionObserver 低开销触发，避免 scroll 事件抖动。
- Security considerations:
  - 只读取已发布文章（复用 `published: true` 约束）。
  - 接口参数做长度与类型校验，防止异常输入导致全表压力。

## System-Wide Impact

- **Interaction graph**:
  - `Home page` 首次渲染 -> `getPostsPage`（首批）-> 返回 items + cursor。
  - `InfinitePostList` 触底 -> 请求 `/api/posts`（cursor）-> Prisma `findMany` -> append UI。
- **Error propagation**:
  - API 层返回 4xx/5xx -> 客户端进入错误状态 -> 用户可重试。
  - 取消/过时请求不更新状态（ignore flag / request id guard）。
- **State lifecycle risks**:
  - 并发触发可能重复 append；需 `isLoading` 锁 + cursor 去重。
  - 分类切换时需 reset 列表与 observer，避免旧分类数据串入。
- **API surface parity**:
  - 首页 `/` 与分类页 `/?category=...` 的加载行为需一致。
  - 搜索页暂不纳入本次范围（保留现状）。
- **Integration test scenarios**:
  - 首屏加载 + 首次触底加载成功。
  - 快速连续触底仅触发一次有效请求。
  - 最后一页后 `hasMore=false` 停止请求。
  - 分类切换后 cursor 重置且数据正确。
  - 请求失败后点击重试恢复。

## SpecFlow Analysis

### Primary Flow

1. 用户访问首页，看到第一批文章。
2. 用户向下滚动到列表底部。
3. 底部 sentinel 进入视口，触发下一页请求。
4. 新文章追加在列表后。
5. 如有更多，继续；否则显示“已加载全部”。

### Edge Cases Identified

- 空数据集：首屏显示空态，不显示加载 sentinel。
- 数据总量小于首批：不触发增量请求。
- 网络抖动：请求超时/失败后提供重试按钮。
- 快速滚动：observer 多次触发要去抖并忽略过期响应。
- 数据新增：滚动期间后台新增文章时，不打断当前分页顺序（按 cursor 连续性优先）。

### Acceptance Criteria Updates from SpecFlow

- 新增“并发请求防重”与“失败可恢复”验收项。
- 新增“分类切换重置分页状态”验收项。

## Acceptance Criteria

- [x] 首页初次请求仅加载首批文章（例如 10 条），不再一次性拉全量。
- [x] 下滑到底部自动加载下一批，列表连续追加。
- [x] 当没有更多数据时，停止请求并展示结束状态。
- [x] 网络失败时展示可见错误提示与重试入口。
- [x] 分类过滤场景下分页同样生效，切换分类会重置分页状态。
- [x] 不出现重复文章、不出现乱序覆盖（过时请求不会写入）。
- [x] `npm run lint` 与 `npm run build` 通过。

## Success Metrics

- 首屏文章查询量从“全量”降为“固定首批”。
- 首屏渲染时长与首屏 HTML 体积下降（相对现状）。
- 滚动加载过程无明显卡顿、无重复请求风暴。
- 用户可连续浏览长列表，无手动翻页中断。

## Dependencies & Risks

- Dependencies:
  - 复用现有 Prisma Post 查询能力。
  - 新增客户端列表组件与 API/Action 分页入口。
- Risks:
  - Cursor 选择不当会导致分页重复/跳项（需稳定排序：`createdAt desc, id desc`）。
  - Observer 清理不当会造成内存泄露或多重订阅。
  - SEO 预期管理：首屏可抓取，后续增量主要面向交互体验。

## Implementation Sketch

### File Plan

- `src/lib/actions.ts`
  - 新增 `getPostsPage({ categorySlug, cursor, limit })`
- `src/app/page.tsx`
  - 改为获取首批数据并下发到客户端列表组件
- `src/components/InfinitePostList.tsx` (new)
  - 管理 items/cursor/loading/error/hasMore
  - 使用 IntersectionObserver + sentinel
- `src/app/api/posts/route.ts` (new, optional but recommended)
  - 返回分页 JSON，供客户端 fetch

### Pseudocode

#### src/lib/actions.ts

```ts
export async function getPostsPage(params: {
  categorySlug?: string;
  cursor?: { createdAt: string; id: string } | null;
  limit?: number;
}) {
  // validate limit <= 20
  // query published posts with stable order
  // apply cursor condition if provided
  // return { items, nextCursor, hasMore }
}
```

#### src/components/InfinitePostList.tsx

```tsx
useEffect(() => {
  const observer = new IntersectionObserver(onHitBottom, {
    root: null,
    threshold: 0,
  });
  observer.observe(sentinelRef.current!);
  return () => observer.disconnect();
}, [onHitBottom]);

async function loadMore() {
  if (loading || !hasMore) return;
  // request-id guard
  // fetch next page
  // append items and update cursor
}
```

## Testing Plan

- Unit-level:
  - 分页函数在不同 cursor/limit/category 输入下返回正确 `hasMore/nextCursor`。
- Integration-level:
  - 首页加载首批 -> 触底追加 -> 结束态。
  - 分类切换后状态重置。
  - 失败重试路径。
- Manual:
  - PC 与移动端滚动体验检查。
  - 数据量 5 / 20 / 200 三档验证。

## AI-Era Considerations

- [ ] 使用 AI 辅助生成分页边界测试样例（cursor 首尾、空集、重复请求）。
- [ ] 对 AI 生成的 observer 逻辑进行人工审查（重点 cleanup 与竞态）。
- [ ] 在 PR 中明确标注自动生成/人工校验的代码段。

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-03-01-personal-blog-brainstorm.md](docs/brainstorms/2026-03-01-personal-blog-brainstorm.md)
  - Carried-forward decisions: Next.js full-stack, SQLite persistence, Tailwind UI, self-hosted deployment.

### Internal References

- Similar list rendering: `src/app/page.tsx:13-44`
- Current query shape: `src/lib/actions.ts:23-48`
- Card presentation reuse: `src/components/PostCard.tsx:19-51`

### External References

- Next.js App Router data fetching & caching (v16.1.6):
  - https://github.com/vercel/next.js/blob/v16.1.6/docs/01-app/01-getting-started/07-fetching-data.mdx
  - https://github.com/vercel/next.js/blob/v16.1.6/docs/01-app/02-guides/caching.mdx
- React useEffect cleanup / race handling:
  - https://react.dev/learn/synchronizing-with-effects
  - https://react.dev/reference/react/useEffect
- Prisma pagination guidance:
  - https://github.com/prisma/docs/blob/v6.19.0/content/200-orm/200-prisma-client/100-queries/055-pagination.mdx
- IntersectionObserver reference:
  - https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

## Pre-submission Checklist

- [x] Title is searchable and descriptive
- [x] Issue type is accurate (`feat`)
- [x] Acceptance criteria are measurable
- [x] File-level implementation sketch included
- [x] SpecFlow edge cases incorporated
- [x] No database schema change required (ERD not applicable)
