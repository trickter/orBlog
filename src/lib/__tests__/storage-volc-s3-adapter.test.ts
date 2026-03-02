/** @jest-environment node */

import { StorageError } from '@/lib/storage/errors';
import { VolcObsS3Adapter } from '@/lib/storage/providers/VolcObsS3Adapter';
import type { VolcObsS3Config } from '@/lib/storage/types';

describe('VolcObsS3Adapter', () => {
  const config: VolcObsS3Config = {
    provider: 'volc_s3',
    bucket: 'test-bucket',
    region: 'cn-beijing',
    endpoint: 'https://tos-cn-beijing.volces.com',
    accessKeyId: 'ak',
    secretAccessKey: 'sk',
    cdnDomain: 'https://cdn.example.com',
  };

  it('uploads a buffer object successfully', async () => {
    const send = jest.fn().mockResolvedValue({
      ETag: '"etag-1"',
      VersionId: 'v1',
    });
    const adapter = new VolcObsS3Adapter(config, {
      s3Client: { send },
      presignGet: async () => 'https://signed-get',
      presignPut: async () => 'https://signed-put',
    });

    const body = Buffer.from('hello');
    const result = await adapter.putObject({
      key: 'images/a.png',
      body,
      contentType: 'image/png',
      cacheControl: 'public, max-age=60',
      metadata: { source: 'test' },
    });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0]?.[0] as {
      input: Record<string, unknown>;
    };
    expect(command.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'images/a.png',
      ContentType: 'image/png',
      CacheControl: 'public, max-age=60',
      Metadata: { source: 'test' },
    });
    expect(result).toEqual({
      key: 'images/a.png',
      etag: '"etag-1"',
      size: body.byteLength,
      versionId: 'v1',
    });
  });

  it('creates presigned GET url with expiry', async () => {
    const send = jest.fn();
    const presignGet = jest.fn().mockResolvedValue('https://signed-get-url');
    const adapter = new VolcObsS3Adapter(config, {
      s3Client: { send },
      presignGet,
      presignPut: async () => 'https://signed-put',
    });

    const result = await adapter.getPresignedGetUrl({
      key: 'images/a.png',
      expiresInSeconds: 600,
      responseContentType: 'image/png',
      responseContentDisposition: 'inline',
    });

    expect(result.url).toBe('https://signed-get-url');
    expect(presignGet).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: 'test-bucket',
        key: 'images/a.png',
        expiresInSeconds: 600,
        responseContentType: 'image/png',
        responseContentDisposition: 'inline',
      })
    );
  });

  it('deletes object', async () => {
    const send = jest.fn().mockResolvedValue({});
    const adapter = new VolcObsS3Adapter(config, {
      s3Client: { send },
      presignGet: async () => 'https://signed-get',
      presignPut: async () => 'https://signed-put',
    });

    await adapter.deleteObject({ key: 'images/a.png' });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0]?.[0] as {
      input: Record<string, unknown>;
    };
    expect(command.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: 'images/a.png',
    });
  });

  it('checks existence via HEAD', async () => {
    const send = jest
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce({
        name: 'NotFound',
        $metadata: { httpStatusCode: 404 },
      });

    const adapter = new VolcObsS3Adapter(config, {
      s3Client: { send },
      presignGet: async () => 'https://signed-get',
      presignPut: async () => 'https://signed-put',
    });

    await expect(adapter.exists({ key: 'images/yes.png' })).resolves.toBe(true);
    await expect(adapter.exists({ key: 'images/no.png' })).resolves.toBe(false);
  });

  it('throws when public url is requested without CDN domain', () => {
    const adapter = new VolcObsS3Adapter(
      {
        ...config,
        cdnDomain: '',
      },
      {
        s3Client: { send: jest.fn() },
        presignGet: async () => 'https://signed-get',
        presignPut: async () => 'https://signed-put',
      }
    );

    expect(() => adapter.getPublicUrl({ key: 'images/a b.png' })).toThrow(
      StorageError
    );
  });
});
