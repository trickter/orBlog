import Link from 'next/link';
import { BlogLayout } from '@/components/BlogLayout';
import { CategoryFilter } from '@/components/CategoryFilter';
import { InfinitePostList } from '@/components/InfinitePostList';
import { getPostsPage } from '@/lib/posts-page';
import { loadBlogShellData } from '@/lib/blog-shell';
import { FEED_PAGE_DEFAULT_LIMIT } from '@/lib/constants';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [initialPage, shell] = await Promise.all([
    getPostsPage({ categorySlug: category, limit: FEED_PAGE_DEFAULT_LIMIT }),
    loadBlogShellData(),
  ]);
  const { profile, categories } = shell;

  return (
    <BlogLayout profile={profile} categories={categories}>
      {categories.length > 0 && <CategoryFilter categories={categories} />}

      {initialPage.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts yet.{' '}
            <Link href="/admin" className="font-medium text-zinc-700 hover:underline dark:text-zinc-300">
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
