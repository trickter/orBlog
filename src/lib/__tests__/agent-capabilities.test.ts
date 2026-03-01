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
      ])
    );
  });

  it('formats runtime capability context', () => {
    const context = formatAgentCapabilitiesContext();
    expect(context).toContain('create_post');
    expect(context).toContain('admin-only');
  });
});
