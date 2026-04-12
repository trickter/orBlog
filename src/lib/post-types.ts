interface PostCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PostWithCategory {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  category: PostCategory | null;
}

export interface PostDropdownItem {
  id: string;
  title: string;
  slug: string;
  createdAt: Date;
}

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
