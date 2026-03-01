import Link from "next/link";
import { searchPosts } from "@/lib/actions";
import { formatDate, extractExcerpt } from "@/lib/utils";
import { Header } from "@/components/Header";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = q || "";
  const posts = query ? await searchPosts(query) : [];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
          {query ? `Search results for "${query}"` : "Search"}
        </h1>

        {query && posts.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts found matching "{query}"
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
                </Link>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  {extractExcerpt(post.content)}
                </p>
                <div className="mt-4 flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                  <time>{formatDate(post.createdAt)}</time>
                  <span>•</span>
                  <span>{post.viewCount} views</span>
                  {post.category && (
                    <>
                      <span>•</span>
                      <Link
                        href={`/category/${post.category.slug}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {post.category.name}
                      </Link>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
