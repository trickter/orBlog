import { NextResponse } from "next/server";
import { getPostsPage } from "@/lib/posts-page";
import { FEED_PAGE_DEFAULT_LIMIT } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim() || undefined;
    const cursor = searchParams.get("cursor")?.trim() || undefined;
    const limitParam = Number(searchParams.get("limit") ?? `${FEED_PAGE_DEFAULT_LIMIT}`);
    const limit = Number.isFinite(limitParam) ? limitParam : FEED_PAGE_DEFAULT_LIMIT;

    const page = await getPostsPage({
      categorySlug: category,
      cursor,
      limit,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error("Failed to fetch paginated posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
