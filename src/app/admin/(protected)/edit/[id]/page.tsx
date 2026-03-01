import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updatePost, getCategories } from '@/lib/actions';
import { cookies } from 'next/headers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
  });
  const categories = await getCategories();

  if (!post) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    'use server';
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value ?? null;
    await updatePost(formData, session);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Edit Post
      </h1>

      <form action={handleSubmit} className="max-w-2xl">
        <input type="hidden" name="id" value={post.id} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            defaultValue={post.title}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Category
          </label>
          <select
            name="categoryId"
            defaultValue={post.categoryId || ''}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Content (Markdown)
          </label>
          <textarea
            name="content"
            defaultValue={post.content}
            required
            rows={15}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              name="published"
              defaultChecked={post.published}
              className="mr-2"
            />
            Published
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
          <a
            href="/admin"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
