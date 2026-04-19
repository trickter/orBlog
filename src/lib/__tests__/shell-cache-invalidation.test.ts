/** @jest-environment node */

import { BLOG_SHELL_CACHE_TAG } from '@/lib/constants';

describe('shell cache invalidation', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('invalidates the blog shell cache after profile updates', async () => {
    const upsert = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@/lib/prisma', () => ({
      getPrisma: () => ({
        profile: {
          upsert,
        },
      }),
    }));
    jest.doMock('@/lib/action-helpers', () => ({
      verifyAdmin: () => true,
    }));

    const nextCache = await import('next/cache');
    const { updateProfile } = await import('@/lib/actions-profile');
    const formData = new FormData();
    formData.set('name', 'Alex');
    formData.set('bio', 'Builder');

    await updateProfile(formData, 'session-token');

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(BLOG_SHELL_CACHE_TAG);
  });

  it('invalidates the blog shell cache after category creation', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const create = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@/lib/prisma', () => ({
      getPrisma: () => ({
        category: {
          findUnique,
          create,
        },
      }),
    }));
    jest.doMock('@/lib/action-helpers', () => ({
      slugify: (value: string) => value.toLowerCase(),
      verifyAdmin: () => true,
    }));

    const nextCache = await import('next/cache');
    const { createCategory } = await import('@/lib/actions-categories');
    const formData = new FormData();
    formData.set('name', 'Infra');

    await createCategory(formData, 'session-token');

    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledTimes(1);
    expect(nextCache.revalidateTag).toHaveBeenCalledWith(BLOG_SHELL_CACHE_TAG);
  });
});
