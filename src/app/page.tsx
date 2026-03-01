import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { formatDate, extractExcerpt } from "@/lib/utils";

export const revalidate = 0;

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            My Blog
          </h1>
          <Link
            href="/admin"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Admin
          </Link>
        </div>
      </header>

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
          <div className="space-y-12">
            {posts.map((post) => (
              <article key={post.id} className="group">
                <Link href={`/posts/${post.slug}`}>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                    {extractExcerpt(post.content)}
                  </p>
                  <time className="mt-3 block text-sm text-zinc-500 dark:text-zinc-500">
                    {formatDate(post.createdAt)}
                  </time>
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
