/** @jest-environment node */

import * as fs from 'fs/promises';
import { getStorageFromEnv } from '@/lib/storage';
import { uploadToTos } from '@/lib/tos-client';

jest.mock('fs/promises', () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('@/lib/storage', () => ({
  getStorageFromEnv: jest.fn(),
}));

describe('uploadToTos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uploads via configured storage adapter', async () => {
    const putObject = jest.fn().mockResolvedValue(undefined);
    (getStorageFromEnv as jest.Mock).mockReturnValue({ putObject });

    await uploadToTos({
      key: 'uploads/posts/a.png',
      body: Buffer.from('x'),
      contentType: 'image/png',
    });

    expect(putObject).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'uploads/posts/a.png',
        contentType: 'image/png',
      })
    );
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('falls back to local file write when storage config is missing', async () => {
    (getStorageFromEnv as jest.Mock).mockImplementation(() => {
      throw new Error(
        '[storage] Missing STORAGE_PROVIDER. Expected "volc_s3" or "tencent_cos".'
      );
    });

    await uploadToTos({
      key: 'uploads/posts/fallback.png',
      body: Buffer.from('file'),
      contentType: 'image/png',
    });

    expect(fs.mkdir).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('public/uploads/posts/fallback.png'),
      expect.any(Buffer)
    );
  });

  it('rethrows non-config storage errors', async () => {
    (getStorageFromEnv as jest.Mock).mockImplementation(() => {
      throw new Error('network timeout');
    });

    await expect(
      uploadToTos({
        key: 'uploads/posts/x.png',
        body: Buffer.from('x'),
      })
    ).rejects.toThrow('network timeout');
  });
});
