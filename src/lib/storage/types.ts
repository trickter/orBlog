export type StorageProvider = 'volc_s3' | 'tencent_cos';

export type StorageBody = Buffer | Uint8Array | string;

export interface PutObjectParams {
  key: string;
  body: StorageBody;
  bucket?: string;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export interface PutObjectResult {
  key: string;
  etag?: string;
  size: number;
  versionId?: string;
}

export interface PresignedGetUrlParams {
  key: string;
  expiresInSeconds: number;
  responseContentType?: string;
  responseContentDisposition?: string;
  bucket?: string;
}

export interface PresignedPutUrlParams {
  key: string;
  expiresInSeconds: number;
  contentType?: string;
  bucket?: string;
}

export interface PresignedUrlResult {
  url: string;
}

export interface DeleteObjectParams {
  key: string;
  bucket?: string;
}

export interface ExistsParams {
  key: string;
  bucket?: string;
}

export interface PublicUrlParams {
  key: string;
}

export interface ObjectStorageConfig {
  provider: StorageProvider;
  bucket: string;
  region: string;
  endpoint?: string;
  cdnDomain?: string;
}

export interface VolcObsS3Config extends ObjectStorageConfig {
  provider: 'volc_s3';
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle?: boolean;
}

export interface TencentCosConfig extends ObjectStorageConfig {
  provider: 'tencent_cos';
  secretId: string;
  secretKey: string;
  appId?: string;
}
