import Link from "next/link";
import { getPosts, getProfile, getCategories } from "@/lib/actions";
import { BlogLayout } from "@/components/BlogLayout";
import { PostCard } from "@/components/PostCard";
import { CategoryFilter } from "@/components/CategoryFilter";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const [posts, profile, categories] = await Promise.all([
    getPosts(category),
    getProfile(),
    getCategories(),
  ]);

  return (
    <BlogLayout profile={profile} categories={categories}>
      {categories.length > 0 && (
        <CategoryFilter categories={categories} />
      )}

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
