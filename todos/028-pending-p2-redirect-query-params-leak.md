---
status: complete
priority: p2
issue_id: '028'
tags: [code-review, security]
dependencies: []
---

# Potential information disclosure via redirect URL query params

## Problem Statement

The redirect URL preserves the original request's query parameters. While the hostname is properly allowlisted, query params from the original request would be forwarded to the external static host, potentially leaking sensitive information.

```typescript
return `${staticBaseUrl.origin}${basePath}${source.pathname}${source.search}`;
```

## Findings

- **Location:** `src/app/uploads/[...path]/route.ts:60-74` (`buildStaticRedirectUrl`)
- **Risk:** Low-Medium - Query params could contain sensitive data logged by static host

## Proposed Solutions

### Option 1: Strip sensitive query params (recommended)

Only allow specific safe parameters (cache busters like `v=`, `t=`) and strip everything else.

```typescript
const url = new URL(requestUrl);
const safeParams = new URLSearchParams();
if (url.searchParams.has('v')) safeParams.set('v', url.searchParams.get('v')!);
if (url.searchParams.has('t')) safeParams.set('t', url.searchParams.get('t')!);
```

**Pros:**
- Prevents information leakage
- Still allows cache busters

**Cons:**
- May break legitimate query params

**Effort:** Small

**Risk:** Low

---

### Option 2: Strip all query params

```typescript
return `${staticBaseUrl.origin}${basePath}${source.pathname}`;
```

**Pros:**
- Simplest solution
- No information leakage

**Cons:**
- Breaks cache busters

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts`

## Acceptance Criteria

- [ ] No sensitive query params leaked to external static host
- [ ] Cache busters still work if needed

## Work Log

