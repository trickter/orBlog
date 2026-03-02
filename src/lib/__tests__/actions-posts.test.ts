import { applyZipImagesIfPresent, processZipImages } from '@/lib/actions-posts';
import { uploadToTos } from '@/lib/tos-client';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/tos-client', () => ({
  uploadToTos: jest.fn(),
}));

describe('applyZipImagesIfPresent', () => {
  it('returns original content when zip payload is empty', async () => {
    const result = await applyZipImagesIfPresent('hello', '[]', 'slug');
    expect(result).toBe('hello');
  });

  it('throws friendly error for invalid JSON payload', async () => {
    await expect(
      applyZipImagesIfPresent('hello', '{bad-json', 'slug')
    ).rejects.toThrow('ZIP images metadata is invalid.');
  });

  it('throws friendly error when processor fails', async () => {
    const payload = JSON.stringify([{ name: 'a.png', data: 'abcd' }]);
    const processor = jest.fn(async () => {
      throw new Error('disk full');
    });

    await expect(
      applyZipImagesIfPresent('hello', payload, 'slug', processor)
    ).rejects.toThrow(
      'ZIP images processing failed. Please verify ZIP content and retry.'
    );
  });

  it('returns processed content when processor succeeds', async () => {
    const payload = JSON.stringify([{ name: 'a.png', data: 'abcd' }]);
    const processor = jest.fn(async () => 'updated-content');
    const result = await applyZipImagesIfPresent(
      'hello',
      payload,
      'slug',
      processor
    );

    expect(result).toBe('updated-content');
    expect(processor).toHaveBeenCalledTimes(1);
  });
});

describe('processZipImages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads zip images to TOS and rewrites markdown links', async () => {
    (uploadToTos as jest.Mock).mockResolvedValue(undefined);
    const content = '![cover](images/cover.png)';
    const images = [
      { name: 'images/cover.png', data: Buffer.from('img').toString('base64') },
    ];

    const result = await processZipImages(content, images, 'my-post');

    expect(uploadToTos).toHaveBeenCalledTimes(1);
    const uploadCall = (uploadToTos as jest.Mock).mock.calls[0]?.[0];
    expect(uploadCall).toEqual(
      expect.objectContaining({
        key: expect.stringMatching(/^uploads\/posts\/my-post\/.+\.png$/),
        contentType: 'image/png',
      })
    );
    expect(uploadCall.body).toEqual(Buffer.from('img'));
    expect(result).toMatch(
      /^!\[cover\]\(\/uploads\/posts\/my-post\/.+\.png\)$/
    );
  });

  it('uses default content type for unknown extensions', async () => {
    (uploadToTos as jest.Mock).mockResolvedValue(undefined);
    const content = '![asset](assets/file.unknown)';
    const images = [
      {
        name: 'assets/file.unknown',
        data: Buffer.from('file').toString('base64'),
      },
    ];

    await processZipImages(content, images, 'slug');

    expect(uploadToTos).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringMatching(/^uploads\/posts\/slug\/.+\.unknown$/),
        contentType: 'application/octet-stream',
      })
    );
  });

  it('supports backward-compatible image references when rewriting paths', async () => {
    (uploadToTos as jest.Mock).mockResolvedValue(undefined);
    const content =
      '![a](images/folder/photo.png?v=1) ![b](img\\\\photo.png) ![c](photo.png)';
    const images = [
      {
        name: 'images/folder/photo.png',
        data: Buffer.from('img').toString('base64'),
      },
    ];

    const result = await processZipImages(content, images, 'legacy-post');

    expect(uploadToTos).toHaveBeenCalledWith(
      expect.objectContaining({
        key: expect.stringMatching(/^uploads\/posts\/legacy-post\/.+\.png$/),
      })
    );
    expect(result).toMatch(
      /^!\[a\]\(\/uploads\/posts\/legacy-post\/.+\.png\) !\[b\]\(\/uploads\/posts\/legacy-post\/.+\.png\) !\[c\]\(\/uploads\/posts\/legacy-post\/.+\.png\)$/
    );
  });
});
