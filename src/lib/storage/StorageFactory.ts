import type { ObjectStorage } from '@/lib/storage/ObjectStorage';
import { TencentCosAdapter } from '@/lib/storage/providers/TencentCosAdapter';
import { VolcObsS3Adapter } from '@/lib/storage/providers/VolcObsS3Adapter';
import type {
  StorageProvider,
  TencentCosConfig,
  VolcObsS3Config,
} from '@/lib/storage/types';

interface ReadEnvOptions {
  required?: boolean;
  fallback?: string;
}

function readEnv(name: string, options: ReadEnvOptions = {}): string {
  const value = process.env[name]?.trim();
  if (!value) {
    if (options.required) {
      throw new Error(
        `[storage] Missing required environment variable: ${name}`
      );
    }
    return options.fallback ?? '';
  }
  return value;
}

function parseProvider(raw: string): StorageProvider {
  if (raw === 'volc_s3' || raw === 'tencent_cos') {
    return raw;
  }
  throw new Error(
    `[storage] Unsupported STORAGE_PROVIDER: ${raw}. Use volc_s3 or tencent_cos.`
  );
}

function resolveProviderFromEnv(): StorageProvider {
  const explicit = process.env.STORAGE_PROVIDER?.trim();
  if (explicit) {
    return parseProvider(explicit);
  }

  if (process.env.TOS_ENDPOINT || process.env.TOS_ACCESS_KEY) {
    return 'volc_s3';
  }

  throw new Error(
    '[storage] Missing STORAGE_PROVIDER. Expected "volc_s3" or "tencent_cos".'
  );
}

export class StorageFactory {
  static fromEnv(): ObjectStorage {
    const provider = resolveProviderFromEnv();

    if (provider === 'volc_s3') {
      return new VolcObsS3Adapter(this.readVolcConfigFromEnv());
    }

    return new TencentCosAdapter(this.readTencentConfigFromEnv());
  }

  static createVolcS3(config: VolcObsS3Config): ObjectStorage {
    return new VolcObsS3Adapter(config);
  }

  static createTencentCos(config: TencentCosConfig): ObjectStorage {
    return new TencentCosAdapter(config);
  }

  private static readVolcConfigFromEnv(): VolcObsS3Config {
    return {
      provider: 'volc_s3',
      bucket: readEnv('STORAGE_BUCKET', {
        required: !process.env.TOS_BUCKET,
        fallback: readEnv('TOS_BUCKET'),
      }),
      region: readEnv('STORAGE_REGION', {
        required: !process.env.TOS_REGION,
        fallback: readEnv('TOS_REGION'),
      }),
      endpoint: readEnv('STORAGE_ENDPOINT', {
        fallback: readEnv('TOS_ENDPOINT'),
      }),
      cdnDomain: readEnv('STORAGE_CDN_DOMAIN'),
      accessKeyId: readEnv('VOLC_ACCESS_KEY', {
        required: !process.env.TOS_ACCESS_KEY,
        fallback: readEnv('TOS_ACCESS_KEY'),
      }),
      secretAccessKey: readEnv('VOLC_SECRET_KEY', {
        required: !process.env.TOS_SECRET_KEY,
        fallback: readEnv('TOS_SECRET_KEY'),
      }),
      forcePathStyle: true,
    };
  }

  private static readTencentConfigFromEnv(): TencentCosConfig {
    return {
      provider: 'tencent_cos',
      bucket: readEnv('STORAGE_BUCKET', { required: true }),
      region: readEnv('STORAGE_REGION', { required: true }),
      endpoint: readEnv('STORAGE_ENDPOINT'),
      cdnDomain: readEnv('STORAGE_CDN_DOMAIN'),
      secretId: readEnv('TENCENT_SECRET_ID', { required: true }),
      secretKey: readEnv('TENCENT_SECRET_KEY', { required: true }),
      appId: readEnv('TENCENT_COS_APPID'),
    };
  }
}

let cachedStorage: ObjectStorage | null = null;

export function getStorageFromEnv(): ObjectStorage {
  if (!cachedStorage) {
    cachedStorage = StorageFactory.fromEnv();
  }
  return cachedStorage;
}

export function resetStorageForTests(): void {
  cachedStorage = null;
}
