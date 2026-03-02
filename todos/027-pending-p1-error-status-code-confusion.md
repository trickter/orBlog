---
status: complete
priority: p1
issue_id: '027'
tags: [code-review, error-handling]
dependencies: []
---

# Error status code confusion in upload route

## Problem Statement

All non-"missing file" errors return 404, masking actual server errors. When there's a real server error (permission denied, disk full, etc.), users see a misleading 404, making debugging difficult.

```typescript
} catch (error) {
  if (!isMissingFileError(error)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  // ...
}
```

## Findings

- **Location:** `src/app/uploads/[...path]/route.ts:125-129`
- **Impact:** Real errors (permission denied, disk full) are hidden as 404
- **Severity:** Production debugging becomes difficult

## Proposed Solutions

### Option 1: Distinguish error types (recommended)

```typescript
} catch (error) {
  if (isMissingFileError(error)) {
    // Handle missing file case...
  }
  console.error('Upload route error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

**Pros:**
- Clear distinction between missing files vs. server errors
- Proper logging for debugging
- HTTP semantics are correct

**Cons:**
- More code

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts`

## Acceptance Criteria

- [ ] 404 only for actual missing files
- [ ] 500 for server errors (permission denied, disk full, etc.)
- [ ] Errors are logged for debugging

## Work Log

