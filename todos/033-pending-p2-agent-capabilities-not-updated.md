---
status: complete
priority: p2
issue_id: '033'
tags: [code-review, agent-native]
dependencies: []
---

# Agent capabilities not updated for new features

## Problem Statement

The system prompt context (`formatAgentCapabilitiesContext`) does not include any information about the new storage or upload capabilities. Agents don't know what storage operations are possible.

## Findings

- **Location:** `src/lib/agent-capabilities.ts`
- **Impact:** Agents unaware of new capabilities

## Proposed Solutions

### Option 1: Add storage capabilities to agent list (recommended)

```typescript
{
  tool: 'upload_file',
  action: 'Upload a file to cloud storage',
  resource: 'storage',
  requiresAdmin: true,
},
```

**Pros:**
- Agents aware of new capabilities

**Effort:** Small

**Risk:** Low

---

## Recommended Action



## Technical Details

**Affected files:**
- `src/lib/agent-capabilities.ts`

## Acceptance Criteria

- [ ] Agent capabilities include new storage functionality

## Work Log

