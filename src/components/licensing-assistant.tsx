import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { X } from 'lucide-react';

const transport = new DefaultChatTransport({
  api: '/api/public/licensing-assistant',
});

export function LicensingAssistant({ onClose }: { onClose?: () => void } = {}) {
  const { lang } = useI18n(); const ar = lang === 'ar';
  const [input, setInput] = useState('');
  const composer = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat({ transport });
  const busy = status === 'submitted' || status === 'streaming';
  useEffect(() => { if (!busy && (!document.activeElement || document.activeElement === document.body || document.activeElement === composer.current)) composer.current?.focus({ preventScroll: true }); }, [busy]);
  const ask = (text: string) => { if (!text.trim() || busy) return; void sendMessage({ text }); setInput(''); composer.current?.focus({ preventScroll: true }); };
  const suggestions = ar ? ['ما المستندات المطلوبة للترخيص؟', 'كيف أحفظ الطلب كمسودة؟', 'كيف أجدد الترخيص؟'] : ['Which documents are required?', 'How do I save a draft?', 'How do I renew my license?'];

  return <section className="space-y-4 rounded-md border-2 border-gold bg-card p-5">
    <div className="flex items-center justify-between gap-3"><img src="/site-assets/5b96e1ee2be36897.webp" alt="ACUD" className="h-auto w-20 shrink-0" />{onClose && <Button size="icon" className="size-10 shrink-0 rounded-full" aria-label={ar ? 'إغلاق نافذة المساعد' : 'Close assistant window'} onClick={onClose}><X /></Button>}</div>
    <h2 className="text-xl font-bold text-primary">{ar ? 'مساعد بوابة التراخيص' : 'ACUD Portal Assistant'}</h2>
    <Conversation className="h-80"><ConversationContent className="gap-4 p-2">
      {messages.length === 0 && <div className="flex flex-wrap gap-2">{suggestions.map(s => <Button key={s} variant="outline" size="sm" className="h-auto whitespace-normal" onClick={() => ask(s)}>{s}</Button>)}</div>}
      {messages.map(m => <Message key={m.id} from={m.role}><MessageContent className={m.role === 'user' ? 'group-[.is-user]:bg-primary group-[.is-user]:text-primary-foreground' : ''}>
        {m.parts.map((p, i) => p.type === 'text' ? (m.role === 'user' ? <p dir="auto" key={i}>{p.text}</p> : <MessageResponse key={i}>{p.text}</MessageResponse>) : p.type === 'reasoning' ? <details key={i} className="text-xs text-muted-foreground"><summary>{ar ? 'التفكير' : 'Reasoning'}</summary><MessageResponse>{p.text}</MessageResponse></details> : null)}
      </MessageContent></Message>)}
      {status === 'submitted' && <Shimmer>{ar ? 'جاري التفكير…' : 'Thinking…'}</Shimmer>}
      {error && <p className="text-sm font-bold text-destructive">{error.message || 'تعذر الحصول على إجابة الآن.'}</p>}
    </ConversationContent><ConversationScrollButton /></Conversation>
    <PromptInput onSubmit={({ text }) => ask(text)}>
      <PromptInputTextarea ref={composer} rows={2} maxLength={1000} aria-label={ar ? 'سؤالك عن الموقع' : 'Your question about the portal'} placeholder={ar ? 'اكتب سؤالك…' : 'Ask your question…'} value={input} onChange={e => setInput(e.target.value)} />
      <PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={() => stop()} disabled={!busy && !input.trim()} aria-label={ar ? (busy ? 'إيقاف' : 'إرسال') : (busy ? 'Stop' : 'Send')} /></PromptInputFooter>
    </PromptInput>
    <p className="text-xs text-muted-foreground">{ar ? 'إرشاد خاص بالموقع فقط؛ لا يطّلع على طلباتك. المحادثة لا تُحفظ.' : 'Portal guidance only; no access to your requests. This conversation is not saved.'}</p>
  </section>;
}
