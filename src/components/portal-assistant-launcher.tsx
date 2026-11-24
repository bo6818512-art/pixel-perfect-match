import { useState } from 'react';
import chatbotAsset from '@/assets/chatbot.png.asset.json';
import { Button } from '@/components/ui/button';
import { LicensingAssistant } from './licensing-assistant';
import { useI18n } from '@/lib/i18n';
export function PortalAssistantLauncher() {
  const { lang } = useI18n(); const [open, setOpen] = useState(false);
  return <aside className={`fixed bottom-4 z-50 size-16 ${lang === 'ar' ? 'left-4' : 'right-4'}`}>{open && <div className={`absolute bottom-20 max-h-[calc(100dvh-7rem)] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto bg-background shadow-xl ${lang === 'ar' ? 'left-0' : 'right-0'}`}><LicensingAssistant onClose={() => setOpen(false)} /></div>}<Button size="icon" className="size-16 rounded-full shadow-lg" aria-expanded={open} aria-label={lang === 'ar' ? (open ? 'إغلاق المساعد' : 'فتح مساعد الموقع') : (open ? 'Close assistant' : 'Open portal assistant')} onClick={() => setOpen(v => !v)}><img src={chatbotAsset.url} alt="" className="size-12 object-contain" /></Button></aside>;
}