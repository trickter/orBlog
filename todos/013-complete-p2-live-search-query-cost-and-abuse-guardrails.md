---
status: complete
priority: p2
issue_id: "013"
tags: [code-review, performance, security, prisma, sqlite]
dependencies: []
---

# Add guardrails for high-frequency live-search queries

## Problem Statement

The new live-search endpoint increases query frequency significantly, but server-side query guardrails are minimal. This can become an operational hotspot and an abuse vector as data volume or traffic grows.

## Findings

- `src/components/SearchBox.tsx:23-41` triggers repeated calls every ~250ms during typing.
- `src/lib/actions.ts:141-147` performs `contains` search on `title` and `content` for each call.
- `prisma/schema.prisma:13-26` has no search-oriented index strategy; combined with SQLite, this can cause frequent table scans.
- Current server action only enforces minimum query length (`>=2`), but no upper bound, normalization, or request throttling.

## Proposed Solutions

### Option 1: Tighten server-side limits (recommended)

**Approach:** Add query length cap and simple normalization; optionally skip `content` field for dropdown and search only title.

**Pros:**
- Very small change
- Immediate reduction in query cost
- Lower abuse surface

**Cons:**
- May reduce recall for some queries

**Effort:** 1-2 hours

**Risk:** Low

---

### Option 2: Dedicated lightweight search endpoint + throttling

**Approach:** Route handler with per-IP/session rate limits and optimized payload for suggestions.

**Pros:**
- Better abuse control and monitoring
- Cleaner separation between full search and typeahead

**Cons:**
- More implementation complexity
- Requires additional infra decisions for rate limiting

**Effort:** 4-8 hours

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `src/components/SearchBox.tsx:23-41`
- `src/lib/actions.ts:135-158`
- `prisma/schema.prisma:13-26`

**Related components:**
- `src/app/search/page.tsx` (full search behavior)

**Database changes (if any):**
- Migration needed? Potentially, if adding indexes/FTS in later iteration

## Resources

- **Commit under review:** `d654ec1`
- **Review target branch:** `fix/top-nav-search-dropdown`

## Acceptance Criteria

- [ ] Live-search endpoint applies server-side input guardrails (length/normalization)
- [ ] Query path for typeahead is measurably lighter than full search
- [ ] Basic abuse mitigation strategy documented (rate limit or explicit no-op rationale)
- [ ] Lint/build checks remain passing

## Work Log

### 2026-03-01 - Code Review Finding Created

**By:** Codex

**Actions:**
- Assessed request frequency from client debounce behavior.
- Reviewed Prisma query scope and schema indexing context.
- Documented mitigation options balancing speed vs robustness.

**Learnings:**
- Live-search introduces a different load profile from classic submit-based search and needs explicit backend guardrails.

## Notes

- This is currently non-blocking for tiny datasets, but risk grows quickly with traffic and content size.

### 2026-03-01 - Resolution

**By:** Codex

**Actions:**
- Implemented fix in code and validated via `npm run lint` + `npm run build`.

**Learnings:**
- Issue resolved in current branch.
