import {
  createCategory,
  createPost,
  deleteCategory,
  deletePost,
  updateCategory,
  updatePost,
  updateProfile,
} from '@/lib/actions';
import {
  AGENT_CAPABILITIES,
  formatAgentCapabilitiesContext,
} from '@/lib/agent-capabilities';

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

export function getAgentRuntimeContext() {
  return {
    capabilities: AGENT_CAPABILITIES,
    capabilitiesText: formatAgentCapabilitiesContext(),
  };
}
