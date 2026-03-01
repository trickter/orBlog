---
title: Add post preview and fix zip import bugs
type: fix
status: completed
date: 2026-03-01
---

# Add Post Preview and Fix Zip Import Bugs

## Problem Statement

1. **Preview feature missing**: When creating a new post, users cannot preview the post before publishing
2. **Zip import bugs**:
   - Image paths with backslashes not handled: `![分类](images\分类.png)`
   - Error: `cookies was called outside a request scope` when clicking publish

## Current Issues

### Bug 1: Cookies Error

```
`cookies` was called outside a request scope
```

This happens in `NewPostForm.tsx` when trying to get the session on form submit.

### Bug 2: Backslash Image Paths

When uploading zip with images, markdown contains paths like:

```
![分类](images\分类.png)
```

These backslashes are not being handled in the path rewriting logic.

## Solution

### Fix 1: Cookies Error

Instead of calling cookies in the client component, pass the session from the server or use a different approach:

- Option A: Use a server action that accepts session as parameter (already done, but needs fix)
- Option B: Pass session through a hidden field from the server-rendered form

### Fix 2: Backslash Handling

Update `processZipImages` in `actions.ts` to handle both forward and backslash paths:

```typescript
// Also handle backslashes
const patterns = [
  new RegExp(
    `!\\[([^\\]]*)\\]\\(${originalName.replace(/\\/g, '\\\\')}\\)`,
    'g'
  ),
  new RegExp(`!\\[([^\\]]*)\\]\\(${originalName.replace(/\\/g, '/')}\\)`, 'g'),
  // ... existing patterns
];
```

### Feature: Preview Button

Add a preview button that opens a modal or navigates to a preview page showing the rendered markdown.

## Files to Modify

| File                                         | Change                                          |
| -------------------------------------------- | ----------------------------------------------- |
| `src/components/NewPostForm.tsx`             | Fix cookies call, add preview button            |
| `src/lib/actions.ts`                         | Fix backslash path handling in processZipImages |
| `src/app/admin/(protected)/new/page.tsx`     | Pass session via hidden field                   |
| `src/app/admin/(protected)/preview/page.tsx` | New: Preview page component                     |

## Implementation

### 1. Fix Cookies Issue

Instead of dynamic import, pass session from server page:

```typescript
// src/app/admin/(protected)/new/page.tsx
export default async function NewPostPage() {
  const categories = await getCategories();
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value ?? null;

  return <NewPostForm categories={categories} session={session} />;
}

// src/components/NewPostForm.tsx
interface NewPostFormProps {
  categories: Category[];
  session: string | null;
}

// Use session directly instead of calling cookies()
await createPost(formData as unknown as FormData, session);
```

### 2. Fix Backslash Handling

Update regex patterns in `processZipImages`:

```typescript
// Match both forward and backslash
const patterns = [
  new RegExp(`!\\[([^\\]]*)\\]\\(${escapedName}(\\\\\\\\?/|$))`, 'g'),
  // Or more simply: normalize paths first
];

// Better: normalize the content paths before matching
function normalizeImagePaths(content: string): string {
  return content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, path) => {
    const normalized = path.replace(/\\/g, '/');
    return `![${alt}](${normalized})`;
  });
}
```

### 3. Add Preview Button

Add a preview button that shows rendered markdown in a modal:

```typescript
// In NewPostForm.tsx
const [showPreview, setShowPreview] = useState(false);

// Button
<button
  type="button"
  onClick={() => setShowPreview(true)}
  className="px-4 py-2 border border-zinc-300..."
>
  Preview
</button>

// Preview Modal
{showPreview && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="prose prose-slate dark:prose-invert">
        <MarkdownRenderer content={content} />
      </div>
      <button onClick={() => setShowPreview(false)}>Close</button>
    </div>
  </div>
)}
```

## Acceptance Criteria

- [x] Preview button appears next to Publish button
- [x] Clicking Preview shows rendered markdown in a modal
- [x] Zip with `images\分类.png` paths work correctly after fix
- [x] No more "cookies called outside request scope" error on publish
- [x] Both forward slash and backslash image paths are handled
