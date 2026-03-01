---
status: complete
priority: p2
issue_id: '012'
tags: [code-review, quality, frontend, error-handling, typescript]
dependencies: []
---

# Handle live-search server action failures gracefully

## Problem Statement

The live-search effect does not catch errors from the server action call. Failures can surface as unhandled promise rejections and leave UI state inconsistent.

## Findings

- `src/components/SearchBox.tsx:33-39` wraps request in `try/finally` but has no `catch` branch.
- If `searchPostsForDropdown` throws (DB timeout/network/server action error), the promise rejects and can produce noisy runtime errors.
- UI fallback behavior is undefined on failure (old results may remain until next input change).

## Proposed Solutions

### Option 1: Add explicit catch + safe fallback (recommended)

**Approach:** Add `catch` in the debounced async function. On error, clear results, close dropdown, optionally set a lightweight error message.

**Pros:**

- Minimal change
- Removes unhandled rejection path
- Predictable user behavior on backend failure

**Cons:**

- Requires small extra state if showing error text

**Effort:** 30-60 minutes

**Risk:** Low

---

### Option 2: Shared async request helper

**Approach:** Abstract request lifecycle (loading/success/error) into reusable hook/helper for search and similar components.

**Pros:**

- Better consistency across async UI flows
- Easier standardized error telemetry

**Cons:**

- Broader refactor for a localized issue

**Effort:** 2-3 hours

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected files:**

- `src/components/SearchBox.tsx:32-41`
- `src/lib/actions.ts:135-158` (error source endpoint)

**Related components:**

- `src/components/TopNav.tsx`

**Database changes (if any):**

- Migration needed? No

## Resources

- **Commit under review:** `d654ec1`
- **Review target branch:** `fix/top-nav-search-dropdown`

## Acceptance Criteria

- [ ] No unhandled promise rejection from live search path
- [ ] On backend failure, dropdown degrades gracefully (empty/closed or explicit error state)
- [ ] Loading state is reset correctly after failure
- [ ] Lint/build checks remain passing

## Work Log

### 2026-03-01 - Code Review Finding Created

**By:** Codex

**Actions:**

- Traced live-search async control flow and failure path.
- Confirmed missing catch handler for server action errors.
- Documented minimal and refactor-level remediation options.

**Learnings:**

- `finally` ensures loading reset, but it does not prevent rejection propagation.

## Notes

- This finding is about reliability/operability, not functional correctness on happy path.

### 2026-03-01 - Resolution

**By:** Codex

**Actions:**

- Implemented fix in code and validated via `npm run lint` + `npm run build`.

**Learnings:**

- Issue resolved in current branch.
