import { render, screen } from '@testing-library/react';
import { InfinitePostList } from '@/components/InfinitePostList';

jest.mock('@/components/PostCard', () => ({
  PostCard: ({ post }: { post: { title: string } }) => <article>{post.title}</article>,
}));

class MockIntersectionObserver {
  observe() {}

  disconnect() {}
}

describe('InfinitePostList', () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it('resets list when category changes', () => {
    const allPosts = [
      {
        id: 'post-1',
        title: 'General Post',
        slug: 'general-post',
        content: 'content',
        createdAt: new Date('2026-03-01T00:00:00Z'),
        updatedAt: new Date('2026-03-01T00:00:00Z'),
        viewCount: 0,
        category: null,
      },
    ];

    const openclawPosts = [
      {
        id: 'post-2',
        title: 'OpenClaw Post',
        slug: 'openclaw-post',
        content: 'content',
        createdAt: new Date('2026-03-02T00:00:00Z'),
        updatedAt: new Date('2026-03-02T00:00:00Z'),
        viewCount: 0,
        category: {
          id: 'cat-1',
          name: 'openclaw',
          slug: 'openclaw',
        },
      },
    ];

    const { rerender } = render(
      <InfinitePostList
        initialPosts={allPosts}
        initialCursor={null}
        initialHasMore={false}
      />
    );

    expect(screen.getByText('General Post')).toBeInTheDocument();

    rerender(
      <InfinitePostList
        initialPosts={openclawPosts}
        initialCursor={null}
        initialHasMore={false}
        category="openclaw"
      />
    );

    expect(screen.getByText('OpenClaw Post')).toBeInTheDocument();
    expect(screen.queryByText('General Post')).not.toBeInTheDocument();
  });
});
