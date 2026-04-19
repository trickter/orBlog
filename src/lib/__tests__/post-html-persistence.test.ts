/** @jest-environment node */

describe('post HTML persistence', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('persists compiled HTML when creating a post', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@/lib/prisma', () => ({
      getPrisma: () => ({
        post: {
          create,
          findUnique,
        },
      }),
    }));
    jest.doMock('@/lib/action-helpers', () => ({
      slugify: (value: string) => value.toLowerCase().replace(/\s+/g, '-'),
      verifyAdmin: () => true,
    }));

    const { createPost } = await import('@/lib/actions-posts');
    const { compileMarkdownToHtml } = await import('@/lib/markdown-to-html');
    const formData = new FormData();
    formData.set('title', 'Hello World');
    formData.set('content', '# Heading');
    formData.set('published', 'on');
    formData.set('zipImages', '[]');

    await createPost(formData, 'session-token');

    expect(create).toHaveBeenCalledTimes(1);
    const payload = create.mock.calls[0][0].data;
    expect(payload.content).toBe('# Heading');
    expect(compileMarkdownToHtml).toHaveBeenCalledWith('# Heading');
    expect(payload.contentHtml).toBe('<p># Heading</p>');
  });

  it('persists compiled HTML when updating a post', async () => {
    const findUnique = jest
      .fn()
      .mockResolvedValueOnce({ slug: 'hello-world', title: 'Hello World' });
    const update = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@/lib/prisma', () => ({
      getPrisma: () => ({
        post: {
          findUnique,
          update,
        },
      }),
    }));
    jest.doMock('@/lib/action-helpers', () => ({
      slugify: (value: string) => value.toLowerCase().replace(/\s+/g, '-'),
      verifyAdmin: () => true,
    }));

    const { updatePost } = await import('@/lib/actions-posts');
    const { compileMarkdownToHtml } = await import('@/lib/markdown-to-html');
    const formData = new FormData();
    formData.set('id', 'post-1');
    formData.set('title', 'Hello World');
    formData.set('content', '```js\nconsole.log(1)\n```');
    formData.set('published', 'on');

    await updatePost(formData, 'session-token');

    expect(update).toHaveBeenCalledTimes(1);
    const payload = update.mock.calls[0][0].data;
    expect(compileMarkdownToHtml).toHaveBeenCalledWith(
      '```js\nconsole.log(1)\n```'
    );
    expect(payload.contentHtml).toBe('<p>```js\nconsole.log(1)\n```</p>');
  });
});
