import { Prisma } from "@prisma/client";
import { postDropdownSelect, postWithCategorySelect } from "@/lib/post-select";

export type PostWithCategory = Prisma.PostGetPayload<{
  select: typeof postWithCategorySelect;
}>;

export type PostDropdownItem = Prisma.PostGetPayload<{
  select: typeof postDropdownSelect;
}>;

export interface PostCardData {
  id: string;
  title: string;
  slug: string;
  content: string;
  viewCount: number;
  createdAt: Date | string;
  category?: {
    name: string;
    slug: string;
  } | null;
}
