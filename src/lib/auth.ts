import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ALGORITHM = 'aes-256-gcm';
const SESSION_PREFIX = 's:';

function getSigningKey(): Buffer {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error('ADMIN_SECRET is not configured');
  }
  // Derive a key from the secret using scrypt
  return scryptSync(secret, 'salt', 32);
}

export function createSessionToken(): string {
  const rawSession = randomBytes(32).toString('base64url');
  const key = getSigningKey();

  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(rawSession, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted (all base64)
  const session = `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;

  return SESSION_PREFIX + session;
}

export function verifySessionToken(token: string): boolean {
  if (!token.startsWith(SESSION_PREFIX)) {
    return false;
  }

  try {
    const session = token.slice(SESSION_PREFIX.length);
    const parts = session.split(':');

    if (parts.length !== 3) {
      return false;
    }

    const [ivB64, authTagB64, encrypted] = parts;
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const key = getSigningKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    // If we get here, the token is valid
    return decrypted.length > 0;
  } catch {
    return false;
  }
}

export function isAdminSessionAuthorized(
  sessionToken: string | null | undefined
): boolean {
  if (!process.env.ADMIN_SECRET || !sessionToken) {
    return false;
  }

  return verifySessionToken(sessionToken);
}

export async function requireAdminAuth(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!isAdminSessionAuthorized(sessionToken)) {
    redirect('/admin/login');
  }
}
