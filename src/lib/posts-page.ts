import { prisma } from "@/lib/prisma";
import { postWithCategorySelect } from "@/lib/post-select";
import { PostWithCategory } from "@/lib/post-types";
import {
  FEED_PAGE_DEFAULT_LIMIT,
  FEED_PAGE_MAX_LIMIT,
} from "@/lib/constants";

interface GetPostsPageOptions {
  categorySlug?: string;
  cursor?: string | null;
  limit?: number;
}

export interface PostsPageResult {
  items: PostWithCategory[];
  nextCursor: string | null;
  hasMore: boolean;
}

export async function getPostsPage({
  categorySlug,
  cursor,
  limit = FEED_PAGE_DEFAULT_LIMIT,
}: GetPostsPageOptions = {}): Promise<PostsPageResult> {
  const pageSize = Math.min(Math.max(limit, 1), FEED_PAGE_MAX_LIMIT);

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: pageSize + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: postWithCategorySelect,
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
