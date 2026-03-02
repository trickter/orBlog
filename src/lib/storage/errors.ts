import type { StorageProvider } from '@/lib/storage/types';

export interface StorageErrorOptions {
  code: string;
  message: string;
  provider: StorageProvider;
  requestId?: string;
  cause?: unknown;
}

export class StorageError extends Error {
  readonly code: string;
  readonly provider: StorageProvider;
  readonly requestId?: string;

  constructor(options: StorageErrorOptions) {
    super(options.message);
    this.name = 'StorageError';
    this.code = options.code;
    this.provider = options.provider;
    this.requestId = options.requestId;

    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function extractErrorDetails(error: unknown): {
  message: string;
  code?: string;
  requestId?: string;
} {
  if (!(error instanceof Error)) {
    return { message: 'Unknown storage error' };
  }

  const maybe = error as Error & {
    code?: unknown;
    name?: unknown;
    requestId?: unknown;
    $metadata?: { requestId?: unknown };
  };

  const message = error.message || 'Storage request failed';
  const code =
    typeof maybe.code === 'string'
      ? maybe.code
      : typeof maybe.name === 'string'
        ? maybe.name
        : undefined;

  const requestId =
    typeof maybe.requestId === 'string'
      ? maybe.requestId
      : typeof maybe.$metadata?.requestId === 'string'
        ? maybe.$metadata.requestId
        : undefined;

  return { message, code, requestId };
}

export function normalizeCdnDomain(raw?: string): string | null {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, '');
  }

  return `https://${trimmed}`.replace(/\/+$/, '');
}

export function buildPublicUrl(cdnDomain: string | null, key: string): string {
  if (!cdnDomain) {
    throw new Error('CDN domain is not configured.');
  }

  const encodedKey = key
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${cdnDomain}/${encodedKey}`;
}

export function sizeOfBody(body: Buffer | Uint8Array | string): number {
  if (typeof body === 'string') {
    return Buffer.byteLength(body);
  }

  return body.byteLength;
}
