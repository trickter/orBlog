import type {
  DeleteObjectParams,
  ExistsParams,
  PresignedGetUrlParams,
  PresignedPutUrlParams,
  PresignedUrlResult,
  PublicUrlParams,
  PutObjectParams,
  PutObjectResult,
} from '@/lib/storage/types';

export interface ObjectStorage {
  putObject(params: PutObjectParams): Promise<PutObjectResult>;
  getPresignedGetUrl(
    params: PresignedGetUrlParams
  ): Promise<PresignedUrlResult>;
  getPresignedPutUrl?(
    params: PresignedPutUrlParams
  ): Promise<PresignedUrlResult>;
  deleteObject(params: DeleteObjectParams): Promise<void>;
  exists(params: ExistsParams): Promise<boolean>;
  getPublicUrl(params: PublicUrlParams): string;
}
