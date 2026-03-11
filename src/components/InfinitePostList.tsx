'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PostCard } from '@/components/PostCard';
import { PostCardData } from '@/lib/post-types';
import { FEED_PAGE_DEFAULT_LIMIT } from '@/lib/constants';

type PostItem = PostCardData;

interface PostsPageResponse {
  items: PostItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface InfinitePostListProps {
  initialPosts: PostItem[];
  initialCursor: string | null;
  initialHasMore: boolean;
  category?: string;
}

export function InfinitePostList({
  initialPosts,
  initialCursor,
  initialHasMore,
  category,
}: InfinitePostListProps) {
  const [posts, setPosts] = useState<PostItem[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    requestIdRef.current += 1;
    setPosts(initialPosts);
    setNextCursor(initialCursor);
    setHasMore(initialHasMore);
    setLoading(false);
    setError(null);
  }, [category, initialPosts, initialCursor, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('limit', `${FEED_PAGE_DEFAULT_LIMIT}`);
      if (category) {
        params.set('category', category);
      }
      if (nextCursor) {
        params.set('cursor', nextCursor);
      }

      const response = await fetch(`/api/posts?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('load_failed');
      }

      const data = (await response.json()) as PostsPageResponse;
      if (requestIdRef.current !== requestId) {
        return;
      }

      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        const appended = data.items.filter((post) => !existingIds.has(post.id));
        return [...prev, ...appended];
      });
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      if (requestIdRef.current !== requestId) {
        return;
      }
      setError('加载失败，请重试');
    } finally {
      if (requestIdRef.current === requestId) {
        setLoading(false);
      }
    }
  }, [category, hasMore, loading, nextCursor]);

  useEffect(() => {
    if (!hasMore || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/80">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {error ? (
        <div className="flex flex-col items-center gap-3 py-4">
          <p className="text-sm text-red-500">{error}</p>
          <button
            type="button"
            onClick={() => {
              void loadMore();
            }}
            className="px-3 py-1.5 rounded-md text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
          >
            重试加载
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-4">
          正在加载更多...
        </p>
      ) : null}

      {!hasMore && posts.length > 0 ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-4">
          已加载全部文章
        </p>
      ) : null}

      <div ref={sentinelRef} className="h-2" />
    </div>
  );
}
