import Link from 'next/link';
import { formatDate, extractExcerpt } from '@/lib/utils';
import { PostCardData } from '@/lib/post-types';

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {post.title}
        </h2>
      </Link>

      <p className="mt-3 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {extractExcerpt(post.content)}
      </p>

      <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-500">
        <time>{formatDate(post.createdAt)}</time>
        <span className="text-zinc-300 dark:text-zinc-700">·</span>
        <span>{post.viewCount} 阅读</span>

        {post.category && (
          <>
            <span className="text-zinc-300 dark:text-zinc-700">·</span>
            <Link
              href={`/category/${post.category.slug}`}
              className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </div>
    </article>
  );
}
