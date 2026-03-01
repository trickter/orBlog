import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { updateProfile } from '@/lib/actions';
import { cookies } from 'next/headers';

export default async function ProfilePage() {
  const profile = await prisma.profile.findUnique({
    where: { id: 'default' },
  });

  const defaultProfile = {
    id: 'default',
    name: 'Alex',
    bio: 'Full Stack Developer',
    avatar: '',
    github: '',
    twitter: '',
    email: '',
    aboutContent: '',
  };

  const current = profile || defaultProfile;

  async function handleSubmit(formData: FormData) {
    'use server';
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value ?? null;
    await updateProfile(formData, session);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Edit Profile
      </h1>

      <form action={handleSubmit} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            defaultValue={current.name}
            required
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Bio
          </label>
          <textarea
            name="bio"
            defaultValue={current.bio || ''}
            rows={3}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            About Page Content (Markdown)
          </label>
          <textarea
            name="aboutContent"
            defaultValue={current.aboutContent || ''}
            rows={10}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono text-sm"
            placeholder="# About\nWrite markdown content for /about page..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Avatar URL
          </label>
          <input
            type="url"
            name="avatar"
            defaultValue={current.avatar || ''}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            GitHub Username
          </label>
          <input
            type="text"
            name="github"
            defaultValue={current.github || ''}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Twitter Username
          </label>
          <input
            type="text"
            name="twitter"
            defaultValue={current.twitter || ''}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            defaultValue={current.email || ''}
            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
            placeholder="hello@example.com"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Profile
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
