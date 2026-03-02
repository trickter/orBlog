import {
  createCategory,
  createPost,
  deleteCategory,
  deletePost,
  updateCategory,
  updatePost,
  updateProfile,
} from '@/lib/actions';
import { verifyAdmin } from '@/lib/action-helpers';
import {
  AGENT_CAPABILITIES,
  formatAgentCapabilitiesContext,
} from '@/lib/agent-capabilities';
import { getStorageFromEnv } from '@/lib/storage';

interface AgentPostInput {
  id?: string;
  title: string;
  content: string;
  categoryId?: string | null;
  published: boolean;
}

interface AgentCategoryInput {
  id?: string;
  name: string;
}

interface AgentProfileInput {
  name: string;
  bio?: string | null;
  avatar?: string | null;
  github?: string | null;
  twitter?: string | null;
  email?: string | null;
}

interface AgentStorageUploadInput {
  key: string;
  body: string;
  bodyEncoding?: 'utf8' | 'base64';
  bucket?: string;
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

interface AgentStorageDeleteInput {
  key: string;
  bucket?: string;
}

interface AgentStoragePresignedGetInput {
  key: string;
  expiresInSeconds: number;
  responseContentType?: string;
  responseContentDisposition?: string;
  bucket?: string;
}

interface AgentStorageExistsInput {
  key: string;
  bucket?: string;
}

function toFormData(
  data: Record<string, string | boolean | null | undefined>
): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === 'boolean') {
      if (value) {
        formData.append(key, 'on');
      }
      continue;
    }
    formData.append(key, value);
  }
  return formData;
}

function assertAdminSession(session: string | null): void {
  if (!verifyAdmin(session)) {
    throw new Error('Unauthorized');
  }
}

export async function agentCreatePost(
  input: AgentPostInput,
  session: string | null
) {
  const formData = toFormData({
    title: input.title,
    content: input.content,
    categoryId: input.categoryId ?? '',
    published: input.published,
  });
  await createPost(formData, session);
}

export async function agentUpdatePost(
  input: AgentPostInput,
  session: string | null
) {
  if (!input.id) {
    throw new Error('Post id is required');
  }
  const formData = toFormData({
    id: input.id,
    title: input.title,
    content: input.content,
    categoryId: input.categoryId ?? '',
    published: input.published,
  });
  await updatePost(formData, session);
}

export async function agentDeletePost(id: string, session: string | null) {
  await deletePost(id, session);
}

export async function agentCreateCategory(
  input: AgentCategoryInput,
  session: string | null
) {
  const formData = toFormData({ name: input.name });
  await createCategory(formData, session);
}

export async function agentUpdateCategory(
  input: AgentCategoryInput,
  session: string | null
) {
  if (!input.id) {
    throw new Error('Category id is required');
  }
  const formData = toFormData({
    id: input.id,
    name: input.name,
  });
  await updateCategory(formData, session);
}

export async function agentDeleteCategory(id: string, session: string | null) {
  await deleteCategory(id, session);
}

export async function agentUpdateProfile(
  input: AgentProfileInput,
  session: string | null
) {
  const formData = toFormData({
    name: input.name,
    bio: input.bio ?? '',
    avatar: input.avatar ?? '',
    github: input.github ?? '',
    twitter: input.twitter ?? '',
    email: input.email ?? '',
  });
  await updateProfile(formData, session);
}

export async function agentUploadStorageObject(
  input: AgentStorageUploadInput,
  session: string | null
) {
  assertAdminSession(session);
  const storage = getStorageFromEnv();
  const bodyEncoding = input.bodyEncoding ?? 'utf8';
  const body =
    bodyEncoding === 'base64'
      ? Buffer.from(input.body, 'base64')
      : Buffer.from(input.body, 'utf8');

  return storage.putObject({
    key: input.key,
    body,
    bucket: input.bucket,
    contentType: input.contentType,
    cacheControl: input.cacheControl,
    metadata: input.metadata,
  });
}

export async function agentDeleteStorageObject(
  input: AgentStorageDeleteInput,
  session: string | null
) {
  assertAdminSession(session);
  const storage = getStorageFromEnv();
  await storage.deleteObject({
    key: input.key,
    bucket: input.bucket,
  });
}

export async function agentGetStoragePresignedGetUrl(
  input: AgentStoragePresignedGetInput,
  session: string | null
) {
  assertAdminSession(session);
  const storage = getStorageFromEnv();
  return storage.getPresignedGetUrl({
    key: input.key,
    expiresInSeconds: input.expiresInSeconds,
    responseContentType: input.responseContentType,
    responseContentDisposition: input.responseContentDisposition,
    bucket: input.bucket,
  });
}

export async function agentStorageObjectExists(
  input: AgentStorageExistsInput,
  session: string | null
) {
  assertAdminSession(session);
  const storage = getStorageFromEnv();
  return storage.exists({
    key: input.key,
    bucket: input.bucket,
  });
}

export function getAgentRuntimeContext() {
  return {
    capabilities: AGENT_CAPABILITIES,
    capabilitiesText: formatAgentCapabilitiesContext(),
  };
}
