---
status: completed
priority: p2
issue_id: "003"
tags: [code-review, security, abuse-prevention, nextjs]
dependencies: []
---

# Missing brute-force protection on admin login endpoint

## Problem Statement

The admin login API checks a shared secret without rate limiting, lockout, or delay controls. This enables online brute-force attempts.

## Findings

- `src/app/admin/api/login/route.ts:4-19` performs direct credential check and returns immediate success/fail.
- No request throttling, IP/account attempt tracking, or exponential backoff present.

## Proposed Solutions

### Option 1: Add per-IP rate limiting (recommended)

**Approach:** Apply rate limiter middleware or endpoint-level throttle (e.g., max attempts/minute).

**Pros:**
- Fast mitigation
- Minimal UX impact

**Cons:**
- Needs shared store in multi-instance deployments

**Effort:** Small

**Risk:** Low

---

### Option 2: Add delay/backoff on failures

**Approach:** Introduce incremental delay for failed attempts and temporary lockout.

**Pros:**
- Slows brute-force significantly

**Cons:**
- Can affect legitimate retries

**Effort:** Small

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `src/app/admin/api/login/route.ts`

## Resources

- Review evidence: `src/app/admin/api/login/route.ts:4-19`

## Acceptance Criteria

- [ ] Login endpoint enforces retry limits
- [ ] Excess attempts receive 429 or equivalent blocked response
- [ ] Failed-attempt telemetry/logging is available
- [ ] Manual abuse simulation confirms throttling

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**
- Reviewed login handler for abuse controls
- Confirmed absence of throttling/lockout mechanisms

**Learnings:**
- Shared-secret login endpoints need explicit anti-automation controls
