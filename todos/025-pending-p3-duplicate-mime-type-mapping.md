---
status: pending
priority: p3
issue_id: '025'
tags: [code-review, duplication, dry]
dependencies: []
---

# Duplicated MIME type mapping

## Problem Statement

The same extension-to-MIME mapping exists in two places:
- `src/lib/actions-posts.ts:168-188` - `detectImageContentType()` switch
- `src/app/uploads/[...path]/route.ts` - `MIME_TYPES` object

## Findings

- `src/lib/actions-posts.ts:168-188` - 9-case switch statement
- `src/app/uploads/[...path]/route.ts:7-16` - MIME_TYPES object
- Same extensions: .png, .jpg, .jpeg, .gif, .webp, .svg, .bmp, .ico

## Proposed Solutions

### Option 1: Export from route.ts, import in actions-posts.ts

Export `MIME_TYPES` from route.ts and remove the switch in actions-posts.ts.

**Pros:**
- Single source of truth

**Cons:**
- Creates coupling between modules

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep duplication (minimalist)

Per project philosophy, small duplication is acceptable.

**Pros:**
- No new dependencies

**Cons:**
- Risk of divergence

**Effort:** N/A

**Risk:** Low

## Recommended Action



## Technical Details

**Affected files:**
- `src/lib/actions-posts.ts:168-188`
- `src/app/uploads/[...path]/route.ts:7-16`

## Resources

## Acceptance Criteria

## Work Log

