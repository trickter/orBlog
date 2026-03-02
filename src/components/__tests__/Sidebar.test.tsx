import { render, screen } from '@testing-library/react';
import { Sidebar } from '@/components/Sidebar';

describe('Sidebar', () => {
  it('does not throw when profile.name is null-like at runtime', () => {
    const invalidProfile = {
      name: null,
      bio: null,
      avatar: null,
      github: null,
      twitter: null,
      email: null,
    } as unknown as Parameters<typeof Sidebar>[0]['profile'];

    render(<Sidebar profile={invalidProfile} />);

    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
