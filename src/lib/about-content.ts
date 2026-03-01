export const DEFAULT_ABOUT_CONTENT = `# About

Welcome to my blog! I'm a full-stack developer passionate about
building great web applications.

This blog is built with Next.js, Tailwind CSS, and Prisma. It features
Markdown content, categories, search, and a beautiful dark mode.

## Tech Stack

- Next.js 16
- Tailwind CSS
- Prisma + SQLite
- TypeScript`;

export function resolveAboutContent(
  aboutContent: string | null | undefined
): string {
  const trimmed = aboutContent?.trim();
  if (!trimmed) {
    return DEFAULT_ABOUT_CONTENT;
  }
  return trimmed;
}
