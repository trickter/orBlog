---
status: pending
priority: p1
issue_id: "008"
tags: [code-review, quality, build, nextjs, admin]
dependencies: []
---

# Profile admin page fails build due to missing `cookies` import

## Problem Statement

The admin profile page uses `cookies()` inside a server action but does not import it from `next/headers`, causing TypeScript build failure. This blocks release.

## Findings

- File: `src/app/admin/(protected)/profile/page.tsx:24`
- `cookies()` is referenced but no import exists at file top.
- Reproduced by build:
  - `npm run build` fails with `Type error: Cannot find name 'cookies'`.

## Proposed Solutions

### Option 1: Add missing import (recommended)

**Approach:** Add `import { cookies } from "next/headers";` to the profile page file.

**Pros:**
- Minimal fix
- Restores successful build quickly

**Cons:**
- No architectural cleanup

**Effort:** Small

**Risk:** Low

---

### Option 2: Move auth/session extraction into shared helper

**Approach:** Create helper for reading `admin_session` in server actions and reuse across admin pages.

**Pros:**
- Reduces copy/paste mistakes
- Better maintainability

**Cons:**
- Slight refactor scope increase

**Effort:** Medium

**Risk:** Low

## Recommended Action


## Technical Details

**Affected files:**
- `src/app/admin/(protected)/profile/page.tsx`

## Resources

- Build output from `npm run build`

## Acceptance Criteria

- [ ] `npm run build` passes on `feat/profile-nav-category`
- [ ] `cookies()` usage in profile page resolves without TS errors
- [ ] Profile save flow still works in manual test

## Work Log

### 2026-03-01 - Review finding captured

**By:** Codex

**Actions:**
- Ran build on target branch
- Collected failing file/line evidence

**Learnings:**
- Admin server actions currently rely on duplicated session-read snippets; helperization would reduce recurrence
