import { applyZipImagesIfPresent } from '@/lib/actions-posts';

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
