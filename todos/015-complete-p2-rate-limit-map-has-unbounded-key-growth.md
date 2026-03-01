---
status: complete
priority: p2
issue_id: '015'
tags: [code-review, security, reliability, performance]
dependencies: []
---

# Rate Limit Map Has Unbounded Key Growth

## Problem Statement

The in-memory login limiter stores keys forever unless the exact key is reused, allowing unbounded map growth under high-cardinality key churn.

## Findings

- Limiter store is a process-global `Map` with no periodic cleanup (`src/lib/rate-limit.ts:13`).
- Expired entries are only overwritten when the same key reappears (`src/lib/rate-limit.ts:19-24`).
- Attackers can generate many unique keys (especially with spoofable forwarded IP), causing memory growth.

## Proposed Solutions

### Option 1: Opportunistic pruning inside `checkRateLimit`

**Approach:** Periodically remove expired entries (e.g., every N calls).

**Pros:**

- Small code change
- No new infra dependency

**Cons:**

- Still process-local limiter

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Move limiter to Redis with TTL keys

**Approach:** Replace map with Redis `INCR` + expiry.

**Pros:**

- Bounded memory and multi-instance consistency
- Better production behavior

**Cons:**

- Requires Redis infra

**Effort:** 3-6 hours

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected files:**

- `src/lib/rate-limit.ts:13-34`
- `src/app/admin/api/login/route.ts:12`

## Acceptance Criteria

- [ ] Expired limiter entries are cleaned proactively
- [ ] Map/store growth is bounded under high-cardinality keys
- [ ] Login throttling behavior remains unchanged for normal users

## Work Log

### 2026-03-01 - Review Finding Created

**By:** Codex

**Actions:**

- Audited in-memory limiter lifecycle
- Confirmed no scheduled or opportunistic pruning

**Learnings:**

- Current implementation is acceptable for low volume but risky under abuse traffic.

## Notes

- This issue compounds with spoofable IP keys from issue `014`.

### 2026-03-01 - Implementation Completed

**By:** Codex

**Actions:**

- Implemented code changes for this finding
- Ran `npm run lint` and `npm run build`

**Learnings:**

- Fix verified by static checks/build.
