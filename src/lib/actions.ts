"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySessionToken } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Admin session check
function verifyAdmin(session: string | null): boolean {
  if (!session) return false;
  return verifySessionToken(session);
}

export async function getPosts() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      published: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function getAllPosts() {
  return prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      published: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function getPostBySlug(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      published: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (post) {
    // Increment view count
    await prisma.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return post;
}

export async function searchPosts(query: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: query } },
        { content: { contains: query } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      published: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
  });
}

export async function getPostsByCategory(categorySlug: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      category: { slug: categorySlug },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      published: true,
      viewCount: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

export async function createPost(formData: FormData, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;

  if (!title || !content) {
    throw new Error("Title and content are required");
  }

  let slug = slugify(title);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      published,
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  redirect(published ? "/" : "/admin");
}

export async function updatePost(formData: FormData, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const published = formData.get("published") === "on";
  const categoryId = String(formData.get("categoryId") ?? "").trim() || null;

  if (!id || !title || !content) {
    throw new Error("ID, title and content are required");
  }

  const currentPost = await prisma.post.findUnique({
    where: { id },
    select: { slug: true, title: true },
  });
  if (!currentPost) {
    throw new Error("Post not found");
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
      categoryId: categoryId || undefined,
    },
  });

  revalidatePath("/");
  revalidatePath(`/posts/${currentPost.slug}`);
  revalidatePath("/admin");
  redirect(published ? `/posts/${slug}` : "/admin");
}

export async function deletePost(id: string, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { slug: true },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  await prisma.post.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath(`/posts/${post.slug}`);
  revalidatePath("/admin");
}
