import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  type PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  VolcObsS3Config,
} from '@/lib/storage/types';

interface S3ClientLike {
  send(command: unknown): Promise<unknown>;
}

interface VolcAdapterDeps {
  s3Client?: S3ClientLike;
  presignGet?: (params: {
    client: S3ClientLike;
    bucket: string;
    key: string;
    expiresInSeconds: number;
    responseContentType?: string;
    responseContentDisposition?: string;
  }) => Promise<string>;
  presignPut?: (params: {
    client: S3ClientLike;
    bucket: string;
    key: string;
    expiresInSeconds: number;
    contentType?: string;
  }) => Promise<string>;
}

export class VolcObsS3Adapter implements ObjectStorage {
  private readonly cdnDomain: string | null;
  private client?: S3ClientLike;
  private readonly config: VolcObsS3Config;
  private readonly presignGetFn: NonNullable<VolcAdapterDeps['presignGet']>;
  private readonly presignPutFn: NonNullable<VolcAdapterDeps['presignPut']>;

  constructor(config: VolcObsS3Config, deps: VolcAdapterDeps = {}) {
    this.config = config;
    this.cdnDomain = normalizeCdnDomain(config.cdnDomain);
    this.client = deps.s3Client;

    this.presignGetFn = deps.presignGet ?? defaultPresignGet;
    this.presignPutFn = deps.presignPut ?? defaultPresignPut;
  }

  async putObject(params: PutObjectParams): Promise<PutObjectResult> {
    const bucket = params.bucket ?? this.config.bucket;
    const client = this.getClient();

    try {
      const output = (await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: params.key,
          Body: params.body,
          ContentType: params.contentType,
          CacheControl: params.cacheControl,
          Metadata: params.metadata,
        })
      )) as PutObjectCommandOutput;

      return {
        key: params.key,
        etag: output.ETag,
        size: sizeOfBody(params.body),
        versionId: output.VersionId,
      };
    } catch (error) {
      throw this.wrapError('PUT_OBJECT_FAILED', error);
    }
  }

  async getPresignedGetUrl(
    params: PresignedGetUrlParams
  ): Promise<PresignedUrlResult> {
    const bucket = params.bucket ?? this.config.bucket;
    const client = this.getClient();

    try {
      const url = await this.presignGetFn({
        client,
        bucket,
        key: params.key,
        expiresInSeconds: params.expiresInSeconds,
        responseContentType: params.responseContentType,
        responseContentDisposition: params.responseContentDisposition,
      });
      return { url };
    } catch (error) {
      throw this.wrapError('PRESIGNED_GET_URL_FAILED', error);
    }
  }

  async getPresignedPutUrl(
    params: PresignedPutUrlParams
  ): Promise<PresignedUrlResult> {
    const bucket = params.bucket ?? this.config.bucket;
    const client = this.getClient();

    try {
      const url = await this.presignPutFn({
        client,
        bucket,
        key: params.key,
        expiresInSeconds: params.expiresInSeconds,
        contentType: params.contentType,
      });
      return { url };
    } catch (error) {
      throw this.wrapError('PRESIGNED_PUT_URL_FAILED', error);
    }
  }

  async deleteObject(params: DeleteObjectParams): Promise<void> {
    const bucket = params.bucket ?? this.config.bucket;
    const client = this.getClient();

    try {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: params.key,
        })
      );
    } catch (error) {
      throw this.wrapError('DELETE_OBJECT_FAILED', error);
    }
  }

  async exists(params: ExistsParams): Promise<boolean> {
    const bucket = params.bucket ?? this.config.bucket;
    const client = this.getClient();

    try {
      await client.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: params.key,
        })
      );
      return true;
    } catch (error) {
      const details = extractErrorDetails(error);
      if (details.code === 'NotFound' || details.code === 'NoSuchKey') {
        return false;
      }

      const statusCode = (error as { $metadata?: { httpStatusCode?: number } })
        .$metadata?.httpStatusCode;
      if (statusCode === 404) {
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

  private getClient(): S3ClientLike {
    if (this.client) {
      return this.client;
    }

    this.client = new S3Client({
      region: this.config.region,
      endpoint: this.config.endpoint,
      forcePathStyle: this.config.forcePathStyle ?? true,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
    return this.client;
  }
}

async function defaultPresignGet(params: {
  client: S3ClientLike;
  bucket: string;
  key: string;
  expiresInSeconds: number;
  responseContentType?: string;
  responseContentDisposition?: string;
}): Promise<string> {
  return getSignedUrl(
    params.client as S3Client,
    new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ResponseContentType: params.responseContentType,
      ResponseContentDisposition: params.responseContentDisposition,
    }),
    { expiresIn: params.expiresInSeconds }
  );
}

async function defaultPresignPut(params: {
  client: S3ClientLike;
  bucket: string;
  key: string;
  expiresInSeconds: number;
  contentType?: string;
}): Promise<string> {
  return getSignedUrl(
    params.client as S3Client,
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ContentType: params.contentType,
    }),
    { expiresIn: params.expiresInSeconds }
  );
}
