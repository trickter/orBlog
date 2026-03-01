---
status: completed
priority: p2
issue_id: "004"
tags: [code-review, security, operations, database]
dependencies: []
---

# SQLite runtime database files are committed to git

## Problem Statement

Runtime database artifacts are tracked in repository history, which risks accidental data leakage and noisy diffs/merge conflicts.

## Findings

- Tracked files: `dev.db`, `prisma/dev.db`.
- These are mutable runtime artifacts and should generally be ignored in application repositories.

## Proposed Solutions

### Option 1: Remove DB files from git and ignore them (recommended)

**Approach:** Add ignore rules and remove tracked files while keeping migration files.

**Pros:**
- Prevents future data leakage
- Cleaner diffs and smaller repo churn

**Cons:**
- Requires migration/bootstrap docs for local setup

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep sanitized seed DB only

**Approach:** Keep one clearly named demo DB and prohibit runtime DB commits.

**Pros:**
- Easy demo bootstrap

**Cons:**
- Ongoing sanitization burden

**Effort:** Medium

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `dev.db`
- `prisma/dev.db`
- `.gitignore`

## Resources

- Review evidence: `git ls-files` output includes both DB files

## Acceptance Criteria

- [ ] Runtime DB files are no longer tracked
- [ ] `.gitignore` prevents re-adding DB runtime files
- [ ] README documents local DB initialization from migrations

## Work Log

### 2026-03-01 - Initial review finding

**By:** Codex

**Actions:**
- Audited tracked artifacts for runtime state files
- Found SQLite DB binaries in versioned files

**Learnings:**
- Migration SQL should be source of truth, not mutable DB binaries
