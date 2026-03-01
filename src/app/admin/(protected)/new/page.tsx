import { cookies } from 'next/headers';
import { getCategories } from '@/lib/actions';
import { NewPostForm } from '@/components/NewPostForm';

export default async function NewPostPage() {
  const categories = await getCategories();
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session')?.value ?? null;

  return <NewPostForm categories={categories} session={session} />;
}
