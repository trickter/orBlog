import Link from "next/link";
import { Github, Twitter, Mail, Search } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="w-full lg:w-64 lg:flex-shrink-0">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-zinc-200 dark:border-zinc-800 sticky top-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
            A
          </div>

          {/* Name */}
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
            Alex
          </h2>

          {/* Bio */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Full Stack Developer
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="mailto:hello@example.com"
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Search */}
          <form action="/search" className="mt-6 w-full">
            <div className="relative">
              <input
                type="text"
                name="q"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="mt-6 w-full">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="block py-2 px-4 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="block py-2 px-4 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  标签
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 px-4 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  关于
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </aside>
  );
}
