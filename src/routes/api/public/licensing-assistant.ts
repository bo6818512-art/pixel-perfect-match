import { createFileRoute } from '@tanstack/react-router';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { licensingKnowledge } from '@/lib/licensing-knowledge';
import { createLovableAiGatewayRunIdFetch, withLovableAiGatewayRunIdHeader } from '@/lib/ai/run-id.server';

export const Route = createFileRoute('/api/public/licensing-assistant')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return Response.json({ error: 'خدمة المساعد غير مهيأة' }, { status: 500 });
        const body = await request.json().catch(() => null) as { messages?: UIMessage[] } | null;
        const messages = Array.isArray(body?.messages) ? body.messages : [];
        if (!messages.length) return Response.json({ error: 'لا توجد رسالة' }, { status: 400 });
        if (messages.some(m => !['user','assistant'].includes(m.role) || !Array.isArray(m.parts) || m.parts.some(p => !['text','reasoning','step-start'].includes(p.type))) || JSON.stringify(messages).length > 100000) return Response.json({ error: 'المحادثة غير صالحة أو طويلة جدًا. / Invalid or oversized conversation.' }, { status: 400 });

        const gateway = createLovableAiGatewayRunIdFetch();
        const provider = createOpenAI({
          baseURL: 'https://ai.gateway.lovable.dev/v1', apiKey,
          fetch: gateway.fetch,
          headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
        });
        const result = streamText({
          model: provider.responses('openai/gpt-6-astra'),
          instructions: licensingKnowledge(),
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: { openai: { store: false, forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', include: ['reasoning.encrypted_content'] } },
        });
        return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: () => { /* Temporary chat: do not persist messages. */ },
          onError: (e: unknown) => { const s = (e as { statusCode?: number })?.statusCode; return s === 402 ? 'نفد رصيد خدمة المساعد حاليًا.' : s === 429 ? 'ضغط كبير على المساعد، حاول بعد قليل.' : 'تعذر الحصول على إجابة الآن.'; },
        }), gateway);
      },
    },
  },
});
