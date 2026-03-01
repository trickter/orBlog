function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeImagePath(value: string): string {
  const withoutQuery = value.split('?')[0]?.split('#')[0] ?? value;
  const normalized = safeDecodeURIComponent(withoutQuery)
    .replace(/\\/g, '/')
    .replace(/^\.\/+/, '')
    .replace(/^\/+/, '');
  return normalized.trim();
}

export function imageLookupKeys(value: string): string[] {
  const normalized = normalizeImagePath(value);
  if (!normalized) {
    return [];
  }

  const lower = normalized.toLowerCase();
  const keys = new Set<string>([lower]);

  const withoutKnownPrefix = lower.replace(/^(images?|img|assets)\//, '');
  keys.add(withoutKnownPrefix);

  const basename = withoutKnownPrefix.split('/').pop();
  if (basename) {
    keys.add(basename);
  }

  return Array.from(keys);
}

export function rewriteMarkdownImageLinks(
  content: string,
  resolveImageUrl: (url: string) => string | null
): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (full, alt: string, rawTarget: string) => {
      const trimmedTarget = String(rawTarget).trim();
      const targetMatch = trimmedTarget.match(/^(\S+)(\s+["'][^"']*["'])?$/);
      const originalUrl = targetMatch ? targetMatch[1] : trimmedTarget;
      const suffix = targetMatch?.[2] ?? '';

      if (
        originalUrl.startsWith('http://') ||
        originalUrl.startsWith('https://') ||
        originalUrl.startsWith('data:') ||
        originalUrl.startsWith('blob:')
      ) {
        return full;
      }

      const nextUrl = resolveImageUrl(originalUrl);
      if (!nextUrl) {
        return full;
      }

      return `![${alt}](${nextUrl}${suffix})`;
    }
  );
}
