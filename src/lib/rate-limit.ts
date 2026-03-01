// Simple in-memory rate limiter
// For production, use Redis or similar
import {
  LOGIN_RATE_LIMIT_CLEANUP_INTERVAL,
  LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
  LOGIN_RATE_LIMIT_MAX_KEYS,
  LOGIN_RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let operationCount = 0;

function pruneExpiredEntries(now: number): void {
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetTime <= now) {
      rateLimitStore.delete(key);
    }
  }
}

function enforceStoreSize(now: number): void {
  if (rateLimitStore.size <= LOGIN_RATE_LIMIT_MAX_KEYS) {
    return;
  }

  pruneExpiredEntries(now);
  if (rateLimitStore.size <= LOGIN_RATE_LIMIT_MAX_KEYS) {
    return;
  }

  const excess = rateLimitStore.size - LOGIN_RATE_LIMIT_MAX_KEYS;
  let removed = 0;
  for (const key of rateLimitStore.keys()) {
    rateLimitStore.delete(key);
    removed += 1;
    if (removed >= excess) {
      break;
    }
  }
}

export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  operationCount += 1;
  if (operationCount % LOGIN_RATE_LIMIT_CLEANUP_INTERVAL === 0) {
    pruneExpiredEntries(now);
  }

  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + LOGIN_RATE_LIMIT_WINDOW_MS,
    });
    enforceStoreSize(now);
    return { allowed: true, remaining: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (entry.count >= LOGIN_RATE_LIMIT_MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  enforceStoreSize(now);
  return {
    allowed: true,
    remaining: LOGIN_RATE_LIMIT_MAX_ATTEMPTS - entry.count,
  };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function __unsafeClearRateLimitStore(): void {
  rateLimitStore.clear();
  operationCount = 0;
}

export function __unsafeSetRateLimitEntry(
  key: string,
  entry: RateLimitEntry
): void {
  rateLimitStore.set(key, entry);
}

export function __unsafeGetRateLimitStoreSize(): number {
  return rateLimitStore.size;
}
