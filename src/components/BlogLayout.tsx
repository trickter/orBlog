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
    <div className="min-h-screen bg-white dark:bg-zinc-900 flex flex-col">
      <TopNav />
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <Sidebar profile={profile} />

          {/* Right Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <a
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            赣ICP备2026004033号
          </a>
        </div>
      </footer>
    </div>
  );
}
