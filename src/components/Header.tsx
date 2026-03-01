import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { SearchForm } from "./SearchForm";

export function Header() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-zinc-900 dark:text-zinc-100 whitespace-nowrap"
        >
          My Blog
        </Link>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <SearchForm />
          <ThemeToggle />
          <Link
            href="/admin"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
