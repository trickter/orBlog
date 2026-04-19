const SAFE_PROTOCOLS = new Set([
  'http:',
  'https:',
  'mailto:',
  'irc:',
  'ircs:',
  'xmpp:',
]);

function hasExplicitProtocol(url: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}

export function sanitizeMarkdownUrl(url: string, key: 'href' | 'src') {
  if (
    key === 'src' &&
    (url.startsWith('data:image/') || url.startsWith('blob:'))
  ) {
    return url;
  }

  if (!hasExplicitProtocol(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.has(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
}
