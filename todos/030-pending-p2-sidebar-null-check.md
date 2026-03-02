---
status: complete
priority: p2
issue_id: '030'
tags: [code-review, typescript]
dependencies: []
---

# Potential runtime error in Sidebar.tsx

## Problem Statement

No null check on `profile.name` before calling `.charAt(0)`. If `profile.name` is null/undefined, this throws a runtime error.

```typescript
const initial = profile.name.charAt(0).toUpperCase();
```

## Findings

- **Location:** `src/components/Sidebar.tsx:18`

## Proposed Solutions

### Option 1: Add optional chaining (recommended)

```typescript
const initial = profile.name?.charAt(0)?.toUpperCase() ?? '?';
```

**Pros:**
- Type-safe
- Graceful fallback

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/components/Sidebar.tsx`

## Acceptance Criteria

- [ ] No runtime error when profile.name is null/undefined

## Work Log

