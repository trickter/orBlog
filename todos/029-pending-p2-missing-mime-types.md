---
status: complete
priority: p2
issue_id: '029'
tags: [code-review, mime-types]
dependencies: []
---

# Missing MIME types coverage

## Problem Statement

Only 8 image types are supported in `mime-types.ts`. Files like `.pdf`, `.webm`, `.mp4`, `.mp3`, `.json`, `.css`, `.js`, `.html` will default to `application/octet-stream`.

Incorrect Content-Type affects browser behavior (e.g., PDFs won't open inline).

## Findings

- **Location:** `src/lib/mime-types.ts`
- **Impact:** Incorrect content-type for common file types

## Proposed Solutions

### Option 1: Expand mapping (recommended)

Add common web types:

```typescript
const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  // ... existing images
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
};
```

**Pros:**
- Proper content types for common files

**Cons:**
- More entries to maintain

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/lib/mime-types.ts`

## Acceptance Criteria

- [ ] Common file types have correct MIME types

## Work Log

