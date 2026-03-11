import { render, screen } from '@testing-library/react';
import { BlogLayout } from '@/components/BlogLayout';

jest.mock('@/components/TopNav', () => ({
  TopNav: () => <div>Top Navigation</div>,
}));

jest.mock('@/components/Sidebar', () => ({
  Sidebar: () => <aside>Sidebar</aside>,
}));

describe('BlogLayout', () => {
  it('renders the ICP filing number in the footer', () => {
    render(
      <BlogLayout
        profile={{
          name: 'Test User',
          bio: null,
          avatar: null,
          github: null,
          twitter: null,
          email: null,
        }}
        categories={[]}
      >
        <div>Page Content</div>
      </BlogLayout>
    );

    const filingLink = screen.getByRole('link', {
      name: '赣ICP备2026004033号',
    });

    expect(filingLink).toHaveAttribute('href', 'https://beian.miit.gov.cn/');
    expect(filingLink).toHaveAttribute('target', '_blank');
  });
});
