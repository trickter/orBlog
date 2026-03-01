import { BlogLayout } from '@/components/BlogLayout';
import { loadBlogShellData } from '@/lib/blog-shell';

export default async function AboutPage() {
  const { profile, categories } = await loadBlogShellData();

  return (
    <BlogLayout profile={profile} categories={categories}>
      <article className="prose prose-slate dark:prose-invert max-w-none">
        <h1>About</h1>
        <p>
          Welcome to my blog! I&apos;m a full-stack developer passionate about
          building great web applications.
        </p>
        <p>
          This blog is built with Next.js, Tailwind CSS, and Prisma. It features
          Markdown content, categories, search, and a beautiful dark mode.
        </p>
        <h2>Tech Stack</h2>
        <ul>
          <li>Next.js 16</li>
          <li>Tailwind CSS</li>
          <li>Prisma + SQLite</li>
          <li>TypeScript</li>
        </ul>
      </article>
    </BlogLayout>
  );
}
