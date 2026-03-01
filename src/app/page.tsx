import Link from "next/link";
import { getProfile, getCategories } from "@/lib/actions";
import { BlogLayout } from "@/components/BlogLayout";
import { CategoryFilter } from "@/components/CategoryFilter";
import { InfinitePostList } from "@/components/InfinitePostList";
import { getPostsPage } from "@/lib/posts-page";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [initialPage, profile, categories] = await Promise.all([
    getPostsPage({ categorySlug: category, limit: 10 }),
    getProfile(),
    getCategories(),
  ]);

  return (
    <BlogLayout profile={profile} categories={categories}>
      {categories.length > 0 && (
        <CategoryFilter categories={categories} />
      )}

      {initialPage.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts yet.{" "}
            <Link href="/admin" className="text-blue-600 hover:underline">
              Create your first post
            </Link>
          </p>
        </div>
      ) : (
        <InfinitePostList
          initialPosts={initialPage.items}
          initialCursor={initialPage.nextCursor}
          initialHasMore={initialPage.hasMore}
          category={category}
        />
      )}
    </BlogLayout>
  );
}
