---
status: pending
priority: p2
issue_id: '021'
tags: [code-review, logic-bug, error-handling]
dependencies: []
---

# isMissingFileError returns true for undefined code

## Problem Statement

The `isMissingFileError` function in `src/app/uploads/[...path]/route.ts:48-58` has flawed logic that returns `true` when `code` is `undefined`, meaning ANY error without a `code` property will be incorrectly treated as a "file not found" error.

```typescript
const code = (error as { code?: unknown }).code;
if (code === undefined) {
  return true;  // BUG: treats ANY error without 'code' as "missing file"
}
```

This masks real failures and incorrectly triggers redirects.

## Findings

- `src/app/uploads/[...path]/route.ts:48-58` - isMissingFileError function
- If any error occurs without a `code` property, it's treated as "file missing"
- This could mask real I/O errors, permission issues, etc.

## Proposed Solutions

### Option 1: Return false for unknown codes (recommended)

```typescript
function isMissingFileError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code !== 'string') {
    return false;  // Don't guess - only treat known codes as missing
  }
  return code === 'ENOENT' || code === 'ENOTDIR';
}
```

**Pros:**
- Correct behavior - only known "not found" codes trigger redirect
- Masks fewer real errors

**Cons:**
- None

**Effort:** Small

**Risk:** Low

---

### Option 2: Re-throw unknown errors

```typescript
function isMissingFileError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (code === undefined) {
    throw new Error('Unknown error type in file read');  // Fail fast
  }
  return code === 'ENOENT' || code === 'ENOTDIR';
}
```

**Pros:**
- Forces investigation of unknown errors

**Cons:**
- Could break existing behavior

**Effort:** Small

**Risk:** Medium

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts:48-58`

## Resources

## Acceptance Criteria

- [ ] Only ENOENT/ENOTDIR errors trigger redirect
- [ ] Other errors return false (not treated as missing files)

## Work Log

