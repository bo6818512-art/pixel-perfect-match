import { useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function AccountNotifications({ userId }: { userId: string }) {
  const client = useQueryClient();
  const key = ['account-notifications', userId];
  const { data: items = [], isPending, error } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from('account_notifications').select('id,title,message,created_at,read_at,request_id,license_requests(tracking_id)').eq('user_id', userId).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data.map(item => ({ ...item, message: item.license_requests?.tracking_id ? `${item.message} — ${item.license_requests.tracking_id}` : item.message }));
    },
    refetchInterval: 30000,
  });
  useEffect(() => {
    const channel = supabase.channel(`account-events-${userId}-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'account_notifications', filter: `user_id=eq.${userId}` }, () => { void client.invalidateQueries({ queryKey: ['account-notifications', userId] }); }).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [userId, client]);
  const unread = items.filter(item => !item.read_at).length;
  async function markRead(id?: string) {
    let update = supabase.from('account_notifications').update({ read_at: new Date().toISOString() }).eq('user_id', userId).is('read_at', null);
    if (id) update = update.eq('id', id);
    const { error } = await update;
    if (error) return;
    await client.invalidateQueries({ queryKey: key });
  }
  return <Popover><PopoverTrigger asChild><Button variant="ghost" size="icon" title="الإشعارات" aria-label={unread ? `الإشعارات، ${unread} غير مقروءة` : 'الإشعارات'} className="relative shrink-0"><Bell />{unread > 0 && <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-gold px-1 text-xs font-bold text-gold-foreground">{unread > 99 ? '99+' : unread}</span>}</Button></PopoverTrigger><PopoverContent align="end" dir="rtl" className="w-80 max-w-[calc(100vw-2rem)] p-0" aria-label="إشعارات الحساب"><div className="flex items-center justify-between border-b px-4 py-3"><h2 className="font-bold">الإشعارات</h2><Button variant="ghost" size="icon" disabled={!unread} title="تحديد الكل كمقروء" aria-label="تحديد الكل كمقروء" onClick={() => void markRead()}><CheckCheck /></Button></div><div className="max-h-96 overflow-y-auto" aria-live="polite">{isPending ? <p className="p-5 text-sm">تحميل الإشعارات…</p> : error ? <p role="alert" className="p-5 text-sm text-destructive">تعذر تحميل الإشعارات.</p> : !items.length ? <p className="p-5 text-sm text-muted-foreground">لا توجد إشعارات حتى الآن.</p> : items.map(item => <article key={item.id} className={`border-b p-4 last:border-0 ${item.read_at ? '' : 'bg-secondary'}`}><div className="flex justify-between gap-3"><h3 className="text-sm font-bold">{item.title}</h3>{!item.read_at && <Button variant="ghost" size="icon" className="size-7 shrink-0" title="تحديد كمقروء" aria-label="تحديد كمقروء" onClick={() => void markRead(item.id)}><CheckCheck /></Button>}</div><p className="mt-1 text-sm leading-7">{item.message}</p><time className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString('ar-EG')}</time>{item.request_id && <Button asChild variant="link" className="h-auto px-0"><Link to="/my/requests" onClick={() => void markRead(item.id)}>مراجعة الطلب</Link></Button>}</article>)}</div></PopoverContent></Popover>;
}