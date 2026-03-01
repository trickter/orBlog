---
status: completed
priority: p1
issue_id: '001'
tags: [code-review, security, authentication, nextjs]
dependencies: []
---

# Admin auth fails open when `ADMIN_SECRET` is unset

## Problem Statement

Admin route protection compares cookie value to `process.env.ADMIN_SECRET` directly. When `ADMIN_SECRET` is missing, both values can be `undefined`, which bypasses redirect logic and exposes admin pages.

## Findings

- `src/app/admin/(protected)/layout.tsx:11-14` reads cookie and checks `adminSecret !== process.env.ADMIN_SECRET`.
- With missing env and no cookie, comparison becomes `undefined !== undefined` (false), so access is allowed.
- Server actions still reject writes in some paths, but confidential admin content (draft list/edit forms) can be exposed.

## Proposed Solutions

### Option 1: Fail-closed env guard (recommended)

**Approach:** Explicitly reject when env is missing or empty, then validate cookie against env.

**Pros:**

- Immediate protection
- Minimal code change

**Cons:**

- Admin becomes unavailable until env is configured

**Effort:** Small

**Risk:** Low

---

### Option 2: Central auth helper

**Approach:** Create one `requireAdmin()` helper used by layout and all server actions.

**Pros:**

- Removes duplicated auth logic
- Reduces drift risk

**Cons:**

- Slight refactor across files

**Effort:** Medium

**Risk:** Low

## Recommended Action

## Technical Details

**Affected files:**

- `src/app/admin/(protected)/layout.tsx`
- `src/lib/actions.ts`
- `src/app/admin/api/login/route.ts`

## Resources

- Review evidence: `src/app/admin/(protected)/layout.tsx:11-14`

## Acceptance Criteria

- [ ] Access to `/admin` is denied if `ADMIN_SECRET` is missing
- [ ] Access to `/admin` is denied if cookie is missing/invalid
- [ ] Login route returns configuration error when `ADMIN_SECRET` is unset
- [ ] Manual verification confirms no fail-open path remains

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**

- Reviewed admin layout auth branch condition
- Validated undefined comparison behavior
- Classified as merge-blocking security risk

**Learnings:**

- Env-dependent auth checks must explicitly fail-closed
