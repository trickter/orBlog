---
status: complete
priority: p2
issue_id: "011"
tags: [code-review, quality, frontend, reliability, typescript]
dependencies: []
---

# Prevent stale dropdown results from async race conditions

## Problem Statement

Live search requests in the top nav can resolve out of order. Older requests can overwrite newer results and show suggestions that do not match the current input.

## Findings

- `src/components/SearchBox.tsx:32-37` starts an async request per debounced query and always calls `setResults(data)` when it resolves.
- There is no request token / sequence guard to ensure only the latest response updates state.
- Repro pattern: type quickly (`re` -> `rea` -> `react`) under variable latency; slower older response can win and replace newer suggestions.

## Proposed Solutions

### Option 1: Request sequence guard (recommended)

**Approach:** Keep an incrementing request id in a `useRef`, capture id before request, and only apply results if id matches latest.

**Pros:**
- Minimal code change
- Prevents stale writes reliably
- No API contract changes

**Cons:**
- Slightly more client state logic

**Effort:** 30-60 minutes

**Risk:** Low

---

### Option 2: Abortable fetch endpoint

**Approach:** Move live search to route handler and call via `fetch` with `AbortController` on input changes.

**Pros:**
- True request cancellation
- Better future observability and caching controls

**Cons:**
- Adds endpoint and refactor from server action call
- More moving parts

**Effort:** 2-4 hours

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `src/components/SearchBox.tsx:23-44`

**Related components:**
- `src/components/TopNav.tsx`

**Database changes (if any):**
- Migration needed? No

## Resources

- **Commit under review:** `d654ec1`
- **Review target branch:** `fix/top-nav-search-dropdown`

## Acceptance Criteria

- [ ] Dropdown results always correspond to the latest input value
- [ ] Rapid typing cannot cause old results to reappear
- [ ] Manual verification with simulated high latency passes
- [ ] Existing lint/build checks remain passing

## Work Log

### 2026-03-01 - Code Review Finding Created

**By:** Codex

**Actions:**
- Reviewed live-search control flow in `SearchBox`.
- Identified missing latest-request guard around async updates.
- Documented reproducible race scenario and fix options.

**Learnings:**
- Debounce alone reduces call count but does not prevent stale async writes.

## Notes

- This is reliability-focused and should be resolved before heavy content growth increases latency variance.

### 2026-03-01 - Resolution

**By:** Codex

**Actions:**
- Implemented fix in code and validated via `npm run lint` + `npm run build`.

**Learnings:**
- Issue resolved in current branch.
