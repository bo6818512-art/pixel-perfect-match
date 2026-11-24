import { useI18n } from "@/lib/i18n";
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { accountTypeSchema, registrationSchema, type accountTypes } from '@/lib/auth-schema';
import { postLoginDestination, type ServicePath } from '@/lib/portal-access';
import { usePortalAuth } from '@/components/portal-auth';
import { PasswordField } from '@/components/password-field';
import { registrationError } from '@/lib/auth-errors';
import { ArrowLeft, ArrowRight, Building2, Check, Landmark, MailCheck, UserRound } from 'lucide-react';

export function AuthForm({ signup = false, destination }: { signup?: boolean; destination: ServicePath }) {
  const navigate = useNavigate();
  const { user } = usePortalAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<typeof accountTypes[number] | ''>('');
  const { lang: language } = useI18n();
  const [remember, setRemember] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [recover, setRecover] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const en = language === 'en';
  useEffect(() => {
    const savedEmail = localStorage.getItem('portal-remembered-email');
    if (savedEmail) { setEmailValue(savedEmail); setRemember(true); }
  }, []);
  useEffect(() => {
    if (!user) return;
    sessionStorage.removeItem('portal-destination');
    void navigate({ to: postLoginDestination, replace: true });
  }, [user, destination, navigate]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get('email') ?? '').trim();
    const password = String(fields.get('password') ?? '');
    setError(''); setBusy(true);
    try {
      if (signup) {
        const result = registrationSchema.safeParse({ email, password, fullName: fields.get('fullName'), phone: fields.get('phone'), nationalId: fields.get('nationalId'), accountType, confirmPassword: fields.get('confirmPassword') });
        if (!result.success) { setError(result.error.issues[0]?.message ?? 'راجع البيانات'); return; }
        const { data, error: failure } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth`, data: { full_name: result.data.fullName, phone: result.data.phone, national_id: result.data.nationalId, requested_account_type: result.data.accountType } } });
        if (failure) throw failure;
        if (!data.session) setConfirmation(true);
      } else {
        const { error: failure } = await supabase.auth.signInWithPassword({ email, password });
        if (failure) throw failure;
        if (remember) localStorage.setItem('portal-remembered-email', email);
        else localStorage.removeItem('portal-remembered-email');
      }
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : '';
      const code = failure && typeof failure === 'object' && 'code' in failure && typeof failure.code === 'string' ? failure.code : undefined;
      setError(signup ? registrationError(code, message) : 'تعذر تسجيل الدخول. راجع البريد وكلمة المرور وتأكد من تأكيد بريدك.');
    }
    finally { setBusy(false); }
  }
  async function social(provider: 'google' | 'lovable') {
    setError(''); setBusy(true);
    sessionStorage.removeItem('portal-destination');
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: `${window.location.origin}/auth` });
      if (result.error) throw result.error;
    } catch { setError('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.'); }
    finally { setBusy(false); }
  }
  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const { error: failure } = await supabase.auth.resetPasswordForEmail(emailValue.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (failure) throw failure;
      setResetSent(true);
    } catch { setError('تعذر إرسال الرابط. يرجى المحاولة مرة أخرى.'); }
    finally { setBusy(false); }
  }
  const choices = [
    { value: 'citizen' as const, label: en ? 'Citizen' : 'مواطن', Icon: UserRound },
    { value: 'acud' as const, label: en ? 'New Administrative Capital company admin' : 'الادمن شركة العاصمة الادارية الجديدة', Icon: Building2 },
    { value: 'capital_authority' as const, label: en ? 'Capital Authority' : 'جهاز العاصمة', Icon: Landmark },
  ];
  if (confirmation) return <div role="status" className="auth-surface mx-auto max-w-xl space-y-5 p-8 text-center"><MailCheck className="mx-auto size-12 text-accent" /><h2 className="text-xl font-bold text-primary">راجع بريدك الإلكتروني لتأكيد الحساب</h2><p>اضغط على رابط التأكيد في رسالة البريد، ثم سجّل الدخول.</p><Button asChild><Link to="/signin" search={{ redirect: destination }}>تسجيل دخول</Link></Button></div>;
  return <div dir={en ? 'ltr' : 'rtl'} lang={language} className={`mx-auto space-y-7 ${signup ? 'max-w-3xl' : 'max-w-lg'}`}>
    {signup && <ol className="auth-steps grid grid-cols-2" aria-label={en ? 'Registration steps' : 'خطوات إنشاء الحساب'}>{[1, 2].map(item => <li key={item} className={`relative flex flex-col items-center gap-3 text-sm font-bold ${step >= item ? 'text-primary' : 'text-muted-foreground'}`} aria-current={step === item ? 'step' : undefined}><span className={`auth-step-icon ${step >= item ? 'auth-step-active' : ''}`}>{step > item ? <Check /> : item === 1 ? <Building2 /> : <UserRound />}</span><span>{item}. {item === 1 ? en ? 'Account type' : 'نوع الحساب' : en ? 'Account details' : 'بيانات الحساب'}</span></li>)}</ol>}
    <section className="auth-surface overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-6 py-5 text-primary"><span className="auth-heading-icon">{signup ? step === 1 ? <Building2 /> : <UserRound /> : <UserRound />}</span><h2 className="text-lg font-bold">{signup ? step === 1 ? en ? 'Choose account type' : 'نوع الحساب' : en ? 'User details' : 'بيانات المستخدم' : recover ? en ? 'Reset password' : 'استعادة كلمة المرور' : en ? 'Sign in to your account' : 'تسجيل الدخول إلى حسابك'}</h2></div>
      <div className="p-6 md:p-8">
        {signup && step === 1 ? <div className="space-y-6"><div role="radiogroup" aria-label={en ? 'Account type' : 'نوع الحساب'} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{choices.map(({ value, label, Icon }) => <label key={value} className={`auth-account-option ${accountType === value ? 'auth-account-selected' : ''}`}><input type="radio" name="accountType" value={value} checked={accountType === value} onChange={() => { setAccountType(value); setError(''); }} className="sr-only" /><span className="auth-choice-indicator">{accountType === value && <Check className="size-3" />}</span><Icon className="size-8 shrink-0" /><span className="text-center text-sm font-bold leading-7">{label}</span></label>)}</div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button className="auth-primary-action ms-auto flex h-12 min-w-36" onClick={() => { if (!accountTypeSchema.safeParse(accountType).success) { setError('يرجى اختيار نوع الحساب'); return; } setError(''); setStep(2); }}>{en ? 'Continue' : 'التالي'}{en ? <ArrowRight /> : <ArrowLeft />}</Button></div> : recover ? <form onSubmit={requestReset} className="space-y-5">{resetSent ? <p role="status">{en ? 'If your email is registered, a password reset link will be sent.' : 'إذا كان البريد مسجلًا، ستصلك رسالة بها رابط استعادة كلمة المرور.'}</p> : <><label className="grid gap-2 text-sm font-semibold">{en ? 'Email address' : 'البريد الإلكتروني'}<Input name="email" type="email" required maxLength={255} dir="ltr" value={emailValue} onChange={event => setEmailValue(event.target.value)} className="h-12" /></label>{error && <p role="alert" className="text-destructive">{error}</p>}<Button disabled={busy} className="auth-primary-action h-12 w-full">{en ? 'Send reset link' : 'إرسال رابط الاستعادة'}</Button></>}<Button type="button" variant="link" onClick={() => { setRecover(false); setError(''); }}>{en ? 'Back to sign in' : 'العودة لتسجيل الدخول'}</Button></form> : <form onSubmit={submit} className="space-y-6">
          {signup && <div className="flex flex-wrap items-center justify-between gap-2 text-sm"><span className="font-semibold text-primary">{choices.find(choice => choice.value === accountType)?.label}</span><Button type="button" variant="link" onClick={() => { setStep(1); setError(''); }}>{en ? 'Change account type' : 'تغيير نوع الحساب'}</Button></div>}
          <fieldset disabled={busy} className={`grid min-w-0 gap-5 ${signup ? 'sm:grid-cols-2' : ''}`}>
            {signup && <><label className="grid gap-2 text-sm font-semibold">{en ? 'Full name' : 'الاسم بالكامل'}<Input name="fullName" required autoComplete="name" maxLength={100} className="h-12 bg-background" /></label><label className="grid gap-2 text-sm font-semibold">{en ? 'National ID' : 'الرقم القومي'}<Input name="nationalId" required inputMode="numeric" dir="ltr" pattern="[0-9]{14}" minLength={14} maxLength={14} className="h-12 bg-background" /></label></>}
            <label className="grid gap-2 text-sm font-semibold">{en ? 'Email address' : 'البريد الإلكتروني'}<Input name="email" type="email" dir="ltr" required autoComplete="email" maxLength={255} value={emailValue} onChange={event => setEmailValue(event.target.value)} className="h-12 bg-background" /></label>
            {signup && <label className="grid gap-2 text-sm font-semibold">{en ? 'Mobile number' : 'رقم الهاتف المحمول'}<Input name="phone" type="tel" dir="ltr" required autoComplete="tel" maxLength={30} className="h-12 bg-background" /></label>}
            <PasswordField name="password" label={en ? 'Password' : 'كلمة المرور'} signup={signup} />
            {signup && <PasswordField name="confirmPassword" label={en ? 'Confirm password' : 'تأكيد كلمة المرور'} signup />}
          </fieldset>
          {!signup && <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} className="size-4 accent-primary" />{en ? 'Remember email' : 'تذكر البريد الإلكتروني'}</label><Button variant="link" type="button" className="h-auto p-0" onClick={() => { setRecover(true); setError(''); }}>{en ? 'Forgot password?' : 'نسيت كلمة المرور؟'}</Button></div>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">{signup && <Button type="button" variant="outline" disabled={busy} className="h-12" onClick={() => setStep(1)}>{en ? 'Back' : 'السابق'}</Button>}<Button type="submit" disabled={busy} className="auth-primary-action h-12 flex-1">{busy ? en ? 'Please wait…' : 'جارٍ المتابعة…' : signup ? en ? 'Create account' : 'إنشاء حساب' : en ? 'Sign in' : 'تسجيل دخول'}</Button></div>
        </form>}
      </div>
    </section>
    {!signup && !recover && <div className="grid gap-3"><Button variant="outline" className="h-11" disabled={busy} onClick={() => social('google')}>{en ? 'Continue with Google' : 'المتابعة باستخدام Google'}</Button></div>}
    <div className="border-t border-border pt-5 text-center"><Button variant="link" asChild className="h-auto whitespace-normal"><Link to={signup ? '/signin' : '/signup'} search={{ redirect: destination }}>{signup ? en ? 'Already have an account? Sign in' : 'لديك حساب؟ تسجيل دخول' : en ? 'New user? Create an account' : 'مستخدم جديد؟ إنشاء حساب'}</Link></Button></div>
  </div>;
}