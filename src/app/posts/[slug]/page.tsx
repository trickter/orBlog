import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/actions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 py-6 flex justify-between items-center">
          <Link
            href="/"
            className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            My Blog
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {post.title}
          </h1>
          <time className="text-sm text-zinc-500 dark:text-zinc-500">
            {formatDate(post.createdAt)}
          </time>
          <div className="mt-8">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>
      </main>
    </div>
  );
}
