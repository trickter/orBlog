# Object Storage Adapter Layer

统一对象存储抽象层，屏蔽厂商差异。

## 目标

- 业务代码只依赖 `ObjectStorage` 接口。
- 当前支持：
  - `volc_s3`（火山引擎 OBS/TOS 的 S3 兼容接口）
  - `tencent_cos`（腾讯云 COS）
- 默认安全模式：私有桶 + 签名 URL 对外访问。
- 可扩展更多 Provider（阿里 OSS、AWS S3、MinIO 等）。

## 目录结构

```txt
src/lib/storage/
  ObjectStorage.ts
  StorageFactory.ts
  errors.ts
  index.ts
  types.ts
  providers/
    VolcObsS3Adapter.ts
    TencentCosAdapter.ts
```

## 环境变量

### 通用

- `STORAGE_PROVIDER=volc_s3 | tencent_cos`
- `STORAGE_BUCKET`
- `STORAGE_REGION`
- `STORAGE_ENDPOINT` (可选)
- `STORAGE_CDN_DOMAIN` (可选，仅 `getPublicUrl` 使用)

### 火山引擎 S3 兼容

- `VOLC_ACCESS_KEY`
- `VOLC_SECRET_KEY`

### 腾讯云 COS

- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`
- `TENCENT_COS_APPID` (可选)

### 兼容旧配置（可选）

如果还在使用旧的 `TOS_*` 环境变量，`StorageFactory.fromEnv()` 也支持回退读取：

- `TOS_ENDPOINT`
- `TOS_REGION`
- `TOS_BUCKET`
- `TOS_ACCESS_KEY`
- `TOS_SECRET_KEY`

## 安全与风控建议

- 桶默认保持 private，不要使用 public-read 作为默认方案。
- 对外访问优先使用 `getPresignedGetUrl`。
- `getPublicUrl` 仅用于你已配置并受控的 CDN 域名。
- 上传时设置 `contentType`，避免浏览器 MIME 嗅探。
- 静态资源建议设置 `cacheControl`，例如：
  - `public, max-age=31536000, immutable`

## 快速使用

```ts
import { StorageFactory } from '@/lib/storage';

const storage = StorageFactory.fromEnv();

await storage.putObject({
  key: 'images/2026/03/a.png',
  body: Buffer.from('...'),
  contentType: 'image/png',
  cacheControl: 'public, max-age=31536000, immutable',
});

const { url } = await storage.getPresignedGetUrl({
  key: 'images/2026/03/a.png',
  expiresInSeconds: 600,
});

console.log(url);
```

## 接口能力

`ObjectStorage` 提供：

- `putObject(params)`
- `getPresignedGetUrl(params)`
- `getPresignedPutUrl(params)`
- `deleteObject(params)`
- `exists(params)`
- `getPublicUrl(params)`

## 运行测试

```bash
npm test -- --runTestsByPath \
  src/lib/__tests__/storage-volc-s3-adapter.test.ts \
  src/lib/__tests__/storage-tencent-cos-adapter.test.ts \
  src/lib/__tests__/storage-factory.test.ts
```

测试均为单元测试，不依赖真实云服务。
