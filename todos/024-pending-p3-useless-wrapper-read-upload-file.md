---
status: pending
priority: p3
issue_id: '024'
tags: [code-review, simplification]
dependencies: []
---

# Useless wrapper: readUploadFile

## Problem Statement

The `readUploadFile` function in `src/app/uploads/[...path]/route.ts:44-46` is a trivial wrapper that adds no value:

```typescript
export async function readUploadFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}
```

## Findings

- `src/app/uploads/[...path]/route.ts:44-46` - wrapper function
- Only called once in the file
- No additional behavior beyond fs.readFile

## Proposed Solutions

### Option 1: Remove wrapper (recommended)

Call `fs.readFile` directly in `handleUploadsGet`.

**Pros:**
- Reduces code
- Eliminates indirection

**Cons:**
- Slightly less testable (but the injectability is still available via the `readFile` parameter)

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep for testability

The `readFile` parameter in `handleUploadsGet` provides testability. The wrapper makes the dependency explicit.

**Pros:**
- Clear dependency injection

**Cons:**
- Unnecessary for single use

**Effort:** N/A

**Risk:** N/A

## Recommended Action



## Technical Details

**Affected files:**
- `src/app/uploads/[...path]/route.ts:44-46`

## Resources

## Acceptance Criteria

- [ ] Code compiles and works

## Work Log

