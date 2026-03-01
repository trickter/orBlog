---
status: completed
priority: p3
issue_id: '006'
tags: [code-review, quality, lint, cleanup]
dependencies: []
---

# Clean up unused server action and unused parameters in admin page

## Problem Statement

Lint reports unused symbols in admin page, adding noise and reducing maintainability.

## Findings

- `src/app/admin/(protected)/page.tsx:11` `deleteAction` is defined but never used.
- `src/app/admin/(protected)/page.tsx:91` inline server action parameter `formData` is unused.
- `npm run lint` reports 2 warnings.

## Proposed Solutions

### Option 1: Remove dead code and unused params (recommended)

**Approach:** Delete unused `deleteAction` and remove unused parameter in inline action.

**Pros:**

- Clears lint warnings
- Improves readability

**Cons:**

- None significant

**Effort:** Small

**Risk:** Low

---

### Option 2: Reuse extracted action function

**Approach:** Wire form to existing extracted action to reduce inline logic.

**Pros:**

- Cleaner component structure

**Cons:**

- Slightly larger refactor

**Effort:** Small

**Risk:** Low

## Recommended Action

## Technical Details

**Affected files:**

- `src/app/admin/(protected)/page.tsx`

## Resources

- Lint output from `npm run lint`

## Acceptance Criteria

- [ ] `npm run lint` returns no warnings for this file
- [ ] Admin delete behavior still works

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**

- Ran lint
- Captured unused symbol warnings

**Learnings:**

- Keeping zero-warning lint baseline reduces review noise
