---
title: Add zip file import for blog post creation
type: feat
status: completed
date: 2026-03-01
---

# Add Zip File Import for Blog Post Creation

## Overview

Allow importing blog posts from zip files containing a markdown file and images directory. When creating a new post in admin, users can upload a zip file instead of manually entering content.

## Problem Statement

Currently, blog posts must be created by manually entering markdown content in the admin panel. Users who write posts in local markdown editors (like Obsidian, VS Code) want to import their posts along with locally referenced images without manually uploading images and updating image paths.

## Proposed Solution

Add a zip import option to the new post page that:

1. Accepts zip file upload containing `*.md` and optional `images/` directory
2. Extracts markdown content
3. Copies images to `/public/uploads/posts/{post-slug}/`
4. Rewrites image paths in markdown to point to new locations
5. Pre-fills the post form with extracted title and content

## Technical Approach

### Dependencies

Add `jszip` package for client-side zip handling:

```bash
npm install jszip
```

### Architecture

```
Admin New Post Page
├── File Upload Zone (drag & drop or click)
│   └── On zip select: Client-side extraction
│       ├── Read zip entries
│       ├── Find .md file
│       ├── Extract images to temp
│       ├── Parse markdown for title (first H1)
│       └── Return: { title, content, images[] }
└── Standard Form (pre-filled from zip if uploaded)
```

### Data Flow

1. User selects zip file in admin new post page
2. Client uses JSZip to extract content
3. Extract title from first `# Heading` in markdown
4. Copy images to `/public/uploads/posts/{slug}/`
5. Rewrite image paths: `images/foo.png` → `/uploads/posts/{slug}/foo.png`
6. Submit form with extracted data + uploaded images info

## Files to Modify

| File                                     | Change                                  |
| ---------------------------------------- | --------------------------------------- |
| `package.json`                           | Add jszip dependency                    |
| `src/app/admin/(protected)/new/page.tsx` | Add zip upload component                |
| `src/lib/actions.ts`                     | Add handleZipImport server action       |
| `src/lib/zip-import.ts`                  | New: Client-side zip extraction utility |

## Implementation Details

### 1. Client-Side Zip Extraction (`src/lib/zip-import.ts`)

```typescript
import JSZip from 'jszip';

interface ZipImportResult {
  title: string;
  content: string;
  images: { name: string; data: Blob }[];
}

export async function extractZipFile(file: File): Promise<ZipImportResult> {
  const zip = await JSZip.loadAsync(file);

  // Find .md file
  const mdFile = Object.keys(zip.files).find((f) => f.endsWith('.md'));
  if (!mdFile) throw new Error('No markdown file found in zip');

  // Extract content
  const content = await zip.file(mdFile)!.async('string');

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : 'Untitled';

  // Find images directory
  const images: { name: string; data: Blob }[] = [];
  const imagesDir = Object.keys(zip.files).filter((f) =>
    f.startsWith('images/')
  );

  for (const imgPath of imagesDir) {
    const file = zip.file(imgPath);
    if (file) {
      const data = await file.async('blob');
      const name = imgPath.replace('images/', '');
      images.push({ name, data });
    }
  }

  return { title, content, images };
}
```

### 2. Server Action for Handling Images (`src/lib/actions.ts`)

```typescript
'use server';

export async function handleZipImport(
  images: { name: string; data: string }[],
  slug: string
): Promise<string[]> {
  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'posts',
    slug
  );
  const savedPaths: string[] = [];

  for (const img of images) {
    const buffer = Buffer.from(img.data, 'base64');
    const ext = path.extname(img.name);
    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(filepath, buffer);

    savedPaths.push(`/uploads/posts/${slug}/${filename}`);
  }

  return savedPaths;
}
```

### 3. Image Path Rewriting

When content is submitted, rewrite image paths:

```typescript
function rewriteImagePaths(content: string, imagePaths: string[]): string {
  let result = content;
  // Original: ![alt](images/filename.png)
  // Rewrite to: ![alt](/uploads/posts/slug/filename.png)
  // Need to track original filename -> new path mapping
  return result;
}
```

### 4. Admin Page Integration (`src/app/admin/(protected)/new/page.tsx`)

- Add dropzone for zip files
- Show extracted preview before submission
- Allow editing pre-filled content
- Display uploaded images count

## Security Considerations

- **File type validation**: Only accept `.zip` files
- **Filename sanitization**: Use UUID for saved files, strip directory traversal
- **File size limits**: Limit zip to 10MB
- **Content sanitization**: Still use DOMPurify on markdown content
- **Path traversal**: Validate all paths in zip don't escape extraction directory

## Edge Cases

1. **No markdown file in zip**: Show error message
2. **Multiple markdown files**: Use first one, warn user
3. **No images directory**: OK, proceed without images
4. **Large images**: Compress or warn (future enhancement)
5. **Special characters in filenames**: Sanitize to UUID
6. **Empty zip**: Show error

## Acceptance Criteria

- [x] User can upload a zip file on new post page
- [x] Zip containing single .md file extracts title and content
- [x] Images from images/ folder are copied to public/uploads/posts/{slug}/
- [x] Image paths in markdown are rewritten to new locations
- [x] Form pre-fills with extracted title and content
- [x] Error messages shown for invalid zip files
- [x] Works alongside existing manual content entry

## Alternative Approaches Considered

| Approach               | Why Not                                        |
| ---------------------- | ---------------------------------------------- |
| Server-side extraction | More complex, requires temp file handling      |
| JSON import            | Less user-friendly for existing markdown users |
| Direct upload to S3    | Overkill for self-hosted blog                  |

## System-Wide Impact

- **Storage**: Images stored in `/public/uploads/posts/` - need to ensure directory exists
- **Cleanup**: No automatic cleanup for orphaned images (future enhancement)
- **Migration**: Existing posts unaffected

## Testing Plan

1. Upload valid zip with markdown + images
2. Upload zip without markdown (should error)
3. Upload non-zip file (should error)
4. Verify image paths rewritten correctly in preview
5. Submit and verify post renders correctly with images
6. Verify slug generation handles special characters
