---
title: Fix top nav layout, add search dropdown, enhance category management
type: fix
status: completed
date: 2026-03-01
---

# Fix Top Nav Layout, Add Search Dropdown, Enhance Category Management

## Problem Statement

1. **Top nav layout issue**: 分类 and 关于 are positioned incorrectly - they should be in the same row as orblog logo and search bar
2. **Category management**: Need to add delete capability (may already exist in admin, need to verify)
3. **Search enhancement**: Add dynamic search dropdown with live search suggestions as user types

## Current Layout

```
TopNav:
[orBlog] [搜索框] [分类▼] [关于]

Sidebar (below):
[头像] [名字] [简介] [社交链接]
```

## Desired Layout

```
TopNav:
[orBlog] [搜索框+下拉建议] [分类▼] [关于]

Sidebar (below):
[头像] [名字] [简介] [社交链接]
```

## Technical Requirements

### 1. Fix Top Nav Layout (P1)

- Fix grid layout to have all items in one row
- orblog logo | search bar | 分类 dropdown | 关于 link
- Remove syntax error: `useState(false));` → `useState(false);`

### 2. Dynamic Search Dropdown (P1)

- Add client-side search with debounce
- Show dropdown with matching posts as user types
- Click on result navigates to post
- Minimum 2 characters to trigger search

### 3. Category Management (P2)

- Verify delete capability exists in admin
- Add quick delete option in category dropdown (optional)

**Verification result:** Category delete capability already exists in admin categories page via `DeleteButton` + `deleteCategoryFromClient`.

## Files to Modify

- `src/components/TopNav.tsx` - Fix layout and add search dropdown
- `src/components/SearchBox.tsx` - New search dropdown component
- `src/lib/actions.ts` - Add searchPostsForDropdown function

## Acceptance Criteria

- [x] Top nav shows orblog | 搜索栏 | 分类 | 关于 in same row
- [x] Search input shows dropdown with matching posts as user types
- [x] Clicking search result navigates to post
- [x] Category management exists in admin panel (verify)
