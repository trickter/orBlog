import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { formatDate, extractExcerpt } from "@/lib/utils";
import { Header } from "@/components/Header";

export const revalidate = 0;

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 dark:text-zinc-400">
              No posts yet.{" "}
              <Link href="/admin" className="text-blue-600 hover:underline">
                Create your first post
              </Link>
            </p>
          </div>
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
