import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { deleteLicenseRequest } from '@/lib/licensing.functions';

export function DeleteLicenseRequest({ id, label }: { id: string; label: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const remove = useServerFn(deleteLicenseRequest);
  const queryClient = useQueryClient();
  async function confirm() {
    setBusy(true); setError('');
    try {
      await remove({ data: { id } });
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['license-requests'] }),
        queryClient.invalidateQueries({ queryKey: ['account-notifications'] }),
      ]);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر حذف الطلب.'); }
    finally { setBusy(false); }
  }
  return <>
    <Button variant="ghost" size="icon" className="shrink-0 text-destructive" aria-label={`حذف ${label}`} title="حذف الطلب" onClick={() => { setError(''); setOpen(true); }}><Trash2 className="size-5" /></Button>
    <AlertDialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}>
      <AlertDialogContent dir={document.documentElement.dir === "ltr" ? "ltr" : "rtl"}>
        <AlertDialogHeader className="text-right sm:text-right"><AlertDialogTitle>حذف الطلب؟</AlertDialogTitle><AlertDialogDescription>سيُحذف «{label}» من قائمة طلباتك. لن تُحذف طلبات التجديد أو التعديل الأخرى المرتبطة به، ويُحتفظ بسجل الطلب ومستنداته لدى الشركة.</AlertDialogDescription></AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <AlertDialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={() => setOpen(false)}>إلغاء</Button><Button variant="destructive" disabled={busy} onClick={confirm}><Trash2 />{busy ? 'جاري الحذف…' : 'تأكيد الحذف'}</Button></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>;
}