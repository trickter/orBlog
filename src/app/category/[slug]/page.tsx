import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategory } from '@/lib/actions';
import { BlogLayout } from '@/components/BlogLayout';
import { PostCard } from '@/components/PostCard';
import { loadBlogShellData } from '@/lib/blog-shell';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

type CategoryPost = Awaited<ReturnType<typeof getPostsByCategory>>[number];

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const [category, posts, shell] = await Promise.all([
    getCategoryBySlug(slug),
    getPostsByCategory(slug),
    loadBlogShellData(),
  ]);
  const { profile, categories } = shell;

  if (!category) {
    notFound();
  }

  return (
    <BlogLayout profile={profile} categories={categories}>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {category.name}
      </h1>

      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No posts in this category yet.
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post: CategoryPost) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </BlogLayout>
  );
}
