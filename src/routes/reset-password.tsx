import { useEffect, useState, type FormEvent } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { PortalFrame, portalHead } from '@/components/portal-frame';
import { PasswordField } from '@/components/password-field';
import { Button } from '@/components/ui/button';
import { passwordSchema } from '@/lib/auth-schema';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/reset-password')({
  head: () => portalHead('تعيين كلمة مرور جديدة', 'استعادة كلمة المرور لحسابك في بوابة تراخيص المحال العامة.'),
  component: ResetPassword,
});
function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const recoveryLink = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery';
    void supabase.auth.getUser().then(({ data }) => setReady(Boolean(data.user && (recoveryLink || sessionStorage.getItem('portal-password-recovery') === 'true'))));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || busy) return;
    const fields = new FormData(event.currentTarget);
    const parsed = passwordSchema.safeParse({ password: fields.get('password'), confirmPassword: fields.get('confirmPassword') });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'راجع البيانات'); return; }
    setBusy(true); setError('');
    try {
      const { error: failure } = await supabase.auth.updateUser({ password: parsed.data.password });
      if (failure) throw failure;
      sessionStorage.removeItem('portal-password-recovery'); setDone(true);
    } catch { setError('تعذر تغيير كلمة المرور. اطلب رابط استعادة جديدًا وحاول مرة أخرى.'); }
    finally { setBusy(false); }
  }
  return <PortalFrame title="تعيين كلمة مرور جديدة"><div className="auth-surface mx-auto max-w-lg space-y-5 p-6">{done ? <><p role="status">تم تغيير كلمة المرور بنجاح.</p><Button asChild><Link to="/my/requests">حسابي</Link></Button></> : ready ? <form onSubmit={submit} className="space-y-5"><fieldset disabled={busy} className="space-y-5"><PasswordField name="password" label="كلمة المرور الجديدة" signup /><PasswordField name="confirmPassword" label="تأكيد كلمة المرور" signup /></fieldset>{error && <p role="alert" className="text-destructive">{error}</p>}<Button disabled={busy} className="auth-primary-action h-12 w-full">{busy ? 'جارٍ الحفظ…' : 'حفظ كلمة المرور'}</Button></form> : <><p>افتح هذه الصفحة من رابط استعادة كلمة المرور المرسل إلى بريدك الإلكتروني.</p><Button asChild variant="link"><Link to="/signin">تسجيل دخول</Link></Button></>}</div></PortalFrame>;
}