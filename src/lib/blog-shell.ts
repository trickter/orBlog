import { getCategories, getProfile } from '@/lib/actions';

export async function loadBlogShellData() {
  const [profile, categories] = await Promise.all([
    getProfile(),
    getCategories(),
  ]);

  return {
    profile,
    categories,
  };
}
