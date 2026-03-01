import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/actions";
import { formatDate, extractExcerpt } from "@/lib/utils";
import { Header } from "@/components/Header";

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
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          Category: {category.name}
        </h1>

        {posts.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts in this category yet.
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              >
                <Link href={`/posts/${post.slug}`}>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {extractExcerpt(post.content)}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                    <time>{formatDate(post.createdAt)}</time>
                    <span>•</span>
                    <span>{post.viewCount} views</span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
