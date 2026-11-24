import { expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock('@ai-sdk/openai', () => ({ createOpenAI: () => ({ responses: () => 'test-model' }) }));
vi.mock('ai', () => ({
  convertToModelMessages: async (messages: unknown) => messages,
  streamText: () => ({ toUIMessageStreamResponse: () => new Response('public answer') }),
}));
vi.mock('@/lib/ai/run-id.server', () => ({ createLovableAiGatewayRunIdFetch: () => ({}), withLovableAiGatewayRunIdHeader: (response: Response) => response }));

it('allows a visitor to ask the portal assistant without an authorization header', async () => {
  vi.stubEnv('LOVABLE_API_KEY', 'test-only');
  try {
    const { Route } = await import('@/routes/api/public/licensing-assistant');
    const route = Route as unknown as { server: { handlers: { POST: (args: { request: Request }) => Promise<Response> } } };
    const response = await route.server.handlers.POST({ request: new Request('https://portal.example/api/public/licensing-assistant', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ id: 'visitor', role: 'user', parts: [{ type: 'text', text: 'How do I apply for a license?' }] }] }),
    }) });
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('public answer');
  } finally { vi.unstubAllEnvs(); }
});