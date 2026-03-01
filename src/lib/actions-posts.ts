'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { postDropdownSelect, postWithCategorySelect } from '@/lib/post-select';
import {
  SEARCH_DROPDOWN_LIMIT,
  SEARCH_DROPDOWN_MAX_QUERY_LENGTH,
  SEARCH_DROPDOWN_MIN_QUERY,
} from '@/lib/constants';
import { slugify, verifyAdmin } from '@/lib/action-helpers';
import {
  imageLookupKeys,
  rewriteMarkdownImageLinks,
} from '@/lib/markdown-image-links';

export async function getPosts(categorySlug?: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: postWithCategorySelect,
  });
}

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    select: postWithCategorySelect,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({
    where: { slug },
    select: postWithCategorySelect,
  });
}

export async function incrementViewCount(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });
}

export async function searchPosts(query: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [{ title: { contains: query } }, { content: { contains: query } }],
    },
    orderBy: { createdAt: 'desc' },
    select: postWithCategorySelect,
  });
}

export async function searchPostsForDropdown(query: string) {
  const normalized = query
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, SEARCH_DROPDOWN_MAX_QUERY_LENGTH);
  if (normalized.length < SEARCH_DROPDOWN_MIN_QUERY) {
    return [];
  }

  return prisma.post.findMany({
    where: {
      published: true,
      title: { contains: normalized },
    },
    orderBy: { createdAt: 'desc' },
    take: SEARCH_DROPDOWN_LIMIT,
    select: postDropdownSelect,
  });
}

export interface ZipImageData {
  name: string;
  data: string; // base64 encoded
}

export async function applyZipImagesIfPresent(
  content: string,
  zipImagesJson: string,
  slug: string,
  processor: (
    content: string,
    images: ZipImageData[],
    slug: string
  ) => Promise<string> = processZipImages
): Promise<string> {
  if (!zipImagesJson || zipImagesJson === '[]') {
    return content;
  }

  let zipImages: ZipImageData[];
  try {
    zipImages = JSON.parse(zipImagesJson) as ZipImageData[];
  } catch {
    throw new Error('ZIP images metadata is invalid.');
  }

  if (!Array.isArray(zipImages) || zipImages.length === 0) {
    return content;
  }

  try {
    return await processor(content, zipImages, slug);
  } catch (error) {
    console.error('Error processing zip images:', error);
    throw new Error(
      'ZIP images processing failed. Please verify ZIP content and retry.'
    );
  }
}

export async function processZipImages(
  content: string,
  images: ZipImageData[],
  slug: string
): Promise<string> {
  if (images.length === 0) {
    return content;
  }

  const fs = await import('fs/promises');
  const path = await import('path');
  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'posts',
    slug
  );
  await fs.mkdir(uploadDir, { recursive: true });

  const imagePathByKey = new Map<string, string>();

  for (const img of images) {
    const buffer = Buffer.from(img.data, 'base64');
    const ext = path.extname(img.name) || '.png';
    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer);
    const nextPath = `/uploads/posts/${slug}/${filename}`;
    for (const key of imageLookupKeys(img.name)) {
      if (!imagePathByKey.has(key)) {
        imagePathByKey.set(key, nextPath);
      }
    }
  }

  return rewriteMarkdownImageLinks(content, (markdownUrl) => {
    for (const key of imageLookupKeys(markdownUrl)) {
      const candidate = imagePathByKey.get(key);
      if (candidate) {
        return candidate;
      }
    }
    return null;
  });
}

export async function createPost(
  formData: FormData,
  adminSecret: string | null
) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const published = formData.get('published') === 'on';
  const categoryId = String(formData.get('categoryId') ?? '').trim() || null;

  if (!title || !content) {
    throw new Error('Title and content are required');
  }

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  const zipImagesJson = String(formData.get('zipImages') ?? '[]');
  const finalContent = await applyZipImagesIfPresent(
    content,
    zipImagesJson,
    slug
  );

  await prisma.post.create({
    data: {
      title,
      slug,
      content: finalContent,
      published,
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
  redirect(published ? '/' : '/admin');
}

export async function updatePost(
  formData: FormData,
  adminSecret: string | null
) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const id = String(formData.get('id') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const published = formData.get('published') === 'on';
  const categoryId = String(formData.get('categoryId') ?? '').trim() || null;

  if (!id || !title || !content) {
    throw new Error('ID, title and content are required');
  }

  const currentPost = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });
  if (!currentPost) {
    throw new Error('Post not found');
  }

  let slug = currentPost.slug;
  if (title !== currentPost.title) {
    slug = slugify(title);
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  await prisma.post.update({
    where: { id },
    data: {
      title,
      slug,
      content,
      published,
      ...(categoryId ? { categoryId } : { categoryId: null }),
    },
  });

  revalidatePath('/');
  revalidatePath(`/posts/${currentPost.slug}`);
  revalidatePath('/admin');
  redirect(published ? `/posts/${slug}` : '/admin');
}

export async function deletePost(id: string, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath('/');
  revalidatePath(`/posts/${post.slug}`);
  revalidatePath('/admin');
}
