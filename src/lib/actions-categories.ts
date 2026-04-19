'use server';

import { getPrisma } from '@/lib/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { slugify, verifyAdmin } from '@/lib/action-helpers';
import { postWithCategorySelect } from '@/lib/post-select';
import { BLOG_SHELL_CACHE_TAG } from '@/lib/constants';

export async function getCategories() {
  return getPrisma().category.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryBySlug(slug: string) {
  return getPrisma().category.findUnique({
    where: { slug },
  });
}

export async function getPostsByCategory(categorySlug: string) {
  return getPrisma().post.findMany({
    where: {
      published: true,
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: 'desc' },
    select: postWithCategorySelect,
  });
}

export async function createCategory(
  formData: FormData,
  adminSecret: string | null
) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    throw new Error('Category name is required');
  }

  const slug = slugify(name);
  const existing = await getPrisma().category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error('Category already exists');
  }

  await getPrisma().category.create({
    data: { name, slug },
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidateTag(BLOG_SHELL_CACHE_TAG);
}

export async function updateCategory(
  formData: FormData,
  adminSecret: string | null
) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const id = String(formData.get('id') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  if (!id || !name) {
    throw new Error('ID and name are required');
  }

  const slug = slugify(name);
  const existing = await getPrisma().category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error('Category name already exists');
  }

  await getPrisma().category.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidateTag(BLOG_SHELL_CACHE_TAG);
}

export async function deleteCategory(id: string, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  await getPrisma().category.delete({ where: { id } });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidateTag(BLOG_SHELL_CACHE_TAG);
}

export async function deleteCategoryFromClient(id: string) {
  'use server';
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value ?? null;
  await deleteCategory(id, session);
}
