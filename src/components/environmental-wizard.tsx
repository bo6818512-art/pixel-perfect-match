import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { environmentalDocuments, environmentalNotes, missingEnvironmentalSlots } from '@/lib/environmental';
import { CheckCircle2, CreditCard, FileText, Info, Landmark, Upload } from 'lucide-react';

type Row = { id: string; project_name: string; status: string; payment_method: string; created_at: string };

export function EnvironmentalWizard() {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [files, setFiles] = useState<Record<number, File>>({});
  const [payment, setPayment] = useState<'visa_at_office' | 'online' | ''>('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [requestId] = useState(() => crypto.randomUUID());

  async function load() {
    const { data } = await supabase.from('environmental_requests').select('id, project_name, status, payment_method, created_at').order('created_at', { ascending: false });
    setRows(data ?? []);
  }
  useEffect(() => { void load(); }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step, done]);

  function goUpload() { if (projectName.trim().length < 2) { setError('يرجى إدخال اسم المشروع'); return; } setError(''); setStep(2); }
  function goPay() {
    const missing = missingEnvironmentalSlots(Object.keys(files).map(Number));
    if (missing.length) { setError(`يرجى رفع المستندات المطلوبة: ${missing.join('، ')}`); return; }
    setError(''); setStep(3);
  }

  async function submit() {
    if (payment !== 'visa_at_office') { setError('يرجى اختيار طريقة الدفع المتاحة'); return; }
    setBusy(true); setError('');
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id; if (!uid) throw new Error('يرجى تسجيل الدخول');
      const entries = Object.entries(files).map(([slot, file]) => ({ slot: Number(slot), file }));
      for (const { slot, file } of entries) {
        const sig = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer());
        if (sig !== '%PDF-') throw new Error(`المستند ${slot} ليس ملف PDF صالحًا.`);
      }
      let completed = 0; let cursor = 0;
      const docs = entries.map(({ slot, file }) => ({ slot, name: file.name, path: `${uid}/env-${requestId}/${slot}.pdf` }));
      async function worker() {
        while (cursor < entries.length) {
          const i = cursor++; const entry = entries[i]; const doc = docs[i]; if (!entry || !doc) return;
          const { error: e } = await supabase.storage.from('license-documents').upload(doc.path, entry.file, { contentType: 'application/pdf', upsert: true });
          if (e) throw e;
          setProgress(++completed);
        }
      }
      await Promise.all([worker(), worker(), worker()]);
      const { error: insertError } = await supabase.from('environmental_requests').insert({ id: requestId, user_id: uid, project_name: projectName.trim(), documents: docs, payment_method: 'visa_at_office' });
      if (insertError) throw insertError;
      setDone(true); void load();
    } catch (e) { setError(e instanceof Error && e.message ? e.message : 'تعذر إرسال الطلب. حاول مرة أخرى.'); }
    finally { setBusy(false); }
  }

  const list = rows.length > 0 && <section className="mt-10 rounded-md border bg-card p-6"><h2 className="mb-4 text-lg font-bold text-primary">طلباتي البيئية</h2><ul className="space-y-3">{rows.map(r => <li key={r.id} className="flex flex-wrap justify-between gap-2 border-b pb-3 text-sm"><span className="font-semibold">{r.project_name}</span><span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString('ar-EG')} — {r.status === 'under_review' ? 'قيد المراجعة' : r.status} — الدفع بالفيزا في مقر الشركة</span></li>)}</ul></section>;

  if (done) return <><div role="status" className="space-y-4 rounded-md border bg-card p-8 text-center"><CheckCircle2 className="mx-auto size-12 text-accent" /><h2 className="text-xl font-bold text-primary">تم تسجيل طلب الترخيص البيئي</h2><p>يرجى التوجه إلى مقر شركة العاصمة الإدارية للدفع بالفيزا، مع اصطحاب فلاشة عليها المستندات بصيغة PDF. سيتم إبلاغك بالرأي خلال مدة أقصاها 30 يومًا من تاريخ الاستلام.</p><Button asChild><Link to="/">الرئيسية</Link></Button></div>{list}</>;

  return <div className="space-y-6">
    <ol className="grid grid-cols-3 gap-2 text-center text-sm font-bold">{['المستندات المطلوبة', 'رفع المستندات', 'الدفع'].map((t, i) => <li key={t} className={`rounded-md border p-3 ${step === i + 1 ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'}`}>{i + 1}. {t}</li>)}</ol>

    {step === 1 && <section className="space-y-5 rounded-md border bg-card p-6">
      <label className="grid gap-2 text-sm font-semibold">اسم المشروع<Input value={projectName} maxLength={200} onChange={e => setProjectName(e.target.value)} className="h-12" /></label>
      <h2 className="text-lg font-bold text-primary">المستندات المطلوبة</h2>
      <ul className="space-y-3">{environmentalDocuments.map(d => <li key={d.slot} className="flex gap-3"><FileText className="mt-1 size-5 shrink-0 text-primary" /><div><p className="font-semibold">{d.slot}. {d.title}{!d.required && <span className="ms-2 text-xs text-muted-foreground">(حسب الحالة)</span>}</p>{'note' in d && d.note && <p className="text-sm text-muted-foreground">{d.note}</p>}</div></li>)}</ul>
      <div className="space-y-2 rounded-md bg-muted p-4 text-sm">{environmentalNotes.map(n => <p key={n} className="flex gap-2"><Info className="mt-0.5 size-4 shrink-0 text-primary" />{n}</p>)}</div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button className="h-12" onClick={goUpload}>التالي: رفع المستندات</Button>
    </section>}

    {step === 2 && <section className="space-y-4 rounded-md border bg-card p-6">
      <h2 className="text-lg font-bold text-primary">رفع المستندات (PDF)</h2>
      {environmentalDocuments.map(d => <label key={d.slot} className="grid gap-2 rounded-md border p-4 text-sm"><span className="font-semibold">{d.slot}. {d.title} {d.required ? <span className="text-destructive">*</span> : <span className="text-muted-foreground">(اختياري حسب الحالة)</span>}</span><span className="flex items-center gap-3"><Upload className="size-4 text-primary" /><input type="file" accept="application/pdf,.pdf" aria-label={`المستند ${d.slot}`} onChange={e => { const f = e.target.files?.[0]; setFiles(prev => { const next = { ...prev }; if (f) next[d.slot] = f; else delete next[d.slot]; return next; }); }} />{files[d.slot] && <CheckCircle2 className="size-4 text-accent" />}</span></label>)}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3"><Button variant="outline" onClick={() => { setError(''); setStep(1); }}>السابق</Button><Button onClick={goPay}>التالي: الدفع</Button></div>
    </section>}

    {step === 3 && <section className="space-y-4 rounded-md border bg-card p-6">
      <h2 className="text-lg font-bold text-primary">طريقة الدفع</h2>
      <label className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 ${payment === 'visa_at_office' ? 'border-primary' : ''}`}><input type="radio" name="pay" checked={payment === 'visa_at_office'} onChange={() => setPayment('visa_at_office')} /><Landmark className="size-5 text-primary" /><span><b>الدفع بالفيزا داخل مقر شركة العاصمة</b><br /><span className="text-sm text-muted-foreground">توجّه إلى مقر الشركة للدفع مع اصطحاب فلاشة عليها المستندات بصيغة PDF.</span></span></label>
      <label className="flex items-start gap-3 rounded-md border p-4 opacity-60"><input type="radio" name="pay" disabled /><CreditCard className="size-5 text-primary" /><span><b>الدفع أونلاين</b><br /><span className="text-sm text-muted-foreground">غير متاح حاليًا لحين ربط خدمة الدفع الإلكتروني.</span></span></label>
      {busy && <p className="text-sm">تم رفع {progress} من {Object.keys(files).length} مستندات…</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3"><Button variant="outline" disabled={busy} onClick={() => setStep(2)}>السابق</Button><Button disabled={busy} onClick={submit}>{busy ? 'جارٍ الإرسال…' : 'إرسال الطلب'}</Button></div>
    </section>}
    {list}
  </div>;
}
