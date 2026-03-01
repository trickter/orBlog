import { searchPosts } from '@/lib/actions';
import { BlogLayout } from '@/components/BlogLayout';
import { PostCard } from '@/components/PostCard';
import { loadBlogShellData } from '@/lib/blog-shell';

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q || '';
  const [posts, shell] = await Promise.all([
    query ? searchPosts(query) : Promise.resolve([]),
    loadBlogShellData(),
  ]);
  const { profile, categories } = shell;

  return (
    <BlogLayout profile={profile} categories={categories}>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {query ? `Search results for "${query}"` : 'Search'}
      </h1>

      {query && posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No posts found matching &quot;{query}&quot;
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </BlogLayout>
  );
}
