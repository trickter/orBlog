export type { ObjectStorage } from '@/lib/storage/ObjectStorage';
export { StorageFactory, getStorageFromEnv } from '@/lib/storage/StorageFactory';
export { StorageError } from '@/lib/storage/errors';
export { VolcObsS3Adapter } from '@/lib/storage/providers/VolcObsS3Adapter';
export { TencentCosAdapter } from '@/lib/storage/providers/TencentCosAdapter';
export type {
  DeleteObjectParams,
  ExistsParams,
  PresignedGetUrlParams,
  PresignedPutUrlParams,
  PresignedUrlResult,
  PublicUrlParams,
  PutObjectParams,
  PutObjectResult,
  StorageProvider,
  TencentCosConfig,
  VolcObsS3Config,
} from '@/lib/storage/types';
