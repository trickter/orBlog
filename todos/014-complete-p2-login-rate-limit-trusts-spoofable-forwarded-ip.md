---
status: complete
priority: p2
issue_id: '014'
tags: [code-review, security, auth]
dependencies: []
---

# Login Rate Limit Trusts Spoofable Forwarded IP

## Problem Statement

Admin login throttling can be bypassed because the rate-limit key is derived directly from `x-forwarded-for` without trusted proxy validation.

## Findings

- `POST /admin/api/login` takes `x-forwarded-for` from request headers and uses the first token as limiter key (`src/app/admin/api/login/route.ts:8-13`).
- In self-hosted setups, clients can inject/spoof this header and rotate fake IPs to avoid lockout.
- This weakens brute-force protection on the admin secret endpoint.

## Proposed Solutions

### Option 1: Use platform/trusted source IP only

**Approach:** Prefer runtime-provided trusted IP (`request.ip` where available) and ignore raw forwarded header unless behind a known reverse proxy.

**Pros:**

- Strongest mitigation against spoofing
- Keeps key derivation simple

**Cons:**

- Depends on deployment/runtime behavior

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Trust forwarded chain only from known proxy

**Approach:** Add explicit allowlist for proxy hops and parse `x-forwarded-for` only when request comes from trusted upstream.

**Pros:**

- Works with multi-hop proxies/CDN
- Preserves per-client rate limiting behind proxy

**Cons:**

- Requires infra config discipline

**Effort:** 2-4 hours

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected files:**

- `src/app/admin/api/login/route.ts:8-13`

## Resources

- Related pending items: `003-pending-p2-missing-login-rate-limit.md`

## Acceptance Criteria

- [ ] Rate-limit key is no longer derived from untrusted spoofable headers
- [ ] Login endpoint still enforces 429 after configured threshold
- [ ] Deployment notes document trusted proxy behavior

## Work Log

### 2026-03-01 - Review Finding Created

**By:** Codex

**Actions:**

- Reviewed admin login path and rate-limit key derivation
- Identified header spoofing bypass risk

**Learnings:**

- Existing rate limit exists but trust boundary is not enforced

## Notes

- Keep behavior compatible with local development and reverse-proxy production setup.

### 2026-03-01 - Implementation Completed

**By:** Codex

**Actions:**

- Implemented code changes for this finding
- Ran `npm run lint` and `npm run build`

**Learnings:**

- Fix verified by static checks/build.
