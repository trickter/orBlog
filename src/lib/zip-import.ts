import JSZip from 'jszip';

export interface ZipImage {
  name: string;
  data: string; // base64 encoded
  mimeType: string;
}

export interface ZipImportResult {
  title: string;
  content: string;
  images: ZipImage[];
}

export async function extractZipFile(file: File): Promise<ZipImportResult> {
  const zip = await JSZip.loadAsync(file);

  // Find .md file (case insensitive)
  const mdFileKey = Object.keys(zip.files).find((f) =>
    f.toLowerCase().endsWith('.md')
  );

  if (!mdFileKey) {
    throw new Error('No markdown file found in zip');
  }

  // Extract content
  const content = await zip.file(mdFileKey)!.async('string');

  // Extract title from first heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

  // Find images from images/ or image/ directory (supports Windows backslashes)
  const images: ZipImage[] = [];
  const imageDirs = new Set(['images', 'image', 'img', 'assets']);

  for (const zipPath of Object.keys(zip.files)) {
    const entry = zip.files[zipPath];
    if (!entry || entry.dir) {
      continue;
    }

    const normalizedPath = zipPath.replace(/\\/g, '/');
    const parts = normalizedPath.split('/').filter(Boolean);
    const dirIndex = parts.findIndex((part) =>
      imageDirs.has(part.toLowerCase())
    );

    if (dirIndex === -1) {
      continue;
    }

    const relativeName = parts.slice(dirIndex + 1).join('/');
    if (!relativeName) {
      continue;
    }

    const blob = await entry.async('blob');
    const mimeType = getMimeType(relativeName);
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    images.push({ name: relativeName, data: base64, mimeType });
  }

  return { title, content, images };
}

function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    bmp: 'image/bmp',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
