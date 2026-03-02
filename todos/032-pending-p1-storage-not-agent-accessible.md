---
status: complete
priority: p1
issue_id: '032'
tags: [code-review, agent-native]
dependencies: []
---

# Storage abstraction not agent-accessible

## Problem Statement

The new `ObjectStorage` interface and `StorageFactory` provide cloud storage capabilities (Volc OBS, Tencent COS) but there are no corresponding agent tools to interact with them.

Agents cannot upload, read, or manage files in cloud storage.

## Findings

- **Location:** `src/lib/storage/ObjectStorage.ts`, `src/lib/storage/StorageFactory.ts`
- **Impact:** Agents cannot use new storage functionality

## Proposed Solutions

### Option 1: Add agent tools for storage (recommended)

Create agent-accessible tools for storage operations:

```typescript
tool('upload_file', async ({ key, data, contentType }) => { ... });
tool('read_file', async ({ key }) => { ... });
tool('delete_file', async ({ key }) => { ... });
```

**Pros:**
- Agents can use storage
- Consistent with existing agent tools pattern

**Effort:** Medium

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/lib/storage/ObjectStorage.ts`
- `src/lib/storage/StorageFactory.ts`

## Acceptance Criteria

- [ ] Storage operations accessible to agents

## Work Log

