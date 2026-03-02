import {
  AGENT_CAPABILITIES,
  formatAgentCapabilitiesContext,
} from '@/lib/agent-capabilities';

describe('agent capabilities', () => {
  it('covers core admin actions', () => {
    const tools = AGENT_CAPABILITIES.map((item) => item.tool);
    expect(tools).toEqual(
      expect.arrayContaining([
        'create_post',
        'update_post',
        'delete_post',
        'create_category',
        'update_category',
        'delete_category',
        'update_profile',
        'storage_upload',
        'storage_delete',
        'storage_presigned_get',
        'storage_exists',
      ])
    );
  });

  it('keeps all capabilities admin-only', () => {
    expect(AGENT_CAPABILITIES.every((item) => item.requiresAdmin)).toBe(true);
  });

  it('formats runtime capability context', () => {
    const context = formatAgentCapabilitiesContext();
    expect(context).toContain('create_post');
    expect(context).toContain('storage_upload');
    expect(context).toContain('admin-only');
  });
});
