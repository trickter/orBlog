'use server';

import { getPrisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/action-helpers';

export async function getProfile() {
  const profile = await getPrisma().profile.findUnique({
    where: { id: 'default' },
  });

  if (!profile) {
    return {
      id: 'default',
      name: 'Alex',
      bio: 'Full Stack Developer',
      avatar: null,
      github: null,
      twitter: null,
      email: null,
      aboutContent: null,
    };
  }

  return profile;
}

export async function updateProfile(
  formData: FormData,
  adminSecret: string | null
) {
  if (!verifyAdmin(adminSecret)) {
    throw new Error('Unauthorized');
  }

  const name = String(formData.get('name') ?? '').trim();
  const bio = String(formData.get('bio') ?? '').trim() || null;
  const avatar = String(formData.get('avatar') ?? '').trim() || null;
  const github = String(formData.get('github') ?? '').trim() || null;
  const twitter = String(formData.get('twitter') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const aboutContent =
    String(formData.get('aboutContent') ?? '').trim() || null;

  if (!name) {
    throw new Error('Name is required');
  }

  await getPrisma().profile.upsert({
    where: { id: 'default' },
    update: { name, bio, avatar, github, twitter, email, aboutContent },
    create: {
      id: 'default',
      name,
      bio,
      avatar,
      github,
      twitter,
      email,
      aboutContent,
    },
  });

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/admin');
}
