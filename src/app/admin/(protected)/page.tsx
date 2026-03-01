import Link from "next/link";
import { getAllPosts, deletePost } from "@/lib/actions";
import { formatDate } from "@/lib/utils";
import { cookies } from "next/headers";

export const revalidate = 0;

export default async function AdminPage() {
  const posts = await getAllPosts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          All Posts
        </h1>
        <Link
          href="/admin/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400">
          No posts yet.{" "}
          <Link href="/admin/new" className="text-blue-600 hover:underline">
            Create your first post
          </Link>
        </p>
      ) : (
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm ${
                        post.published
                          ? "text-green-600 dark:text-green-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(post.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/edit/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 mr-4"
                    >
                      Edit
                    </Link>
                    <form action={async () => {
                      "use server";
                      const cookieStore = await cookies();
                      const session = cookieStore.get("admin_session")?.value ?? null;
                      const id = post.id;
                      await deletePost(id, session);
                    }} className="inline">
                      <button
                        type="submit"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          if (!confirm("Delete this post?")) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
