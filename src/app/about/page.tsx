import { BlogLayout } from '@/components/BlogLayout';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { resolveAboutContent } from '@/lib/about-content';
import { loadBlogShellData } from '@/lib/blog-shell';

export const revalidate = 0;

export default async function AboutPage() {
  const { profile, categories } = await loadBlogShellData();
  const content = resolveAboutContent(profile.aboutContent);

  return (
    <BlogLayout profile={profile} categories={categories}>
      <article>
        <MarkdownRenderer content={content} />
      </article>
    </BlogLayout>
  );
}
