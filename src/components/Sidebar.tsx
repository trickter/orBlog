import { Github, Twitter, Mail } from 'lucide-react';

interface Profile {
  name: string;
  bio: string | null;
  avatar: string | null;
  github: string | null;
  twitter: string | null;
  email: string | null;
}

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <aside className="w-full lg:w-56 lg:flex-shrink-0">
      <div className="sticky top-20 rounded-2xl p-6">
        <div className="flex flex-col items-center text-center">
          {/* Avatar */}
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="avatar-float mb-4 h-24 w-24 rounded-[1.25rem] object-cover"
            />
          ) : (
            <div className="avatar-float relative mb-4 flex h-24 w-24 items-center justify-center rounded-[1.25rem] bg-zinc-200/80 dark:bg-zinc-800/80">
              <span className="text-3xl font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
                {initial}
              </span>
              <span className="absolute inset-2 rounded-2xl border border-zinc-300/70 dark:border-zinc-600/70" />
            </div>
          )}

          {/* Name */}
          <h2 className="mb-1 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {profile.name}
          </h2>

          {/* Bio */}
          {profile.bio && (
            <p className="mb-4 text-sm leading-7 text-zinc-600 dark:text-zinc-400">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="flex gap-4">
            {profile.github && (
              <a
                href={`https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {profile.twitter && (
              <a
                href={`https://twitter.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {profile.email && (
              <a
                href={`mailto:${profile.email}`}
                className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-200/70 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
