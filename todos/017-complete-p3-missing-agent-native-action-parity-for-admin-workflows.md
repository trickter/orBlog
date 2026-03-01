---
status: complete
priority: p3
issue_id: '017'
tags: [code-review, architecture, agent-native]
dependencies: []
---

# Missing Agent-Native Action Parity For Admin Workflows

## Problem Statement

Core admin UI actions have no corresponding agent tools or runtime capability context, so the system is not agent-native.

## Findings

- UI exposes create/edit/delete actions for posts/categories/profile (`src/app/admin/(protected)/*`, `src/components/NewPostForm.tsx`, `src/components/DeleteCategoryButton.tsx`).
- No dedicated agent tool layer or capability prompt mapping exists in repository scan.
- No dynamic context injection path describing available resources/capabilities for an agent interface.

## Proposed Solutions

### Option 1: Add minimal tool facade over existing server actions

**Approach:** Expose primitive tools (`create_post`, `update_post`, `delete_post`, etc.) that reuse server action internals.

**Pros:**

- Fastest parity path
- Reuses tested business logic

**Cons:**

- Requires auth scoping and audit controls

**Effort:** 3-5 hours

**Risk:** Medium

---

### Option 2: Introduce explicit agent capability service

**Approach:** Build a dedicated agent-capability layer with typed primitives and runtime context builder.

**Pros:**

- Better long-term architecture
- Clear observability and policy hooks

**Cons:**

- Larger initial investment

**Effort:** 1-2 days

**Risk:** Medium

## Recommended Action

## Technical Details

**Affected components:**

- Admin UI actions: `src/app/admin/(protected)/*`
- Server actions: `src/lib/actions-*.ts`
- Prompt/context layer: missing

## Acceptance Criteria

- [ ] Capability map documents UI action ↔ agent tool parity
- [ ] High-value admin actions have agent-callable equivalents
- [ ] Agent context includes available resources and capability descriptions

## Work Log

### 2026-03-01 - Review Finding Created

**By:** Codex

**Actions:**

- Mapped admin UI actions and searched for agent-tool interfaces
- Identified parity gap between user UI and agent capabilities

**Learnings:**

- Current app works as traditional web app; parity requires explicit architecture additions.

## Notes

- This is architectural enhancement, not a merge blocker for current web-only scope.

### 2026-03-01 - Implementation Completed

**By:** Codex

**Actions:**

- Implemented code changes for this finding
- Ran `npm run lint` and `npm run build`

**Learnings:**

- Fix verified by static checks/build.
