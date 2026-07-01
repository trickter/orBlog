const headingTokens = [
  { type: 'heading', depth: 1, text: '总览', tokens: [{ text: '总览' }] },
  { type: 'paragraph', text: '正文' },
  {
    type: 'heading',
    depth: 2,
    text: '推理流程',
    tokens: [{ text: '推理流程' }],
  },
  {
    type: 'heading',
    depth: 3,
    text: 'KV Cache',
    tokens: [{ text: 'KV Cache' }],
  },
  {
    type: 'heading',
    depth: 2,
    text: '推理流程',
    tokens: [{ text: '推理流程' }],
  },
];

jest.mock('marked', () => {
  class Renderer {
    parser = {
      parseInline: (tokens: Array<{ text: string }>) =>
        tokens.map((token) => token.text).join(''),
    };
  }

  return {
    marked: {
      lexer: jest.fn(() => headingTokens),
      parse: jest.fn((_content, options) =>
        headingTokens
          .filter((token) => token.type === 'heading')
          .map((token) => options.renderer.heading(token))
          .join('\n')
      ),
      Renderer,
    },
  };
});

describe('markdown headings', () => {
  it('extracts heading text, levels, and stable ids', async () => {
    const { extractTableOfContents } = await import('@/lib/markdown-headings');

    expect(extractTableOfContents('content')).toEqual([
      { id: '总览', text: '总览', level: 1 },
      { id: '推理流程', text: '推理流程', level: 2 },
      { id: 'kv-cache', text: 'KV Cache', level: 3 },
      { id: '推理流程-2', text: '推理流程', level: 2 },
    ]);
  });

  it('uses the same heading ids when compiling markdown', async () => {
    jest.unmock('@/lib/markdown-to-html');

    const { extractTableOfContents } = await import('@/lib/markdown-headings');
    const { compileMarkdownToHtml } = await import('@/lib/markdown-to-html');
    const ids = extractTableOfContents('content').map((item) => item.id);
    const html = compileMarkdownToHtml('content');

    expect(ids).toEqual(['总览', '推理流程', 'kv-cache', '推理流程-2']);
    expect(html).toContain('<h1 id="总览">总览</h1>');
    expect(html).toContain('<h2 id="推理流程">推理流程</h2>');
    expect(html).toContain('<h3 id="kv-cache">KV Cache</h3>');
    expect(html).toContain('<h2 id="推理流程-2">推理流程</h2>');
  });

  it('falls back when heading text cannot produce a slug', async () => {
    const { createHeadingIdGenerator } =
      await import('@/lib/markdown-headings');
    const createId = createHeadingIdGenerator();

    expect(createId('!!!')).toBe('section');
    expect(createId('!!!')).toBe('section-2');
  });
});
