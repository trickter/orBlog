---
status: pending
priority: p2
issue_id: '023'
tags: [code-review, performance, caching]
dependencies: []
---

# Missing cache headers on static redirect

## Problem Statement

The static fallback redirect in `src/app/uploads/[...path]/route.ts:103-108` returns a 307 response without cache headers. Every subsequent request to a missing local file will trigger another redirect, wasting resources.

## Findings

- `src/app/uploads/[...path]/route.ts:103-108` - redirect response
- No `Cache-Control` headers on 307 response

## Proposed Solutions

### Option 1: Add cache headers (recommended)

```typescript
return NextResponse.redirect(redirectTarget, {
  status: 307,
  headers: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
  },
});
```

**Pros:**
- Reduces repeated redirects
- Browser/CDN can cache the redirect

**Cons:**
- Slight complexity

**Effort:** Small

**Risk:** Low

---

### Option 2: Use 308 permanent redirect

```typescript
return NextResponse.redirect(redirectTarget, {
  status: 308,
});
```

**Pros:**
- Permanent redirect - browsers cache indefinitely
- Simpler

**Cons:**
- If static CDN changes, hard to update

**Effort:** Small

**Risk:** Medium

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts:103-108`

## Resources

- MDN Cache-Control: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control

## Acceptance Criteria

- [ ] Redirect responses include Cache-Control headers

## Work Log

