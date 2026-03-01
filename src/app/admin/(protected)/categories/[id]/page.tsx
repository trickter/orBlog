import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "@/lib/actions";
import { cookies } from "next/headers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    notFound();
  }

  async function handleSubmit(formData: FormData) {
    "use server";
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value ?? null;
    await updateCategory(formData, session);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Edit Category
      </h1>

      <form action={handleSubmit} className="max-w-md">
        <input type="hidden" name="id" value={category.id} />

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={category.name}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="Category name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={category.slug}
            disabled
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Slug is auto-generated from name
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
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
