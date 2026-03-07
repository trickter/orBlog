---
title: ZIP import images 404 after upload and publish
module: System
problem_type: integration_issue
component: frontend_stimulus
symptoms:
  - "Markdown preview shows missing images after ZIP upload"
  - "Published posts contain image links that return 404"
  - "Image references vary by path style (./images, images/, basename, URL-encoded names)"
root_cause: logic_error
resolution_type: code_fix
tags:
  - nextjs
  - markdown
  - zip-upload
  - image-path
  - uploads
  - reliability
severity: high
status: resolved
date: 2026-03-01
resolved_in:
  - f613d78
  - 4671cee
---

# ZIP import images 404 after upload and publish

## Problem

After uploading a ZIP (markdown + images), image rendering failed in two places:

1. Preview modal sometimes showed broken images.
2. Published article pages had image URLs that returned `404`.

This was non-deterministic across different markdown path styles and image filenames.

## Observable Symptoms

- Markdown references like `./images/a.png`, `images/a.png`, `a.png`, and encoded filenames behaved inconsistently.
- Some uploads wrote image files, but markdown content still pointed to unresolved paths.
- Failures during ZIP processing could be swallowed, allowing post creation with broken image links.

## Investigation Summary

### What was checked

1. ZIP extraction and image key generation in [`src/lib/zip-import.ts`](/app/ai-code/brainstorm/src/lib/zip-import.ts)
2. Preview rewriting logic in [`src/components/NewPostForm.tsx`](/app/ai-code/brainstorm/src/components/NewPostForm.tsx)
3. Persist-time rewriting logic in [`src/lib/actions-posts.ts`](/app/ai-code/brainstorm/src/lib/actions-posts.ts)
4. Upload file serving route in [`src/app/uploads/[...path]/route.ts`](/app/ai-code/brainstorm/src/app/uploads/[...path]/route.ts)

### Root cause

The preview and persistence paths used separate, partially overlapping rewrite behavior. Path normalization and matching were fragile for:

- relative prefixes (`./`)
- directory aliases (`images/`, `image/`, `img/`, `assets/`)
- URL encoding
- basename-only references
- markdown image target variants

Additionally, ZIP-processing exceptions were previously catch-and-continue in create flow, resulting in silent data quality failure.

## Working Solution

### 1) Unified markdown image rewrite primitive

Added [`src/lib/markdown-image-links.ts`](/app/ai-code/brainstorm/src/lib/markdown-image-links.ts) with:

- `imageLookupKeys()` for normalized lookup keys
- `rewriteMarkdownImageLinks()` for centralized markdown image target rewriting

This removed duplicated and diverging matching logic.

### 2) Reused the same rewrite primitive in both pipelines

- Preview path updated in [`src/components/NewPostForm.tsx`](/app/ai-code/brainstorm/src/components/NewPostForm.tsx)
- Persist path updated in [`src/lib/actions-posts.ts`](/app/ai-code/brainstorm/src/lib/actions-posts.ts)

Result: preview behavior and saved-content behavior now align.

### 3) Fail-fast on ZIP processing errors

`createPost` path now throws a user-facing error when ZIP processing fails, instead of silently continuing with broken markdown references.

### 4) Confirmed upload serving path

Dynamic upload file route in [`src/app/uploads/[...path]/route.ts`](/app/ai-code/brainstorm/src/app/uploads/[...path]/route.ts) ensures uploaded files under `public/uploads` are served with proper MIME types and not-found handling.

## Verification

### Runtime checks

- Local URL check for uploaded image path returned `HTTP 200`.
- Manual validation on ZIP upload -> preview -> publish flow succeeded.

### Automated checks

- `npm run lint` (passes; one existing non-blocking `Sidebar` warning)
- `npm run build` (passes)
- `npm test -- --runInBand` (passes)

Relevant tests include:

- [`src/lib/__tests__/markdown-image-links.test.ts`](/app/ai-code/brainstorm/src/lib/__tests__/markdown-image-links.test.ts)
- [`src/lib/__tests__/actions-posts.test.ts`](/app/ai-code/brainstorm/src/lib/__tests__/actions-posts.test.ts)

## Prevention Guidance

1. Keep markdown URL rewrite logic in one shared module only.
2. Treat content transformation failures as hard errors when publish correctness depends on them.
3. Add regression tests for path variants:
   - `./images/x.png`
   - `images/x.png`
   - `x.png`
   - URL-encoded names
4. Validate both preview and persisted output with the same fixture set.

## Related Work

- Todo: [`016-complete-p2-create-post-swallows-zip-processing-failures.md`](/app/ai-code/brainstorm/todos/016-complete-p2-create-post-swallows-zip-processing-failures.md)
- Commit: `f613d78` (ZIP import stabilization)
- Commit: `4671cee` (hardening + tests)

## Notes

`docs/solutions/` had no prior entries at the time of writing, so no internal cross-reference existed yet.
