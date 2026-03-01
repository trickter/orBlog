import {
  imageLookupKeys,
  rewriteMarkdownImageLinks,
} from '@/lib/markdown-image-links';

describe('imageLookupKeys', () => {
  it('returns lowercase key for simple path', () => {
    expect(imageLookupKeys('image.png')).toContain('image.png');
  });

  it('returns key without images/ prefix', () => {
    const keys = imageLookupKeys('images/photo.jpg');
    expect(keys).toContain('photo.jpg');
  });

  it('handles backslash paths', () => {
    const keys = imageLookupKeys('images\\photo.jpg');
    expect(keys).toContain('photo.jpg');
  });

  it('returns basename', () => {
    const keys = imageLookupKeys('images/folder/photo.png');
    expect(keys).toContain('photo.png');
  });

  it('handles query strings', () => {
    const keys = imageLookupKeys('photo.jpg?v=123');
    expect(keys).toContain('photo.jpg');
  });

  it('handles empty string', () => {
    expect(imageLookupKeys('')).toEqual([]);
  });
});

describe('rewriteMarkdownImageLinks', () => {
  it('returns original for empty content', () => {
    const result = rewriteMarkdownImageLinks('', () => null);
    expect(result).toBe('');
  });

  it('skips external URLs', () => {
    const content = '![img](https://example.com/image.png)';
    const result = rewriteMarkdownImageLinks(content, () => 'local.png');
    expect(result).toBe(content);
  });

  it('skips data URLs', () => {
    const content = '![img](data:image/png;base64,...)';
    const result = rewriteMarkdownImageLinks(content, () => 'local.png');
    expect(result).toBe(content);
  });

  it('rewrites local image paths', () => {
    const content = '![my image](images/photo.png)';
    const result = rewriteMarkdownImageLinks(content, (url) => {
      if (url === 'images/photo.png') return '/uploads/photo.png';
      return null;
    });
    expect(result).toBe('![my image](/uploads/photo.png)');
  });

  it('returns null for unmatched paths', () => {
    const content = '![img](unknown.png)';
    const result = rewriteMarkdownImageLinks(content, () => null);
    expect(result).toBe(content);
  });

  it('handles multiple images', () => {
    const content = '![a](a.png) and ![b](b.png)';
    const result = rewriteMarkdownImageLinks(content, (url) => {
      return `/uploads/${url}`;
    });
    expect(result).toBe('![a](/uploads/a.png) and ![b](/uploads/b.png)');
  });

  it('handles backslash paths', () => {
    const content = '![img](images\\photo.png)';
    const result = rewriteMarkdownImageLinks(content, (url) => {
      if (url.includes('photo')) return '/uploads/photo.png';
      return null;
    });
    expect(result).toBe('![img](/uploads/photo.png)');
  });
});
