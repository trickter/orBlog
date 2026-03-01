"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface TopNavProps {
  categories: Category[];
}

export function TopNav({ categories }: TopNavProps) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-zinc-900 dark:text-zinc-100">
            My Blog
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-4">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Categories
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCategories && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg py-1">
                  <Link
                    href="/"
                    className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    onClick={() => setShowCategories(false)}
                  >
                    All Posts
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/category/${cat.slug}`}
                      className="block px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      onClick={() => setShowCategories(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              About
            </Link>
          </nav>

          {/* Search */}
          <form action="/search" className="flex items-center">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="w-40 lg:w-48 px-3 py-1.5 pl-8 text-sm bg-zinc-100 dark:bg-zinc-800 border-none rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
