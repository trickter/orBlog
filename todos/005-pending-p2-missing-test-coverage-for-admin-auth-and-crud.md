---
status: completed
priority: p2
issue_id: "005"
tags: [code-review, quality, testing, nextjs]
dependencies: []
---

# Missing automated tests for admin auth and CRUD critical paths

## Problem Statement

Feature introduces auth, write operations, and route protection, but no automated tests were added. This raises regression risk for security and data integrity.

## Findings

- No test files found for admin login route, protected layout behavior, or post CRUD server actions.
- Branch adds critical flows under:
  - `src/app/admin/api/login/route.ts`
  - `src/app/admin/(protected)/*`
  - `src/lib/actions.ts`

## Proposed Solutions

### Option 1: Add focused integration tests (recommended)

**Approach:** Add tests for login success/failure, protected route redirects, create/update/delete authorization checks.

**Pros:**
- Covers real behavior across boundaries
- Catches regressions early

**Cons:**
- Requires test harness setup

**Effort:** Medium

**Risk:** Low

---

### Option 2: Add unit tests only

**Approach:** Unit-test helper logic (`slugify`, auth checks) without route integration.

**Pros:**
- Faster initial coverage

**Cons:**
- Misses integration/auth wiring failures

**Effort:** Small

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files/components:**
- Admin login API route
- Protected admin layout gate
- Server actions for post mutations

## Resources

- Build/lint results do not include test execution; no test suite configured in `package.json` scripts

## Acceptance Criteria

- [ ] Tests cover unauthorized access for admin pages and actions
- [ ] Tests cover login route success/failure cases
- [ ] Tests cover create/update/delete post flows
- [ ] CI runs tests automatically

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**
- Audited branch for test assets and scripts
- Verified absence of tests for new critical paths

**Learnings:**
- Security-sensitive flows need regression protection before scale
