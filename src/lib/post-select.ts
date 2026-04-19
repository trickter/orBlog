export const postWithCategorySelect = {
  id: true,
  title: true,
  slug: true,
  content: true,
  published: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
};

export const postDetailSelect = {
  ...postWithCategorySelect,
  contentHtml: true,
};

export const postDropdownSelect = {
  id: true,
  title: true,
  slug: true,
  createdAt: true,
};
