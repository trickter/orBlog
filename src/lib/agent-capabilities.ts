export interface AgentCapability {
  tool: string;
  action: string;
  resource: string;
  requiresAdmin: boolean;
}

export const AGENT_CAPABILITIES: AgentCapability[] = [
  {
    tool: 'create_post',
    action: 'Create a new post',
    resource: 'posts',
    requiresAdmin: true,
  },
  {
    tool: 'update_post',
    action: 'Update an existing post',
    resource: 'posts',
    requiresAdmin: true,
  },
  {
    tool: 'delete_post',
    action: 'Delete an existing post',
    resource: 'posts',
    requiresAdmin: true,
  },
  {
    tool: 'create_category',
    action: 'Create category',
    resource: 'categories',
    requiresAdmin: true,
  },
  {
    tool: 'update_category',
    action: 'Update category',
    resource: 'categories',
    requiresAdmin: true,
  },
  {
    tool: 'delete_category',
    action: 'Delete category',
    resource: 'categories',
    requiresAdmin: true,
  },
  {
    tool: 'update_profile',
    action: 'Update profile',
    resource: 'profile',
    requiresAdmin: true,
  },
  {
    tool: 'storage_upload',
    action: 'Upload object to storage',
    resource: 'storage',
    requiresAdmin: true,
  },
  {
    tool: 'storage_delete',
    action: 'Delete object from storage',
    resource: 'storage',
    requiresAdmin: true,
  },
  {
    tool: 'storage_presigned_get',
    action: 'Get presigned download URL from storage',
    resource: 'storage',
    requiresAdmin: true,
  },
  {
    tool: 'storage_exists',
    action: 'Check whether storage object exists',
    resource: 'storage',
    requiresAdmin: true,
  },
];

export function formatAgentCapabilitiesContext(): string {
  return AGENT_CAPABILITIES.map((capability) => {
    const auth = capability.requiresAdmin ? 'admin-only' : 'public';
    return `- ${capability.tool}: ${capability.action} (${capability.resource}, ${auth})`;
  }).join('\n');
}
