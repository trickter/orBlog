import { prisma } from "@/lib/prisma";

export interface PostPageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface GetPostsPageOptions {
  categorySlug?: string;
  cursor?: string | null;
  limit?: number;
}

export interface PostsPageResult {
  items: PostPageItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getPostsPage({
  categorySlug,
  cursor,
  limit = 10,
}: GetPostsPageOptions = {}): Promise<PostsPageResult> {
  const pageSize = Math.min(Math.max(limit, 1), 20);

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
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

  const hasMore = posts.length > pageSize;
  const items = hasMore ? posts.slice(0, pageSize) : posts;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}
