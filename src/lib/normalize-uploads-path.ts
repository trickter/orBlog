const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const UPLOADS_PATH_RE = /^(?:\.\/)*\/?(?:public\/)?uploads\/(.+)$/i;

export function normalizeUploadsPath(url: string): string {
  if (ABSOLUTE_URL_RE.test(url) || url.startsWith('//')) {
    return url;
  }

  const match = url.match(UPLOADS_PATH_RE);
  if (!match) {
    return url;
  }

  return `/uploads/${match[1]}`;
}
