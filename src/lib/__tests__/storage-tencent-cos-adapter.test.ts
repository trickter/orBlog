/** @jest-environment node */

import { StorageError } from '@/lib/storage/errors';
import { TencentCosAdapter } from '@/lib/storage/providers/TencentCosAdapter';
import type { TencentCosConfig } from '@/lib/storage/types';

type Callback<T> = (err: unknown, data: T) => void;

function createCosMock() {
  return {
    putObject: jest.fn(),
    deleteObject: jest.fn(),
    headObject: jest.fn(),
    getObjectUrl: jest.fn(),
  };
}

describe('TencentCosAdapter', () => {
  const config: TencentCosConfig = {
    provider: 'tencent_cos',
    bucket: 'blog-assets',
    region: 'ap-beijing',
    secretId: 'sid',
    secretKey: 'skey',
    appId: '1234567890',
    cdnDomain: 'cdn.example.com',
  };

  it('uploads a buffer object successfully', async () => {
    const cos = createCosMock();
    cos.putObject.mockImplementation(
      (
        _params: unknown,
        callback: Callback<{
          ETag?: string;
          headers?: { 'x-cos-version-id'?: string };
        }>
      ) => {
        callback(null, {
          ETag: 'etag-cos',
          headers: { 'x-cos-version-id': 'cos-v1' },
        });
      }
    );

    const adapter = new TencentCosAdapter(config, { cosClient: cos });
    const body = Buffer.from('hello cos');

    const result = await adapter.putObject({
      key: 'images/c.png',
      body,
      contentType: 'image/png',
      cacheControl: 'public, max-age=3600',
      metadata: { project: 'blog' },
    });

    expect(cos.putObject).toHaveBeenCalledTimes(1);
    expect(cos.putObject.mock.calls[0]?.[0]).toMatchObject({
      Bucket: 'blog-assets-1234567890',
      Region: 'ap-beijing',
      Key: 'images/c.png',
      ContentType: 'image/png',
      CacheControl: 'public, max-age=3600',
      Headers: { 'x-cos-meta-project': 'blog' },
    });
    expect(result).toEqual({
      key: 'images/c.png',
      etag: 'etag-cos',
      size: body.byteLength,
      versionId: 'cos-v1',
    });
  });

  it('creates presigned GET url with expiry', async () => {
    const cos = createCosMock();
    cos.getObjectUrl.mockReturnValue('https://cos.example.com/signed-get');

    const adapter = new TencentCosAdapter(config, { cosClient: cos });

    const result = await adapter.getPresignedGetUrl({
      key: 'images/c.png',
      expiresInSeconds: 300,
      responseContentType: 'image/png',
      responseContentDisposition: 'attachment',
    });

    expect(result.url).toBe('https://cos.example.com/signed-get');
    expect(cos.getObjectUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'blog-assets-1234567890',
        Key: 'images/c.png',
        Sign: true,
        Expires: 300,
        Method: 'GET',
      })
    );
  });

  it('deletes object', async () => {
    const cos = createCosMock();
    cos.deleteObject.mockImplementation(
      (_params: unknown, callback: Callback<unknown>) => {
        callback(null, {});
      }
    );

    const adapter = new TencentCosAdapter(config, { cosClient: cos });
    await adapter.deleteObject({ key: 'images/c.png' });

    expect(cos.deleteObject).toHaveBeenCalledWith(
      expect.objectContaining({
        Bucket: 'blog-assets-1234567890',
        Region: 'ap-beijing',
        Key: 'images/c.png',
      }),
      expect.any(Function)
    );
  });

  it('checks existence via HEAD', async () => {
    const cos = createCosMock();
    cos.headObject
      .mockImplementationOnce(
        (_params: unknown, callback: Callback<unknown>) => {
          callback(null, {});
        }
      )
      .mockImplementationOnce(
        (_params: unknown, callback: Callback<unknown>) => {
          callback({ statusCode: 404 }, {});
        }
      );

    const adapter = new TencentCosAdapter(config, { cosClient: cos });

    await expect(adapter.exists({ key: 'images/yes.png' })).resolves.toBe(true);
    await expect(adapter.exists({ key: 'images/no.png' })).resolves.toBe(false);
  });

  it('throws when public url is requested without CDN domain', () => {
    const adapter = new TencentCosAdapter(
      {
        ...config,
        cdnDomain: '',
      },
      { cosClient: createCosMock() }
    );

    expect(() => adapter.getPublicUrl({ key: 'images/a b.png' })).toThrow(
      StorageError
    );
  });
});
