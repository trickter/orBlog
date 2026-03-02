---
status: pending
priority: p1
issue_id: '020'
tags: [code-review, security, path-traversal]
dependencies: []
---

# Potential path traversal bypass in sanitizePath

## Problem Statement

The `sanitizePath` function in `src/app/uploads/[...path]/route.ts:18-24` filters dangerous path segments after Next.js may have decoded URL-encoded input. If URL-encoded segments pass through without decoding, an attacker could bypass the filter.

Request: `/uploads/%2e%2e/%2e%2e/etc/passwd`
If not decoded: segments = [`%2e%2e`, `%2e%2e`, `passwd`] - passes filter!

## Findings

- `src/app/uploads/[...path]/route.ts:18-24` - sanitizePath function
- Relies on Next.js to decode URL before reaching handler
- Also affects `normalizeUploadsPath` in MarkdownRenderer.tsx and Sidebar.tsx (though those only rewrite URLs, not access filesystem)

## Proposed Solutions

### Option 1: Explicit decode + sanitize (recommended)

```typescript
function sanitizePath(segments: string[]): string[] {
  return segments
    .map(s => decodeURIComponent(s))
    .filter((segment) => {
      return (
        segment && segment !== '.' && segment !== '..' &&
        !segment.includes('\\') && !segment.includes('/')
      );
    });
}
```

**Pros:**
- Defense in depth
- Explicit handling regardless of framework behavior

**Cons:**
- Slight performance overhead (decode + filter)

**Effort:** Small

**Risk:** Low

---

### Option 2: Use path.normalize + validate result

```typescript
function sanitizePath(segments: string[]): string[] {
  const decoded = segments.map(s => decodeURIComponent(s));
  const filtered = decoded.filter(s => s && s !== '.' && s !== '..' && !s.includes('\\'));

  // Validate the final path stays within uploads/
  const finalPath = path.join('public', 'uploads', ...filtered);
  if (!finalPath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
    return [];
  }

  return filtered;
}
```

**Pros:**
- Ultimate protection via path validation

**Cons:**
- More complex

**Effort:** Medium

**Risk:** Low

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts:18-24`
- `src/components/MarkdownRenderer.tsx:6-17`
- `src/components/Sidebar.tsx:3-14`

## Resources

- OWASP Path Traversal: https://owasp.org/www-community/attacks/Path_Traversal

## Acceptance Criteria

- [ ] URL-encoded path traversal attempts are blocked
- [ ] Tests confirm bypass is prevented

## Work Log

