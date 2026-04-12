import { isAdminSessionAuthorized } from '@/lib/auth';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

export function verifyAdmin(session: string | null): boolean {
  return isAdminSessionAuthorized(session);
}
