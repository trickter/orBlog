/** @jest-environment node */
import { detectContentTypeByExtension } from '@/lib/mime-types';

const originalStaticBaseUrl = process.env.STATIC_BASE_URL;
const originalStaticAllowedHosts = process.env.STATIC_BASE_ALLOWED_HOSTS;
type UploadsRouteModule = typeof import('@/app/uploads/[...path]/route');

async function loadUploadsRoute(): Promise<UploadsRouteModule> {
  return import('@/app/uploads/[...path]/route');
}

describe('uploads route', () => {
  let readFile: jest.Mock<Promise<Buffer>, [string]>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    readFile = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.STATIC_BASE_URL;
    delete process.env.STATIC_BASE_ALLOWED_HOSTS;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  afterAll(() => {
    if (originalStaticBaseUrl === undefined) {
      delete process.env.STATIC_BASE_URL;
    } else {
      process.env.STATIC_BASE_URL = originalStaticBaseUrl;
    }

    if (originalStaticAllowedHosts === undefined) {
      delete process.env.STATIC_BASE_ALLOWED_HOSTS;
    } else {
      process.env.STATIC_BASE_ALLOWED_HOSTS = originalStaticAllowedHosts;
    }
  });

  it('returns 404 when path is empty', async () => {
    const uploadsRoute = await loadUploadsRoute();
    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads'),
      {
        params: Promise.resolve({ path: [] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
  });

  it('serves local file when present', async () => {
    const uploadsRoute = await loadUploadsRoute();
    const fileData = Buffer.from('png-data');
    readFile.mockResolvedValue(fileData);
    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
    expect(Buffer.from(await response.arrayBuffer())).toEqual(fileData);
    expect(readFile).toHaveBeenCalledWith(
      expect.stringContaining('public/uploads/posts/photo.png')
    );
  });

  it('prefers local file even when STATIC_BASE_URL is configured', async () => {
    const uploadsRoute = await loadUploadsRoute();
    process.env.STATIC_BASE_URL = 'https://static.example.com/';
    readFile.mockResolvedValue(Buffer.from('png-data'));

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('sanitizes unsafe path segments', async () => {
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockResolvedValue(Buffer.from('jpg-data'));
    await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/../posts/photo.jpg'),
      {
        params: Promise.resolve({ path: ['..', 'posts', 'photo.jpg'] }),
      },
      readFile
    );

    expect(readFile).toHaveBeenCalledWith(
      expect.stringContaining('public/uploads/posts/photo.jpg')
    );
  });

  it('returns 404 when sanitized path becomes empty', async () => {
    const uploadsRoute = await loadUploadsRoute();
    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/../.'),
      {
        params: Promise.resolve({ path: ['..', '.'] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('blocks url-encoded traversal segments', async () => {
    const uploadsRoute = await loadUploadsRoute();

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/%2E%2E/%2e%2e'),
      {
        params: Promise.resolve({ path: ['%2E%2E', '%2e%2e'] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('redirects to static base url when local file is missing', async () => {
    process.env.STATIC_BASE_URL = 'https://static.example.com/static/';
    process.env.STATIC_BASE_ALLOWED_HOSTS = 'static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request(
        'http://localhost/uploads/posts/photo.png?v=1&t=thumb&utm_source=ad'
      ),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://static.example.com/static/uploads/posts/photo.png?v=1&t=thumb'
    );
    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=3600, stale-while-revalidate=86400'
    );
  });

  it('trims static base url and keeps legacy uploads path on redirect', async () => {
    process.env.STATIC_BASE_URL = ' https://cdn.example.com/cdn/// ';
    process.env.STATIC_BASE_ALLOWED_HOSTS =
      'cdn.example.com, static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOTDIR' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/photo.png'),
      {
        params: Promise.resolve({ path: ['photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://cdn.example.com/cdn/uploads/photo.png'
    );
  });

  it('does not redirect for non-missing file errors', async () => {
    process.env.STATIC_BASE_URL = 'https://static.example.com/';
    process.env.STATIC_BASE_ALLOWED_HOSTS = 'static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(new Error('boom'));

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(500);
    expect(response.headers.get('location')).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to read uploads file',
      expect.objectContaining({
        filePath: expect.stringContaining('public/uploads/posts/photo.png'),
      })
    );
  });

  it('drops non-whitelisted query params on static redirect', async () => {
    process.env.STATIC_BASE_URL = 'https://static.example.com/';
    process.env.STATIC_BASE_ALLOWED_HOSTS = 'static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request(
        'http://localhost/uploads/posts/photo.png?x=1&utm_campaign=test'
      ),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://static.example.com/uploads/posts/photo.png'
    );
  });

  it('does not redirect when STATIC_BASE_URL is invalid', async () => {
    process.env.STATIC_BASE_URL = 'not-a-valid-url';
    process.env.STATIC_BASE_ALLOWED_HOSTS = 'static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('location')).toBeNull();
  });

  it('does not redirect when static host is not allowlisted', async () => {
    process.env.STATIC_BASE_URL = 'https://blocked.example.com/';
    process.env.STATIC_BASE_ALLOWED_HOSTS = 'static.example.com';
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
    expect(response.headers.get('location')).toBeNull();
  });

  it('returns 404 when local file is missing and static base url is not configured', async () => {
    const uploadsRoute = await loadUploadsRoute();
    readFile.mockRejectedValue(
      Object.assign(new Error('not found'), { code: 'ENOENT' })
    );

    const response = await uploadsRoute.handleUploadsGet(
      new Request('http://localhost/uploads/posts/photo.png'),
      {
        params: Promise.resolve({ path: ['posts', 'photo.png'] }),
      },
      readFile
    );

    expect(response.status).toBe(404);
  });
});

describe('detectContentTypeByExtension', () => {
  it('returns common text and app mime types', () => {
    expect(detectContentTypeByExtension('.json')).toBe(
      'application/json; charset=utf-8'
    );
    expect(detectContentTypeByExtension('.css')).toBe(
      'text/css; charset=utf-8'
    );
    expect(detectContentTypeByExtension('.txt')).toBe(
      'text/plain; charset=utf-8'
    );
  });

  it('returns common media mime types', () => {
    expect(detectContentTypeByExtension('.mp4')).toBe('video/mp4');
    expect(detectContentTypeByExtension('.mp3')).toBe('audio/mpeg');
    expect(detectContentTypeByExtension('.avif')).toBe('image/avif');
  });
});
