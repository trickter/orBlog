---
title: Personal Blog Platform
type: feat
status: active
date: 2026-03-01
origin: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md
---

# Personal Blog Platform

## Overview

A personal blog platform - a dynamic, database-backed web application for writing and publishing articles. Built with Next.js as a full-stack application.

## Problem Statement / Motivation

Need a personal blog to write and publish articles. Should be simple to use, easy to maintain, and self-hosted for full control.

(see brainstorm: docs/brainstorms/2026-03-01-personal-blog-brainstorm.md)

Key decisions from brainstorm:
- **Framework**: Next.js (full-stack)
- **Database**: SQLite (file-based, easy backup)
- **Content Format**: Markdown
- **Auth**: Environment variable protection (no user auth)
- **Admin**: Custom admin panel
- **Styling**: Tailwind CSS
- **Deployment**: Self-hosted

## Proposed Solution

Build a Next.js app with:
1. SQLite database via Prisma ORM
2. Markdown content with a simple editor
3. Public blog pages (home, post detail)
4. Protected admin panel (via ADMIN_SECRET env var)
5. Basic CRUD for posts

## Technical Considerations

### Architecture
- **Next.js 16** with App Router
- **Prisma + SQLite** for database (pattern from `/app/ai-code/orblog`)
- **Server Actions** for data mutations (pattern from `/app/ai-code/orblog/src/lib/actions.ts`)
- **Tailwind CSS v4** with `@tailwindcss/typography` plugin

### Dependencies
- `prisma`, `@prisma/client` - Database ORM
- `marked`, `react-markdown`, `rehype-highlight`, `remark-gfm` - Markdown rendering
- `lucide-react` - Icons
- `date-fns` - Date formatting

## System-Wide Impact

- **Database**: New SQLite file (`dev.db`) created in project
- **Admin access**: Protected by `ADMIN_SECRET` environment variable
- **Public routes**: `/`, `/posts/[slug]`
- **Admin routes**: `/admin`, `/admin/new`, `/admin/edit/[id]`

## Acceptance Criteria

### Core Features
- [ ] Home page lists all published posts (title, excerpt, date)
- [ ] Post detail page renders Markdown to HTML with syntax highlighting
- [ ] Admin page lists all posts with edit/delete options
- [ ] Create new post (title, content in Markdown, published status)
- [ ] Edit existing post
- [ ] Delete post with confirmation

### Technical Requirements
- [ ] SQLite database with Prisma schema (posts, tags)
- [ ] Admin panel protected by `ADMIN_SECRET` env var
- [ ] Markdown rendered with proper formatting and code highlighting
- [ ] Responsive design with Tailwind CSS

### Data Model

```
Post:
  - id: String (cuid)
  - title: String
  - slug: String (unique)
  - content: String (Markdown)
  - published: Boolean
  - createdAt: DateTime
  - updatedAt: DateTime

Tag:
  - id: String (cuid)
  - name: String (unique)
  - posts: Post[] (many-to-many)
```

## Success Metrics

- Blog is functional with CRUD operations
- Markdown renders correctly with syntax highlighting
- Admin panel is protected by environment variable

## Dependencies & Risks

- **Risk**: None significant - follows proven patterns from orblog
- **Dependencies**: None blocking

## Sources & References

- **Origin brainstorm:** [docs/brainstorms/2026-03-01-personal-blog-brainstorm.md](docs/brainstorms/2026-03-01-personal-blog-brainstorm.md)
- **Reference implementation:** `/app/ai-code/orblog` - Similar Next.js blog with Prisma + SQLite
- **Database pattern:** `/app/ai-code/orblog/prisma/schema.prisma`
- **Server Actions pattern:** `/app/ai-code/orblog/src/lib/actions.ts`
- **Markdown rendering:** Uses `marked`, `react-markdown`, `rehype-highlight`, `remark-gfm`
- **Tailwind v4:** Uses `@import "tailwindcss"` and `@plugin "@tailwindcss/typography"`

## Setup Commands

```bash
npm install
cp .env.example .env  # Set ADMIN_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
