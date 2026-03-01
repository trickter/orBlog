export function getClientRateLimitKey(headers: Headers): string {
  const xRealIp = headers.get('x-real-ip')?.trim();
  if (xRealIp) {
    return xRealIp;
  }

  const forwarded = headers.get('x-forwarded-for');
  if (!forwarded) {
    return 'unknown';
  }

  const parts = forwarded
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return parts[parts.length - 1] ?? 'unknown';
}
