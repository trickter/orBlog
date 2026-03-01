import { formatDate, extractExcerpt, cn } from '@/lib/utils';

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-01-15');
    expect(result).toBe('January 15, 2024');
  });

  it('handles Date object', () => {
    const date = new Date('2024-06-20');
    const result = formatDate(date);
    expect(result).toBe('June 20, 2024');
  });

  it('handles ISO string', () => {
    const result = formatDate('2024-12-25T10:30:00Z');
    expect(result).toContain('2024');
  });
});

describe('extractExcerpt', () => {
  it('removes markdown headers', () => {
    const content = '# Hello World\nSome content';
    expect(extractExcerpt(content)).toBe('Hello World Some content');
  });

  it('removes bold and italic', () => {
    const content = 'This is **bold** and *italic* text';
    expect(extractExcerpt(content)).toBe('This is bold and italic text');
  });

  it('removes inline code', () => {
    const content = 'Text with `code` here';
    expect(extractExcerpt(content)).toBe('Text with  here');
  });

  it('removes links but keeps text', () => {
    const content = 'Check out [this link](https://example.com) please';
    expect(extractExcerpt(content)).toBe('Check out this link please');
  });

  it('truncates long content', () => {
    const content = 'a'.repeat(300);
    const result = extractExcerpt(content, 200);
    expect(result.length).toBeLessThanOrEqual(203); // 200 + "..."
  });

  it('does not truncate short content', () => {
    const content = 'short content';
    expect(extractExcerpt(content, 200)).toBe('short content');
  });

  it('handles empty string', () => {
    expect(extractExcerpt('')).toBe('');
  });
});

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const condition = true;
    expect(cn('foo', condition && 'bar')).toBe('foo bar');
    expect(cn('foo', false && 'bar')).toBe('foo');
  });

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn('foo', undefined, null, '')).toBe('foo');
  });
});
