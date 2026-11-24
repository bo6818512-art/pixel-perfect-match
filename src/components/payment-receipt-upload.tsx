import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { money, receiptExtensions } from '@/lib/licensing';
import { submitPaymentReceipt } from '@/lib/licensing.functions';

export function PaymentReceiptUpload({ requestId, fee }: { requestId: string; fee: number | null }) {
  const [file, setFile] = useState<File>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = useServerFn(submitPaymentReceipt);
  const queryClient = useQueryClient();
  async function send() {
    if (!file) return;
    setBusy(true); setError('');
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!(receiptExtensions as readonly string[]).includes(ext)) throw new Error('ارفع صورة الإيصال (JPG أو PNG) أو ملف PDF.');
      if (file.size > 10 * 1024 * 1024) throw new Error('حجم الملف أكبر من 10 ميجابايت.');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('سجل الدخول أولًا.');
      const path = `${userData.user.id}/${requestId}/receipt-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('license-documents').upload(path, file, { contentType: file.type || undefined });
      if (uploadError) throw new Error('تعذر رفع الإيصال. حاول مرة أخرى.');
      await submit({ data: { id: requestId, path } });
      await queryClient.invalidateQueries({ queryKey: ['license-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['account-notifications'] });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر رفع الإيصال.'); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4 rounded-md border-2 border-gold bg-background p-5">
    <h3 className="flex items-center gap-2 text-lg font-bold"><Wallet className="size-6 text-primary" />تمت الموافقة على مستنداتك — الدفع</h3>
    {fee !== null && <p className="text-xl font-bold text-primary">الرسوم: {money(fee)}</p>}
    <p className="leading-7 text-muted-foreground">ادفع الرسوم في مقر شركة العاصمة الإدارية، ثم صوّر الإيصال وارفعه هنا.</p>
    <input type="file" accept="image/*,application/pdf,.pdf" aria-label="رفع صورة إيصال الدفع" onChange={e => setFile(e.target.files?.[0])} className="max-w-full text-sm file:ml-3 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-primary" />
    <Button disabled={!file || busy} onClick={send}><Upload />{busy ? 'جاري رفع الإيصال…' : 'رفع الإيصال'}</Button>
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>;
}
