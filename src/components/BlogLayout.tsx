import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';

interface Profile {
  name: string;
  bio: string | null;
  avatar: string | null;
  github: string | null;
  twitter: string | null;
  email: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface BlogLayoutProps {
  children: React.ReactNode;
  profile: Profile;
  categories: Category[];
}

export function BlogLayout({ children, profile }: BlogLayoutProps) {
  return (
    <div className="min-h-screen">
      <TopNav />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left Sidebar */}
          <Sidebar profile={profile} />

          {/* Right Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
