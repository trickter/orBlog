---
status: completed
priority: p2
issue_id: '002'
tags: [code-review, security, session-management, nextjs]
dependencies: []
---

# Admin cookie stores raw secret value

## Problem Statement

The login endpoint writes the raw admin secret to a cookie, then layout compares cookie value to env secret. This increases blast radius if cookie leaks and couples auth state to static credential material.

## Findings

- `src/app/admin/api/login/route.ts:8-15` stores `secret` directly in `admin_secret` cookie.
- `src/app/admin/(protected)/layout.tsx:11-14` validates via direct equality to `process.env.ADMIN_SECRET`.
- Pattern lacks signed/rotatable session token semantics.

## Proposed Solutions

### Option 1: Signed session cookie (recommended)

**Approach:** On successful login, issue signed session token (HMAC/JWT/server session id) instead of storing admin secret.

**Pros:**

- Secret is never persisted client-side
- Supports rotation/invalidation

**Cons:**

- Requires session signing logic

**Effort:** Medium

**Risk:** Low

---

### Option 2: Opaque server session store

**Approach:** Store short random session ID in cookie and map it server-side.

**Pros:**

- Strongest control over invalidation
- No secret material in cookies

**Cons:**

- Requires persistence layer/cache

**Effort:** Medium

**Risk:** Low

## Recommended Action

## Technical Details

**Affected files:**

- `src/app/admin/api/login/route.ts`
- `src/app/admin/(protected)/layout.tsx`

## Resources

- Review evidence: `src/app/admin/api/login/route.ts:8-15`

## Acceptance Criteria

- [ ] Cookie does not contain raw `ADMIN_SECRET`
- [ ] Admin auth uses signed/opaque session token
- [ ] Logout/invalidation path documented
- [ ] Existing admin workflow still functions

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**

- Reviewed login/session implementation
- Flagged credential-in-cookie anti-pattern

**Learnings:**

- Auth state should be decoupled from primary credential values
