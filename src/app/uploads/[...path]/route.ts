import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';
import { detectContentTypeByExtension } from '@/lib/mime-types';

export const dynamic = 'force-dynamic';
const SAFE_REDIRECT_QUERY_PARAMS = new Set(['v', 't']);

function sanitizePath(segments: string[]): string[] {
  return segments
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return '';
      }
    })
    .filter((segment) => {
      return (
        segment &&
        segment !== '.' &&
        segment !== '..' &&
        !segment.includes('\\') &&
        !segment.includes('/')
      );
    });
}

function getStaticBaseUrl(): URL | null {
  const value = process.env.STATIC_BASE_URL?.trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed;
  } catch {
    return null;
  }
}

function getStaticAllowedHosts(): Set<string> {
  const raw = process.env.STATIC_BASE_ALLOWED_HOSTS;
  if (!raw) {
    return new Set();
  }

  return new Set(
    raw
      .split(',')
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean)
  );
}

function buildStaticRedirectUrl(requestUrl: string): string | null {
  const staticBaseUrl = getStaticBaseUrl();
  if (!staticBaseUrl) {
    return null;
  }

  const allowedHosts = getStaticAllowedHosts();
  if (!allowedHosts.has(staticBaseUrl.hostname.toLowerCase())) {
    return null;
  }

  const source = new URL(requestUrl);
  const basePath = staticBaseUrl.pathname === '/' ? '' : staticBaseUrl.pathname;
  const safeSearchParams = new URLSearchParams();
  for (const key of SAFE_REDIRECT_QUERY_PARAMS) {
    for (const value of source.searchParams.getAll(key)) {
      safeSearchParams.append(key, value);
    }
  }
  const safeSearch = safeSearchParams.toString();
  return `${staticBaseUrl.origin}${basePath}${source.pathname}${safeSearch ? `?${safeSearch}` : ''}`;
}

function isMissingFileError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = (error as { code?: unknown }).code;
  if (typeof code !== 'string') {
    return false;
  }
  return code === 'ENOENT' || code === 'ENOTDIR';
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleUploadsGet(request, context);
}

export async function handleUploadsGet(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
  readFile: (filePath: string) => Promise<Buffer> = fs.readFile
) {
  const { path: rawPath = [] } = await context.params;
  const safeSegments = sanitizePath(rawPath);

  if (safeSegments.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const filePath = path.join(
    process.cwd(),
    'public',
    'uploads',
    ...safeSegments
  );

  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = detectContentTypeByExtension(ext);
    const body = new Uint8Array(
      data.buffer as ArrayBuffer,
      data.byteOffset,
      data.byteLength
    );

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    if (isMissingFileError(error)) {
      const redirectTarget = buildStaticRedirectUrl(request.url);
      if (redirectTarget) {
        return NextResponse.redirect(redirectTarget, {
          status: 307,
          headers: {
            'Cache-Control':
              'public, max-age=3600, stale-while-revalidate=86400',
          },
        });
      }

      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    console.error('Failed to read uploads file', {
      filePath,
      error,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
