import Link from 'next/link';
import { getPrisma } from '@/lib/prisma';
import { DeleteButton } from '@/components/DeleteCategoryButton';
import { requireAdminAuth } from '@/lib/auth';

export default async function CategoriesPage() {
  await requireAdminAuth();

  const categories = await getPrisma().category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Categories
        </h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          New Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No categories yet. Create your first category.
        </p>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
            <thead className="bg-zinc-50 dark:bg-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Posts
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {categories.map(
                (category: {
                  id: string;
                  name: string;
                  slug: string;
                  _count: { posts: number };
                }) => (
                  <tr key={category.id}>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
                      {category.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {category.slug}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {category._count.posts}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="flex gap-2 justify-end">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={category.id} />
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
