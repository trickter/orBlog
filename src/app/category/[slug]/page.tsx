import { notFound } from "next/navigation";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/actions";
import { BlogLayout } from "@/components/BlogLayout";
import { PostCard } from "@/components/PostCard";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(slug);

  return (
    <BlogLayout>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        {category.name}
      </h1>

      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No posts in this category yet.
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
