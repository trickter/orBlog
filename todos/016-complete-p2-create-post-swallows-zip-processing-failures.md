---
status: complete
priority: p2
issue_id: '016'
tags: [code-review, reliability, quality]
dependencies: []
---

# Create Post Swallows ZIP Processing Failures

## Problem Statement

`createPost` catches ZIP image processing errors and continues to create the post, which can persist broken markdown image paths silently.

## Findings

- ZIP parse/write failures are caught and only logged (`src/lib/actions-posts.ts:148-156`).
- Flow continues and creates post with unprocessed content (`src/lib/actions-posts.ts:159-167`).
- User sees successful submission but published content can contain broken image URLs.

## Proposed Solutions

### Option 1: Fail fast with user-visible error

**Approach:** Re-throw image-processing errors and block post creation when ZIP import is requested.

**Pros:**

- Prevents silent data quality issues
- Clear user feedback

**Cons:**

- Upload failures block publish until fixed

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Make fallback explicit via feature flag

**Approach:** Keep fallback path but require explicit opt-in and attach warning metadata to draft only.

**Pros:**

- Preserves current UX flexibility
- Safer rollout

**Cons:**

- More complexity
- Still allows partial success paths

**Effort:** 2-4 hours

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected files:**

- `src/lib/actions-posts.ts:148-167`
- `src/components/NewPostForm.tsx` (error presentation)

## Acceptance Criteria

- [ ] ZIP processing failure does not silently publish broken content
- [ ] UI receives actionable error message
- [ ] Regression test covers failed ZIP parsing/write path

## Work Log

### 2026-03-01 - Review Finding Created

**By:** Codex

**Actions:**

- Traced `createPost` control flow around ZIP image processing
- Confirmed catch-and-continue behavior

**Learnings:**

- Reliability risk is user-facing because content quality degrades silently.

## Notes

- Consider auto-drafting on failure instead of outright rejecting publish.

### 2026-03-01 - Implementation Completed

**By:** Codex

**Actions:**

- Implemented code changes for this finding
- Ran `npm run lint` and `npm run build`

**Learnings:**

- Fix verified by static checks/build.
