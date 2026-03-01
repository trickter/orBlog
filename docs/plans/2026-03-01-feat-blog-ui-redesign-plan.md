---
title: Redesign blog with sidebar layout and modern typography
type: feat
status: active
date: 2026-03-01
---

# Redesign Blog with Sidebar Layout and Modern Typography

## Overview

Redesign the blog to match the UI reference image with a two-column layout: personal profile sidebar on the left and blog content on the right. Also switch to modern, developer-friendly typography.

## UI Reference

![UI Design](/images/微信图片_20260301185534_104_45.png)

## Layout Structure

### Left Sidebar (Personal Profile)

- Circular avatar image
- Name/username
- Bio/description
- Social links: GitHub, Twitter/X, Gmail icons

### Right Content Area

- Top navigation: Home, Tags, About
- Search bar
- Blog post cards with:
  - Title
  - Excerpt/摘要
  - Footer: publish date, view count, category tags (pill style)

## Typography

Switch to developer/ youth-friendly fonts:

- **Primary font**: JetBrains Mono (monospace, developer-friendly) or Geist (modern, clean)
- **Chinese font**: Noto Sans SC or system-ui for better CJK support

## Technical Approach

### Phase 1: Layout Structure

- Create Sidebar component with profile info
- Update main layout to two-column grid
- Make sidebar responsive (hidden on mobile, hamburger menu)

### Phase 2: Components

- ProfileCard component with avatar, name, bio, social links
- Update Header/Navigation for the new layout
- Update post cards to match UI (pill-style tags)

### Phase 3: Typography

- Configure Google Fonts in Next.js
- Update globals.css with new font families
- Apply to all text elements

## Acceptance Criteria

- [ ] Two-column layout matches UI reference image
- [ ] Left sidebar shows avatar, name, bio, social icons
- [ ] Right side shows navigation, search, blog cards
- [ ] Modern developer-friendly font applied (JetBrains Mono or Geist)
- [ ] Dark mode still works correctly
- [ ] Mobile responsive (sidebar collapses)
- [ ] Blog features (search, categories, view count) still work

## Files to Modify

- `src/app/layout.tsx` - Main layout structure
- `src/app/globals.css` - Add fonts
- `src/components/Sidebar.tsx` - New sidebar component
- `src/components/Header.tsx` - Update navigation
- `src/components/PostCard.tsx` - New post card component
- `src/app/page.tsx` - Use new layout
- `src/app/category/[slug]/page.tsx` - Use new layout
- `src/app/search/page.tsx` - Use new layout
- `src/app/posts/[slug]/page.tsx` - Use new layout

## Sources

- UI Reference: `/images/微信图片_20260301185534_104_45.png`
