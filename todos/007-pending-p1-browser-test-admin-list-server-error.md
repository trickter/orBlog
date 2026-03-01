---
status: completed
priority: p1
issue_id: "007"
tags: [code-review, browser-test, p1, nextjs, admin]
dependencies: []
---

# Browser test failure: `/admin` list page crashes with server-side exception

## Problem Statement

End-to-end browser testing found that authenticated access to `/admin` fails with a server-side exception instead of rendering the posts table. This is a merge-blocking runtime issue on a primary admin route.

## Findings

- Route under test: `/admin` (authenticated session)
- Error page shown: `Application error: a server-side exception has occurred...`
- Digest: `37513251`
- Console/runtime error:
  - `Event handlers cannot be passed to Client Component props.`
  - ` <button ... onClick={function onClick} ...>`
- Likely location: `src/app/admin/(protected)/page.tsx` where a Server Component renders a button with `onClick`.

## Proposed Solutions

### Option 1: Remove client handler from Server Component (recommended)

**Approach:** Replace inline `onClick` confirm logic with server-safe approach (e.g., dedicated client component wrapper for delete button, or native form flow without client handler).

**Pros:**
- Fixes runtime crash
- Keeps RSC boundaries valid

**Cons:**
- Requires slight restructuring of delete UX

**Effort:** Small

**Risk:** Low

---

### Option 2: Extract action row into Client Component

**Approach:** Move interactive row/buttons to a `use client` component and pass server action references safely.

**Pros:**
- Clear separation of server/client responsibilities

**Cons:**
- Slightly larger refactor

**Effort:** Medium

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `src/app/admin/(protected)/page.tsx`

**Evidence artifacts:**
- `test-artifacts/browser/admin-list-with-post-full.png`

## Resources

- Browser test run (headless, agent-browser)
- Error digest: `37513251`

## Acceptance Criteria

- [ ] `/admin` renders post list without server exception
- [ ] Delete UX still works (with confirmation path)
- [ ] Browser retest passes for `/admin`, `/admin/new`, `/admin/edit/[id]`
- [ ] No new console/runtime errors on admin flows

## Work Log

### 2026-03-01 - Browser test capture

**By:** Codex

**Actions:**
- Executed agent-browser E2E flows on changed routes
- Captured runtime failure on authenticated `/admin`
- Saved screenshot and logged server/runtime error details

**Learnings:**
- RSC boundary violation in admin table action button currently breaks the page at runtime
