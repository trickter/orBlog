'use client';

import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { SearchBox } from '@/components/SearchBox';
import { useTheme } from '@/components/ThemeProvider';

export function TopNav() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid h-16 grid-cols-[auto_minmax(0,24rem)_auto] items-center gap-4">
          <Link
            href="/"
            className="font-logo justify-self-start text-xl font-bold text-zinc-900 dark:text-zinc-100"
          >
            orBlog
          </Link>

          <div className="min-w-0 w-full">
            <SearchBox />
          </div>

          <nav className="justify-self-end flex items-center gap-2 whitespace-nowrap">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              aria-label="切换主题"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            <Link
              href="/about"
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              关于
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
