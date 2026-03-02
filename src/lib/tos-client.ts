import { getStorageFromEnv } from '@/lib/storage';
import * as fs from 'fs/promises';
import path from 'path';

interface UploadToTosParams {
  key: string;
  body: Buffer;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export async function uploadToTos({
  key,
  body,
  contentType,
  cacheControl,
  metadata,
}: UploadToTosParams): Promise<void> {
  try {
    const storage = getStorageFromEnv();
    await storage.putObject({
      key,
      body,
      contentType,
      cacheControl,
      metadata,
    });
    return;
  } catch (error) {
    // Local development fallback: if storage is not configured yet, keep
    // ZIP publishing functional by writing to /public/uploads.
    if (!isStorageConfigError(error)) {
      throw error;
    }
  }

  const localPath = resolveLocalUploadPath(key);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, body);
}

export function getTosBucket(): string {
  const bucket =
    process.env.STORAGE_BUCKET?.trim() || process.env.TOS_BUCKET?.trim();

  if (!bucket) {
    throw new Error(
      '[storage] Missing STORAGE_BUCKET (or legacy TOS_BUCKET) environment variable.'
    );
  }

  return bucket;
}

function isStorageConfigError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes('[storage] Missing STORAGE_PROVIDER') ||
    error.message.includes('[storage] Missing required environment variable:')
  );
}

function resolveLocalUploadPath(key: string): string {
  const normalized = key.replace(/^\/+/, '');
  const segments = normalized.split('/').filter(Boolean);
  if (
    segments.length === 0 ||
    segments.some((segment) => segment === '.' || segment === '..')
  ) {
    throw new Error('Invalid upload key.');
  }

  return path.join(process.cwd(), 'public', ...segments);
}
