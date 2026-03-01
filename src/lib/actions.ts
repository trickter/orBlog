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

export async function getPosts(categorySlug?: string) {
  return prisma.post.findMany({
    where: {
      published: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
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

  return post;
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

export async function searchPostsForDropdown(query: string) {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 64);
  if (normalized.length < 2) {
    return [];
  }

  return prisma.post.findMany({
    where: {
      published: true,
      title: { contains: normalized },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
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
      ...(categoryId ? { categoryId } : { categoryId: null }),
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

// Profile actions
export async function getProfile() {
  const profile = await prisma.profile.findUnique({
    where: { id: "default" },
  });
  // Return default profile if not found
  if (!profile) {
    return {
      id: "default",
      name: "Alex",
      bio: "Full Stack Developer",
      avatar: null,
      github: null,
      twitter: null,
      email: null,
    };
  }
  return profile;
}

export async function updateProfile(formData: FormData, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const avatar = String(formData.get("avatar") ?? "").trim() || null;
  const github = String(formData.get("github") ?? "").trim() || null;
  const twitter = String(formData.get("twitter") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.profile.upsert({
    where: { id: "default" },
    update: { name, bio, avatar, github, twitter, email },
    create: { id: "default", name, bio, avatar, github, twitter, email },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

// Category CRUD actions
export async function createCategory(formData: FormData, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    throw new Error("Category name is required");
  }

  const slug = slugify(name);

  // Check for duplicate
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error("Category already exists");
  }

  await prisma.category.create({
    data: { name, slug },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateCategory(formData: FormData, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!id || !name) {
    throw new Error("ID and name are required");
  }

  const slug = slugify(name);

  // Check for duplicate (excluding current)
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing && existing.id !== id) {
    throw new Error("Category name already exists");
  }

  await prisma.category.update({
    where: { id },
    data: { name, slug },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteCategory(id: string, adminSecret: string | null) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error("Unauthorized");
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteCategoryFromClient(id: string) {
  "use server";
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value ?? null;
  await deleteCategory(id, session);
}
