/** @jest-environment node */

import {
  BLOG_SHELL_CACHE_TAG,
  BLOG_SHELL_REVALIDATE_SECONDS,
} from '@/lib/constants';

describe('loadBlogShellData', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('wraps the shell loader in a tagged ISR cache', async () => {
    const getProfile = jest.fn().mockResolvedValue({ id: 'default' });
    const getCategories = jest.fn().mockResolvedValue([{ id: 'cat-1' }]);

    jest.doMock('@/lib/actions', () => ({
      getProfile,
      getCategories,
    }));

    const nextCache = await import('next/cache');
    const { loadBlogShellData } = await import('@/lib/blog-shell');

    expect(nextCache.unstable_cache).toHaveBeenCalledWith(
      expect.any(Function),
      ['blog-shell'],
      {
        tags: [BLOG_SHELL_CACHE_TAG],
        revalidate: BLOG_SHELL_REVALIDATE_SECONDS,
      }
    );

    await expect(loadBlogShellData()).resolves.toEqual({
      profile: { id: 'default' },
      categories: [{ id: 'cat-1' }],
    });
    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(getCategories).toHaveBeenCalledTimes(1);
  });
});
