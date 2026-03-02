---
status: complete
priority: p3
issue_id: '031'
tags: [code-review, performance]
dependencies: []
---

# Regex recompilation on every call

## Problem Statement

Regex patterns in `normalizeUploadsPath` are created and compiled on every function call. This is called from `Sidebar.tsx` and `MarkdownRenderer.tsx`, potentially on every render.

## Findings

- **Location:** `src/lib/normalize-uploads-path.ts:2`
- **Impact:** Expensive regex compilation per render

## Proposed Solutions

### Option 1: Pre-compile regexes at module level (recommended)

```typescript
const PROTOCOL_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const UPLOADS_PATH_REGEX = /^(?:\.\/)*\/?(?:public\/)?uploads\/(.+)$/i;

export function normalizeUploadsPath(url: string): string {
  if (PROTOCOL_REGEX.test(url) || url.startsWith('//')) {
    return url;
  }
  // ...
}
```

**Pros:**
- Regex compiled once at module load
- Significant CPU savings at scale

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/lib/normalize-uploads-path.ts`

## Acceptance Criteria

- [ ] Regexes pre-compiled at module level

## Work Log

