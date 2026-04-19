/** @jest-environment node */

import type { ReactNode } from 'react';

describe('post page static params', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('generates static params from published post slugs', async () => {
    const getPublishedPostSlugs = jest
      .fn()
      .mockResolvedValue([{ slug: 'vpn' }, { slug: 'edge-cache' }]);

    jest.doMock('@/lib/actions', () => ({
      getPostBySlug: jest.fn(),
      getPublishedPostSlugs,
    }));
    jest.doMock('@/lib/blog-shell', () => ({
      loadBlogShellData: jest.fn(),
    }));
    jest.doMock('@/components/BlogLayout', () => ({
      BlogLayout: ({ children }: { children: ReactNode }) => children,
    }));
    jest.doMock('@/components/ViewCounter', () => ({
      ViewCounter: () => null,
    }));

    const { generateStaticParams } = await import('@/app/posts/[slug]/page');

    await expect(generateStaticParams()).resolves.toEqual([
      { slug: 'vpn' },
      { slug: 'edge-cache' },
    ]);
    expect(getPublishedPostSlugs).toHaveBeenCalledTimes(1);
  });
});
