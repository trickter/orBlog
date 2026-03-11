import Link from 'next/link';
import { formatDate, extractExcerpt } from '@/lib/utils';
import { PostCardData } from '@/lib/post-types';

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="group -mx-3 rounded-2xl px-3 py-5 transition-colors hover:bg-zinc-200/30 dark:hover:bg-zinc-800/35">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100">
          {post.title}
        </h2>
      </Link>

      <p className="mt-3 text-zinc-600 leading-7 dark:text-zinc-400">
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
              className="rounded-full bg-zinc-200/70 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end">
        <Link
          href={`/posts/${post.slug}`}
          className="translate-y-1 text-sm text-zinc-500 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 dark:text-zinc-400"
        >
          阅读全文 →
        </Link>
      </div>
    </article>
  );
}
