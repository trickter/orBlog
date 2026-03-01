---
status: pending
priority: p1
issue_id: "009"
tags: [code-review, runtime, nextjs, react-server-components, admin]
dependencies: []
---

# Category delete button uses `onClick` in Server Component

## Problem Statement

`src/app/admin/(protected)/categories/page.tsx` attaches an `onClick` confirmation handler inside a Server Component. This pattern previously caused runtime/server render failure in this codebase and is not valid for RSC-only markup.

## Findings

- File: `src/app/admin/(protected)/categories/page.tsx:84-88`
- Button inside server-rendered table row uses:
  - `onClick={(e) => { if (!confirm(...)) e.preventDefault(); }}`
- Same anti-pattern earlier caused admin page failure (`Event handlers cannot be passed to Client Component props`).

## Proposed Solutions

### Option 1: Extract client delete button component (recommended)

**Approach:** Reuse/extend `DeletePostButton` pattern for categories. Keep server action as prop, keep confirm state in client component.

**Pros:**
- Aligns with RSC boundary rules
- Consistent with existing code pattern

**Cons:**
- Adds one small component

**Effort:** Small

**Risk:** Low

---

### Option 2: Remove client confirm and submit directly

**Approach:** Keep pure server form submit without interactive confirmation.

**Pros:**
- Simplest implementation

**Cons:**
- Worse UX and accidental deletion risk

**Effort:** Small

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `src/app/admin/(protected)/categories/page.tsx`
- (likely new) `src/components/DeleteCategoryButton.tsx`

## Resources

- Evidence: `src/app/admin/(protected)/categories/page.tsx:84-88`
- Related known incident: prior admin delete flow RSC event-handler crash

## Acceptance Criteria

- [ ] Category list page renders without RSC event-handler violations
- [ ] Category delete still requires user confirmation
- [ ] `npm run build` and manual `/admin/categories` navigation succeed

## Work Log

### 2026-03-01 - Review finding captured

**By:** Codex

**Actions:**
- Reviewed categories admin table action implementation
- Flagged server/client boundary violation pattern

**Learnings:**
- Interactive confirmation logic must live in Client Components in this stack
