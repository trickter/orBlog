import { cookies } from 'next/headers';
import { getCategories } from '@/lib/actions';
import { NewPostForm } from '@/components/NewPostForm';
import { requireAdminAuth } from '@/lib/auth';

export default async function NewPostPage() {
  await requireAdminAuth();

  const categories = await getCategories();
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value ?? null;

  return <NewPostForm categories={categories} session={session} />;
}
