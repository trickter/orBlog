import Link from 'next/link';
import { createCategory } from '@/lib/actions';
import { cookies } from 'next/headers';
import { requireAdminAuth } from '@/lib/auth';

export default async function NewCategoryPage() {
  await requireAdminAuth();

  async function handleSubmit(formData: FormData) {
    'use server';
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value ?? null;
    await createCategory(formData, session);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        New Category
      </h1>

      <form action={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="Category name"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Category
          </button>
          <Link
            href="/admin/categories"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
