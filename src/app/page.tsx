import Link from "next/link";
import { getPosts } from "@/lib/actions";
import { BlogLayout } from "@/components/BlogLayout";
import { PostCard } from "@/components/PostCard";

export const revalidate = 0;

export default async function Home() {
  const posts = await getPosts();

  return (
    <BlogLayout>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts yet.{" "}
            <Link href="/admin" className="text-blue-600 hover:underline">
              Create your first post
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </BlogLayout>
  );
}
