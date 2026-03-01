"use client";

import { searchPostsForDropdown } from "@/lib/actions";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
  SEARCH_DROPDOWN_DEBOUNCE_MS,
  SEARCH_DROPDOWN_MIN_QUERY,
} from "@/lib/constants";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
}

export function SearchBox() {
  const router = useRouter();
  const latestRequestIdRef = useRef(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < SEARCH_DROPDOWN_MIN_QUERY) {
      latestRequestIdRef.current += 1;
      setResults([]);
      setLoading(false);
      setOpen(false);
      return;
    }

    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchPostsForDropdown(trimmed);
        if (latestRequestIdRef.current !== requestId) {
          return;
        }
        setResults(data);
        setOpen(true);
      } catch {
        if (latestRequestIdRef.current !== requestId) {
          return;
        }
        setResults([]);
        setOpen(false);
      } finally {
        if (latestRequestIdRef.current === requestId) {
          setLoading(false);
        }
      }
    }, SEARCH_DROPDOWN_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length >= SEARCH_DROPDOWN_MIN_QUERY) {
            setOpen(true);
          }
        }}
        onBlur={() => {
          setTimeout(() => setOpen(false), 120);
        }}
        placeholder="搜索..."
        className="w-full px-3 py-1.5 pl-8 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
          {loading ? (
            <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              搜索中...
            </div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    onClick={() => setOpen(false)}
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              没有匹配文章
            </div>
          )}
        </div>
      )}
    </form>
  );
}
