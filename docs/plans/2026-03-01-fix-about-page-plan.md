---
title: Fix /about page profile and content update issues
type: fix
status: active
date: 2026-03-01
---

# Fix /about Page Profile and Content Update Issues

## Overview

修复两个问题：
1. 修改简介后，/about 页面左侧边栏的简介不更新
2. /about 页面右侧的正文内容无法修改（目前是硬编码）

## Problem Statement

### Issue 1: 侧边栏简介不更新
当在管理后台修改 Profile 的 bio 后，/about 页面的侧边栏不会更新。原因：`actions-profile.ts` 中更新后没有调用 `revalidatePath('/about')`。

### Issue 2: About 页面内容无法编辑
/about 页面内容目前在 `src/app/about/page.tsx` 中硬编码，无法通过管理后台修改。

## Proposed Solution

### Fix 1: 添加 revalidatePath

在 `src/lib/actions-profile.ts` 中添加 `revalidatePath('/about')`。

### Fix 2: 添加数据库字段并更新页面

1. 在 Profile 模型中添加 `aboutContent` 字段（可选字段，存储 Markdown 内容）
2. 更新管理后台允许编辑 about 内容
3. 更新 about 页面从数据库读取内容

## Technical Approach

### 修改 1: Prisma Schema

```prisma
// prisma/schema.prisma
model Profile {
  id           String  @id @default("default")
  name         String
  bio          String?
  avatar       String?
  github       String?
  twitter      String?
  email        String?
  aboutContent String? // 新增：About 页面内容
}
```

### 修改 2: actions-profile.ts

```typescript
// src/lib/actions-profile.ts - 添加 aboutContent 字段处理
export async function updateProfile(
  formData: FormData,
  adminSecret: string | null
) {
  // ... existing code ...

  const aboutContent = String(formData.get('aboutContent') ?? '').trim() || null;

  await prisma.profile.upsert({
    where: { id: 'default' },
    update: { name, bio, avatar, github, twitter, email, aboutContent },
    create: { id: 'default', name, bio, avatar, github, twitter, email, aboutContent },
  });

  revalidatePath('/');
  revalidatePath('/about');  // 新增
  revalidatePath('/admin');
}
```

### 修改 3: 管理后台表单

在 `src/app/admin/(protected)/profile/page.tsx` 添加 aboutContent 编辑区域。

### 修改 4: About 页面

在 `src/app/about/page.tsx` 中：
- 如果数据库有 aboutContent，显示数据库内容（支持 Markdown）
- 如果没有，回退到默认内容

## System-Wide Impact

- 修改了 Profile 数据模型
- 添加了新的数据库字段需要迁移
- 页面渲染需要处理 Markdown

## Acceptance Criteria

- [x] 修改 Profile bio 后，/about 页面侧边栏立即更新
- [x] 管理后台可以编辑 About 页面内容
- [x] /about 页面显示数据库中的内容
- [x] 旧数据（无 aboutContent 字段）能正常回退到默认内容

## Dependencies

- 需要运行 `npx prisma db push` 更新数据库

## Sources

- Profile model: `prisma/schema.prisma`
- Profile actions: `src/lib/actions-profile.ts:52`
- Admin profile page: `src/app/admin/(protected)/profile/page.tsx`
- About page: `src/app/about/page.tsx`
