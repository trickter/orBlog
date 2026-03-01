# Brainstorm: Personal Blog Platform

**Date:** 2026-03-01
**Status:** Draft

## What We're Building

A personal blog platform - a dynamic, database-backed web application for writing and publishing articles. Built with Next.js as a full-stack application.

## Why This Approach

**Full-stack Next.js** was chosen because:

- Complete control over data models and CMS functionality
- Single codebase for frontend and backend
- Personal use means custom admin panel is manageable
- Can start simple and add features as needed
- Next.js has excellent SEO benefits for blogs

## Key Decisions

| Decision   | Choice             | Rationale                              |
| ---------- | ------------------ | -------------------------------------- |
| Framework  | Next.js            | User preference, full-stack capability |
| Database   | SQLite             | Simple file-based DB, easy to backup   |
| Content    | Markdown           | Developer-friendly, popular for blogs  |
| Auth       | None               | Protected by environment variable      |
| Admin      | Custom admin panel | Built into the app                     |
| Styling    | Tailwind CSS       | Utility-first, fast development        |
| Deployment | Self-hosted        | More control                           |

## Open Questions

None - all decisions made!

## Next Steps

- Sketch out data models (posts, tags)
- Plan out pages (home, post, admin)
- Set up Next.js project with SQLite and Tailwind
