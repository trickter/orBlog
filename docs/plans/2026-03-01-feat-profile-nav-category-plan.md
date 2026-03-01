---
title: Add editable profile, top navigation, and category management
type: feat
status: active
date: 2026-03-01
---

# Add Editable Profile, Top Navigation, and Category Management

## Overview

Add features for editable personal profile in sidebar, move search/categories to top navigation, admin CRUD for categories/tags, and category filter UI.

## UI References

- Main layout: `/images/微信图片_20260301185534_104_45.png`
- Category filter: `/images/分类.png`

## Feature Requirements

### 1. Editable Personal Profile in Sidebar

Store profile data in database or config file:

- Avatar (image URL or upload)
- Name
- Bio/description
- Social links (GitHub, Twitter, Email)

**Data Model:**

```prisma
model Profile {
  id        String  @id @default("default")
  name      String
  bio       String?
  avatar    String?
  github    String?
  twitter   String?
  email     String?
}
```

### 2. Top Navigation Bar

Move search and categories to top navigation (like UI reference):

- Logo/Site name on left
- Navigation links: Home, Categories (dropdown with all categories), About
- Search bar integrated in nav
- Theme toggle on right

### 3. Admin Category Management

- Create new categories (name, slug)
- Edit existing categories
- Delete categories (with confirmation)
- List all categories in admin panel

### 4. Category Filter UI

Like `/images/分类.png`:

- Horizontal scrolling pill list at top of post list
- "All" option to show all posts
- Clicking category filters posts on current page (or navigate to category page)
- Selected category highlighted

## Technical Approach

### Phase 1: Profile Data Model

- Add Profile model to Prisma schema
- Add CRUD actions for profile
- Create admin profile edit page

### Phase 2: Top Navigation

- Create TopNav component
- Move search from sidebar to top nav
- Add categories dropdown
- Update BlogLayout

### Phase 3: Category Management

- Add category CRUD actions
- Create admin category list page
- Create admin category new/edit page

### Phase 4: Category Filter UI

- Update homepage to show category filter pills
- Horizontal scroll container for categories
- Filter posts by category (client-side or server-side)

## Acceptance Criteria

- [ ] Profile data stored in database
- [ ] Admin can edit profile (name, bio, avatar URL, social links)
- [ ] Sidebar displays profile from database
- [ ] Top navigation with search bar and categories dropdown
- [ ] Admin can create/edit/delete categories
- [ ] Category filter pills on homepage (horizontal scroll)
- [ ] Click category to filter posts
- [ ] Category filter UI matches /images/分类.png

## Files to Modify

- `prisma/schema.prisma` - Add Profile model
- `src/lib/actions.ts` - Add profile and category CRUD actions
- `src/app/admin/(protected)/profile/page.tsx` - New profile edit page
- `src/app/admin/(protected)/categories/page.tsx` - New category list
- `src/app/admin/(protected)/categories/new/page.tsx` - New category form
- `src/app/admin/(protected)/categories/[id]/page.tsx` - Edit category
- `src/components/TopNav.tsx` - New top navigation
- `src/components/Sidebar.tsx` - Use profile from database
- `src/components/CategoryFilter.tsx` - New category filter pills
- `src/components/BlogLayout.tsx` - Add top nav
- `src/app/page.tsx` - Add category filter

## Sources

- UI Reference (main): `/images/微信图片_20260301185534_104_45.png`
- UI Reference (category): `/images/分类.png`
