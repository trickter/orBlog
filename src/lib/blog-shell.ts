import { unstable_cache } from 'next/cache';
import { getCategories, getProfile } from '@/lib/actions';
import {
  BLOG_SHELL_CACHE_TAG,
  BLOG_SHELL_REVALIDATE_SECONDS,
} from '@/lib/constants';

async function fetchBlogShellData() {
  const [profile, categories] = await Promise.all([
    getProfile(),
    getCategories(),
  ]);

  return {
    profile,
    categories,
  };
}

export const loadBlogShellData = unstable_cache(
  fetchBlogShellData,
  ['blog-shell'],
  {
    tags: [BLOG_SHELL_CACHE_TAG],
    revalidate: BLOG_SHELL_REVALIDATE_SECONDS,
  }
);
