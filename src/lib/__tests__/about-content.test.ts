import { DEFAULT_ABOUT_CONTENT, resolveAboutContent } from '@/lib/about-content';

describe('resolveAboutContent', () => {
  it('falls back to default when content is null', () => {
    expect(resolveAboutContent(null)).toBe(DEFAULT_ABOUT_CONTENT);
  });

  it('falls back to default when content is blank', () => {
    expect(resolveAboutContent('   ')).toBe(DEFAULT_ABOUT_CONTENT);
  });

  it('returns trimmed custom content when present', () => {
    expect(resolveAboutContent('  # Custom About  ')).toBe('# Custom About');
  });
});
