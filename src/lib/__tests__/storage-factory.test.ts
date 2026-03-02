/** @jest-environment node */

import { StorageFactory } from '@/lib/storage/StorageFactory';
import { TencentCosAdapter } from '@/lib/storage/providers/TencentCosAdapter';
import { VolcObsS3Adapter } from '@/lib/storage/providers/VolcObsS3Adapter';

const envNames = [
  'STORAGE_PROVIDER',
  'STORAGE_BUCKET',
  'STORAGE_REGION',
  'STORAGE_ENDPOINT',
  'STORAGE_CDN_DOMAIN',
  'VOLC_ACCESS_KEY',
  'VOLC_SECRET_KEY',
  'TENCENT_SECRET_ID',
  'TENCENT_SECRET_KEY',
  'TENCENT_COS_APPID',
  'TOS_ENDPOINT',
  'TOS_REGION',
  'TOS_BUCKET',
  'TOS_ACCESS_KEY',
  'TOS_SECRET_KEY',
] as const;

const originalEnv: Record<string, string | undefined> = {};

beforeAll(() => {
  for (const name of envNames) {
    originalEnv[name] = process.env[name];
  }
});

afterEach(() => {
  for (const name of envNames) {
    if (originalEnv[name] === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = originalEnv[name];
    }
  }
});

describe('StorageFactory.fromEnv', () => {
  it('creates volc adapter from STORAGE_PROVIDER', () => {
    process.env.STORAGE_PROVIDER = 'volc_s3';
    process.env.STORAGE_BUCKET = 'blog';
    process.env.STORAGE_REGION = 'cn-beijing';
    process.env.STORAGE_ENDPOINT = 'https://tos-cn-beijing.volces.com';
    process.env.VOLC_ACCESS_KEY = 'ak';
    process.env.VOLC_SECRET_KEY = 'sk';

    const storage = StorageFactory.fromEnv();
    expect(storage).toBeInstanceOf(VolcObsS3Adapter);
  });

  it('creates tencent adapter from STORAGE_PROVIDER', () => {
    process.env.STORAGE_PROVIDER = 'tencent_cos';
    process.env.STORAGE_BUCKET = 'blog-assets';
    process.env.STORAGE_REGION = 'ap-beijing';
    process.env.TENCENT_SECRET_ID = 'sid';
    process.env.TENCENT_SECRET_KEY = 'skey';

    const storage = StorageFactory.fromEnv();
    expect(storage).toBeInstanceOf(TencentCosAdapter);
  });

  it('supports legacy TOS env fallback for volc provider', () => {
    process.env.TOS_ENDPOINT = 'https://tos-cn-beijing.volces.com';
    process.env.TOS_REGION = 'cn-beijing';
    process.env.TOS_BUCKET = 'legacy-bucket';
    process.env.TOS_ACCESS_KEY = 'legacy-ak';
    process.env.TOS_SECRET_KEY = 'legacy-sk';

    const storage = StorageFactory.fromEnv();
    expect(storage).toBeInstanceOf(VolcObsS3Adapter);
  });

  it('throws for unsupported provider', () => {
    process.env.STORAGE_PROVIDER = 'unknown';

    expect(() => StorageFactory.fromEnv()).toThrow(
      /Unsupported STORAGE_PROVIDER/
    );
  });
});
