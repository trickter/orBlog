---
status: pending
priority: p3
issue_id: '010'
tags: [code-review, performance, quality, nextjs, ui]
dependencies: []
---

# Sidebar avatar uses raw `<img>` and triggers Next.js lint warning

## Problem Statement

Sidebar avatar uses `<img>` directly, which triggers Next lint warning and misses built-in image optimization.

## Findings

- File: `src/components/Sidebar.tsx:25`
- `npm run lint` warning:
  - `@next/next/no-img-element`

## Proposed Solutions

### Option 1: Migrate to `next/image` (recommended)

**Approach:** Replace `<img>` with `Image` and provide width/height and appropriate sizing.

**Pros:**

- Better performance/LCP behavior
- Removes lint warning

**Cons:**

- Requires domain config if remote avatars are used

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep `<img>` with explicit lint-disable justification

**Approach:** Add local lint suppression with rationale.

**Pros:**

- Minimal code change

**Cons:**

- Keeps non-optimized image path
- Technical debt

**Effort:** Small

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected files:**

- `src/components/Sidebar.tsx`
- potentially `next.config.ts` (remote image domains)

## Resources

- Lint output from `npm run lint`

## Acceptance Criteria

- [ ] Lint warning removed or explicitly justified with comment
- [ ] Avatar renders correctly in light/dark modes
- [ ] No regressions in sidebar layout

## Work Log

### 2026-03-01 - Review finding captured

**By:** Codex

**Actions:**

- Ran lint on target branch
- Captured warning location and context

**Learnings:**

- UI polish branch still needs optimization pass for image component usage
