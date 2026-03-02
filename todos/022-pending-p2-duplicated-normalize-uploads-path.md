---
status: pending
priority: p2
issue_id: '022'
tags: [code-review, duplication, dry]
dependencies: []
---

# Duplicated normalizeUploadsPath function

## Problem Statement

The `normalizeUploadsPath` function is duplicated in two files:
- `src/components/MarkdownRenderer.tsx:6-17`
- `src/components/Sidebar.tsx:3-14`

This is a DRY violation - if the path normalization logic needs to change, it must be updated in two places.

## Findings

- `src/components/MarkdownRenderer.tsx:6-17` - normalizeUploadsPath
- `src/components/Sidebar.tsx:3-14` - identical function
- Both handle: external URLs, protocol-relative URLs, ./uploads, /uploads, public/uploads paths

## Proposed Solutions

### Option 1: Extract to shared utility (recommended)

Create `src/lib/normalize-uploads-path.ts`:
```typescript
export function normalizeUploadsPath(url: string): string {
  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(url) || url.startsWith('//')) {
    return url;
  }

  const match = url.match(/^(?:\.\/)*\/?(?:public\/)?uploads\/(.+)$/i);
  if (!match) {
    return url;
  }

  return `/uploads/${match[1]}`;
}
```

Then import in both components.

**Pros:**
- Single source of truth
- Easier maintenance

**Cons:**
- Creates new file
- Slight indirection

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep duplication (minimalist approach)

Per project philosophy "Duplication > Complexity", keep as-is if components are independent.

**Pros:**
- No new files
- Simple

**Cons:**
- Risk of divergence

**Effort:** N/A

**Risk:** Medium (divergence risk)

## Recommended Action



## Technical Details

**Affected files:**
- `src/components/MarkdownRenderer.tsx`
- `src/components/Sidebar.tsx`

## Resources

## Acceptance Criteria

- [ ] normalizeUploadsPath exists in only one location
- [ ] Both components import from shared utility

## Work Log

