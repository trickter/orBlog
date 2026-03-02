import { normalizeUploadsPath } from '@/lib/normalize-uploads-path';

describe('normalizeUploadsPath', () => {
  it('keeps absolute URLs unchanged', () => {
    expect(normalizeUploadsPath('https://example.com/a.png')).toBe(
      'https://example.com/a.png'
    );
    expect(normalizeUploadsPath('data:image/png;base64,abc')).toBe(
      'data:image/png;base64,abc'
    );
  });

  it('keeps protocol-relative URLs unchanged', () => {
    expect(normalizeUploadsPath('//cdn.example.com/a.png')).toBe(
      '//cdn.example.com/a.png'
    );
  });

  it('normalizes uploads path variants to /uploads prefix', () => {
    expect(normalizeUploadsPath('uploads/a.png')).toBe('/uploads/a.png');
    expect(normalizeUploadsPath('/uploads/a.png')).toBe('/uploads/a.png');
    expect(normalizeUploadsPath('./uploads/a.png')).toBe('/uploads/a.png');
    expect(normalizeUploadsPath('public/uploads/a.png')).toBe('/uploads/a.png');
    expect(normalizeUploadsPath('/public/uploads/a.png')).toBe(
      '/uploads/a.png'
    );
  });

  it('keeps unmatched paths unchanged', () => {
    expect(normalizeUploadsPath('/images/a.png')).toBe('/images/a.png');
    expect(normalizeUploadsPath('foo/uploads')).toBe('foo/uploads');
  });
});
