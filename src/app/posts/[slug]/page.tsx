import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPublishedPostSlugs } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import { BlogLayout } from '@/components/BlogLayout';
import { ViewCounter } from '@/components/ViewCounter';
import { loadBlogShellData } from '@/lib/blog-shell';
import { compileMarkdownToHtml } from '@/lib/markdown-to-html';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublishedPostSlugs();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, shell] = await Promise.all([
    getPostBySlug(slug),
    loadBlogShellData(),
  ]);
  const { profile, categories } = shell;

  if (!post) {
    notFound();
  }

  const renderedContentHtml =
    post.contentHtml ?? compileMarkdownToHtml(post.content);

  return (
    <BlogLayout profile={profile} categories={categories}>
      <ViewCounter postId={post.id} />

      <article>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500 mb-8">
          <time>{formatDate(post.createdAt)}</time>
          <span>·</span>
          <span>{post.viewCount} 阅读</span>
          {post.category && (
            <>
              <span>·</span>
              <Link
                href={`/category/${post.category.slug}`}
                className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                {post.category.name}
              </Link>
            </>
          )}
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: renderedContentHtml }}
        />
      </article>
    </BlogLayout>
  );
}
