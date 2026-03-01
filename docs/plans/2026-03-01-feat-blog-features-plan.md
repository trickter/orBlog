---
title: Add blog features - theme toggle, search, categories, enhanced cards
type: feat
status: active
date: 2026-03-01
---

# Blog Feature Enhancement

## Overview

Add four features to the personal blog:

1. Dark/Light theme toggle
2. Blog search functionality
3. Blog categories
4. Enhanced homepage cards with category, view count, publish date

## Problem Statement / Motivation

The current blog is functional but lacks:

- Theme preference (users can't choose light/dark)
- Search (hard to find posts)
- Categories (no organization)
- Rich card metadata (no view counts)

## Proposed Solution

### 1. Dark/Light Theme Toggle

- Add theme toggle button in header
- Persist preference in localStorage
- Use Tailwind's `dark:` classes
- Support system preference as default

### 2. Blog Search

- Add search input in header
- Search by title and content
- Display results on dedicated `/search` page
- Use server-side search with Prisma `contains`

### 3. Blog Categories

- Add `categoryId` field to Post model
- Create Category model if needed (use existing Tag model)
- Add category selection in admin post editor
- Display category badge on post cards
- Add category filter pages `/category/[slug]`

### 4. Enhanced Homepage Cards

- Add `viewCount` field to Post model
- Display: category badge, view count, publish date
- Update card UI to show metadata row

## Technical Considerations

### Database Changes

```prisma
model Post {
  // existing fields...
  viewCount  Int       @default(0)
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
}

model Category {
  id       String @id @default(cuid())
  name     String @unique
  slug     String @unique
  posts    Post[]
}
```

### Architecture

- **Next.js App Router** - Continue using existing patterns
- **Theme**: localStorage + CSS variables + Tailwind dark mode
- **Search**: Server action + search page with URL query param
- **Categories**: Prisma relation + category pages

## System-Wide Impact

- **Database**: Add viewCount and categoryId to Post, create Category table
- **Routes**: New `/search`, `/category/[slug]` pages
- **Components**: ThemeToggle, SearchInput, CategoryBadge, PostCard (updated)
- **Admin**: Add category selection in post editor

## Acceptance Criteria

### Theme Toggle

- [ ] Toggle button in header (sun/moon icon)
- [ ] Persists to localStorage
- [ ] Respects system preference on first visit
- [ ] Smooth transition between themes

### Search

- [ ] Search input in header
- [ ] Results page at `/search?q=query`
- [ ] Searches title and content
- [ ] Shows matching posts

### Categories

- [ ] Category model in database
- [ ] Category selection in admin post editor
- [ ] Category badge on post cards
- [ ] Category pages `/category/[slug]`

### Enhanced Cards

- [ ] View count on each post card
- [ ] Category badge on each post card
- [ ] Publish date on each post card
- [ ] View count increments on post visit

## Dependencies

- No new npm packages required
- Uses existing: Prisma, Tailwind CSS, Next.js

## Sources & References

- `/app/ai-code/orblog` - Reference implementation patterns
- Current blog: `/app/ai-code/brainstorm`
