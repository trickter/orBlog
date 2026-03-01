import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/actions";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/utils";
import { Header } from "@/components/Header";
import { ViewCounter } from "@/components/ViewCounter";

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
      <Header />
      <ViewCounter postId={post.id} />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <article>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500 mb-8">
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
          <div className="prose prose-slate max-w-none dark:prose-invert">
            <MarkdownRenderer content={post.content} />
          </div>
        </article>
      </main>
    </div>
  );
}
