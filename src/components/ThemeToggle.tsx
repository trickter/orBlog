"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

function getThemeSnapshot() {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerTheme() {
  return "light";
}

export function ThemeToggle() {
  const mounted = useMounted();
  const theme = useSyncExternalStore(
    () => () => {},
    getThemeSnapshot,
    getServerTheme
  );

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      ) : (
        <Sun className="w-5 h-5 text-zinc-400" />
      )}
    </button>
  );
}
