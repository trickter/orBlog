import COS from 'cos-nodejs-sdk-v5';
import type { ObjectStorage } from '@/lib/storage/ObjectStorage';
import {
  StorageError,
  buildPublicUrl,
  extractErrorDetails,
  normalizeCdnDomain,
  sizeOfBody,
} from '@/lib/storage/errors';
import type {
  DeleteObjectParams,
  ExistsParams,
  PresignedGetUrlParams,
  PresignedPutUrlParams,
  PresignedUrlResult,
  PublicUrlParams,
  PutObjectParams,
  PutObjectResult,
  TencentCosConfig,
} from '@/lib/storage/types';

interface CosBodyOutput {
  ETag?: string;
  VersionId?: string;
  headers?: { 'x-cos-version-id'?: string };
}

type CosCallback<T> = (err: unknown, data: T) => void;

interface CosClientLike {
  putObject(
    params: {
      Bucket: string;
      Region: string;
      Key: string;
      Body: Buffer | string;
      ContentType?: string;
      CacheControl?: string;
      Headers?: Record<string, string>;
    },
    cb: CosCallback<CosBodyOutput>
  ): void;
  deleteObject(
    params: {
      Bucket: string;
      Region: string;
      Key: string;
    },
    cb: CosCallback<unknown>
  ): void;
  headObject(
    params: {
      Bucket: string;
      Region: string;
      Key: string;
    },
    cb: CosCallback<unknown>
  ): void;
  getObjectUrl(
    params: {
      Bucket: string;
      Region: string;
      Key: string;
      Sign: boolean;
      Expires: number;
      Method?: 'GET' | 'PUT';
      Query?: Record<string, string>;
    },
    cb?: CosCallback<unknown>
  ): string | { Url?: string };
}

interface TencentAdapterDeps {
  cosClient?: CosClientLike;
}

export class TencentCosAdapter implements ObjectStorage {
  private readonly config: TencentCosConfig;
  private readonly client: CosClientLike;
  private readonly cdnDomain: string | null;

  constructor(config: TencentCosConfig, deps: TencentAdapterDeps = {}) {
    this.config = config;
    this.cdnDomain = normalizeCdnDomain(config.cdnDomain);

    this.client =
      deps.cosClient ??
      new COS({
        SecretId: config.secretId,
        SecretKey: config.secretKey,
      });
  }

  async putObject(params: PutObjectParams): Promise<PutObjectResult> {
    const bucket = this.resolveBucket(params.bucket);

    try {
      const data = await this.callCos<CosBodyOutput>((callback) => {
        this.client.putObject(
          {
            Bucket: bucket,
            Region: this.config.region,
            Key: params.key,
            Body: toCosBody(params.body),
            ContentType: params.contentType,
            CacheControl: params.cacheControl,
            Headers: toCosMetadataHeaders(params.metadata),
          },
          callback
        );
      });

      return {
        key: params.key,
        etag: data.ETag,
        size: sizeOfBody(params.body),
        versionId: data.VersionId ?? data.headers?.['x-cos-version-id'],
      };
    } catch (error) {
      throw this.wrapError('PUT_OBJECT_FAILED', error);
    }
  }

  async getPresignedGetUrl(
    params: PresignedGetUrlParams
  ): Promise<PresignedUrlResult> {
    const bucket = this.resolveBucket(params.bucket);

    try {
      const query: Record<string, string> = {};
      if (params.responseContentType) {
        query['response-content-type'] = params.responseContentType;
      }
      if (params.responseContentDisposition) {
        query['response-content-disposition'] =
          params.responseContentDisposition;
      }

      const raw = this.client.getObjectUrl({
        Bucket: bucket,
        Region: this.config.region,
        Key: params.key,
        Sign: true,
        Expires: params.expiresInSeconds,
        Method: 'GET',
        Query: query,
      });
      const url = unwrapCosUrl(raw);

      return { url };
    } catch (error) {
      throw this.wrapError('PRESIGNED_GET_URL_FAILED', error);
    }
  }

  async getPresignedPutUrl(
    params: PresignedPutUrlParams
  ): Promise<PresignedUrlResult> {
    const bucket = this.resolveBucket(params.bucket);

    try {
      const query: Record<string, string> = {};
      if (params.contentType) {
        query['content-type'] = params.contentType;
      }

      const raw = this.client.getObjectUrl({
        Bucket: bucket,
        Region: this.config.region,
        Key: params.key,
        Sign: true,
        Expires: params.expiresInSeconds,
        Method: 'PUT',
        Query: query,
      });
      const url = unwrapCosUrl(raw);

      return { url };
    } catch (error) {
      throw this.wrapError('PRESIGNED_PUT_URL_FAILED', error);
    }
  }

  async deleteObject(params: DeleteObjectParams): Promise<void> {
    const bucket = this.resolveBucket(params.bucket);

    try {
      await this.callCos((callback) => {
        this.client.deleteObject(
          {
            Bucket: bucket,
            Region: this.config.region,
            Key: params.key,
          },
          callback
        );
      });
    } catch (error) {
      throw this.wrapError('DELETE_OBJECT_FAILED', error);
    }
  }

  async exists(params: ExistsParams): Promise<boolean> {
    const bucket = this.resolveBucket(params.bucket);

    try {
      await this.callCos((callback) => {
        this.client.headObject(
          {
            Bucket: bucket,
            Region: this.config.region,
            Key: params.key,
          },
          callback
        );
      });
      return true;
    } catch (error) {
      const statusCode = (error as { statusCode?: unknown }).statusCode;
      const code = (error as { code?: unknown }).code;
      if (statusCode === 404 || code === 'NoSuchResource') {
        return false;
      }
      throw this.wrapError('EXISTS_CHECK_FAILED', error);
    }
  }

  getPublicUrl(params: PublicUrlParams): string {
    if (!this.cdnDomain) {
      throw new StorageError({
        code: 'CDN_DOMAIN_NOT_CONFIGURED',
        message:
          'STORAGE_CDN_DOMAIN is not configured. Public URL is disabled for private bucket mode.',
        provider: this.config.provider,
      });
    }

    return buildPublicUrl(this.cdnDomain, params.key);
  }

  private resolveBucket(bucketOverride?: string): string {
    const base = bucketOverride ?? this.config.bucket;

    if (!this.config.appId || base.endsWith(`-${this.config.appId}`)) {
      return base;
    }

    return `${base}-${this.config.appId}`;
  }

  private callCos<T>(executor: (callback: CosCallback<T>) => void): Promise<T> {
    return new Promise((resolve, reject) => {
      executor((err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  private wrapError(code: string, error: unknown): StorageError {
    const details = extractErrorDetails(error);
    return new StorageError({
      code,
      message: details.message,
      provider: this.config.provider,
      requestId: details.requestId,
      cause: error,
    });
  }
}

function toCosMetadataHeaders(
  metadata?: Record<string, string>
): Record<string, string> | undefined {
  if (!metadata) {
    return undefined;
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    result[`x-cos-meta-${key}`] = value;
  }

  return result;
}

function toCosBody(body: Buffer | Uint8Array | string): Buffer | string {
  if (typeof body === 'string' || Buffer.isBuffer(body)) {
    return body;
  }
  return Buffer.from(body);
}

function unwrapCosUrl(raw: string | { Url?: string }): string {
  if (typeof raw === 'string') {
    return raw;
  }
  if (raw?.Url) {
    return raw.Url;
  }
  throw new Error('COS did not return a signed URL.');
}
