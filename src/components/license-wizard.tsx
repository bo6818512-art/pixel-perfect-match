import { ReviewNote } from '@/components/review-note';
import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Link } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, ArrowLeft, ArrowRight, FileText, Upload, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { buildings, districts, requiredDocuments, unitFee, ownerTypeLabels, type LicenseInput } from '@/lib/licensing';
import { checkPropertyAvailability, listLicenseRequests, submitLicenseRequest } from '@/lib/licensing.functions';
import { uploadLicenseDocuments } from '@/lib/license-uploads';
import { useI18n } from '@/lib/i18n';
import { ApprovedPlotPicker } from '@/components/approved-plot-picker';
import { plotRequiresUnit, validUnitSelection, type PortalPlot } from '@/lib/property-selection';
import { readMapLocation, type MapLocation } from '@/lib/map-location';
import { listLicenseDrafts, saveLicenseDraft, removeLicenseDraft } from '@/lib/license-drafts.functions';
import type { DraftPayload } from '@/lib/license-drafts';
import { Save } from 'lucide-react';

export function LicenseWizard({ mode = 'new' }: { mode?: 'new' | 'renewal' | 'amendment' }) {
  const { lang } = useI18n();
  const [step, setStep] = useState(mode === 'new' ? 0 : 2);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [step]);
  const [licenseType, setLicenseType] = useState<'building' | 'unit'>('unit');
  const [buildingType, setBuildingType] = useState(''); const [district, setDistrict] = useState('');
  const [plotNumber, setPlotNumber] = useState(''); const [area, setArea] = useState('');
  const [propertyId, setPropertyId] = useState(''); const [hasUnits, setHasUnits] = useState(false);
  const [floor, setFloor] = useState(''); const [unitNumber, setUnitNumber] = useState('');
  const availability = useServerFn(checkPropertyAvailability);
  const [checking, setChecking] = useState(false);
  function pickPlot(plot: PortalPlot) { setPropertyId(plot.id); setPlotNumber(plot.code); setHasUnits(plot.has_units); setFloor(''); setUnitNumber(''); setError(''); setSelectedLocation(plot.latitude !== null && plot.longitude !== null ? { lat: plot.latitude, lng: plot.longitude } : undefined); }
  function resetProperty() { setPropertyId(''); setPlotNumber(''); setHasUnits(false); setFloor(''); setUnitNumber(''); setSelectedLocation(undefined); setError(''); }
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>();
  const [draftId, setDraftId] = useState('');
  const [draftMessage, setDraftMessage] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);
  const getDrafts = useServerFn(listLicenseDrafts);
  const storeDraft = useServerFn(saveLicenseDraft);
  const deleteDraft = useServerFn(removeLicenseDraft);
  const { data: drafts = [] } = useQuery({ queryKey: ['license-drafts'], queryFn: () => getDrafts() });
  const [activity, setActivity] = useState(''); const [ownerName, setOwnerName] = useState(''); const [ownerType, setOwnerType] = useState<'company' | 'individual' | ''>('');
  const [kind, setKind] = useState<LicenseInput['kind']>(mode === 'amendment' ? 'activity_change' : mode);
  const [parentId, setParentId] = useState(''); const [files, setFiles] = useState<Record<number, File>>({});
  const [requestId, setRequestId] = useState(''); const [savedId, setSavedId] = useState('');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const uploaded = useRef(new Map<number, File>());
  const attempted = useRef(new Set<number>());
  const submit = useServerFn(submitLicenseRequest); const list = useServerFn(listLicenseRequests); const queryClient = useQueryClient();
  const { data: requests = [] } = useQuery({ queryKey: ['license-requests'], queryFn: () => list(), enabled: mode !== 'new' });
  const parent = requests.find(r => r.id === parentId); const largeUnit = licenseType === 'unit' && Number(area) > 500; const effectiveType = largeUnit ? 'building' : licenseType; const fee = mode !== 'new' ? null : effectiveType === 'building' ? buildings.find(b => b.id === buildingType)?.fee ?? null : unitFee(Number(area));
  const districtInfo = districts.find(d => d.id === district);
  const canContinue = mode === 'new' ? !!propertyId && validUnitSelection(plotNumber, hasUnits, floor, unitNumber) && !!plotNumber.trim() && !!activity.trim() && !!ownerType && !!ownerName.trim() && fee !== null && (licenseType === 'building' || !!district) : !!parent && !!activity.trim() && !!ownerName.trim();
  const field = 'mt-2 w-full rounded-md border border-input bg-background px-4 py-3 text-foreground';
  function restoreDraft(id: string) {
    const draft = drafts.find(d => d.id === id && d.mode === mode); if (!draft) return;
    const p = draft.payload;
    setPropertyId(p.propertyId ?? ''); setFloor(p.floor ?? ''); setUnitNumber(p.unitNumber ?? ''); setHasUnits(plotRequiresUnit(p.plotNumber)); setDraftId(id); setStep(Math.min(p.step, 4)); setLicenseType(p.licenseType); setBuildingType(p.buildingType); setDistrict(p.district); setPlotNumber(p.plotNumber); setArea(p.area); setActivity(p.activity); setOwnerName(p.ownerName); setOwnerType(p.ownerType ?? ''); setKind(p.kind); setParentId(p.parentId); setSelectedLocation(p.selectedLocation); setFiles({}); setRequestId(''); uploaded.current.clear(); attempted.current.clear();
    setDraftMessage(lang === 'ar' ? 'تم استعادة المسودة. أعيدي اختيار المرفقات قبل تقديم الطلب.' : 'Draft restored. Select attachments again before submitting.');
  }
  async function saveDraft() {
    setDraftBusy(true); setDraftMessage('');
    const payload: DraftPayload = { ...(propertyId ? { propertyId } : {}), floor, unitNumber, step, licenseType, buildingType, district, plotNumber, area, activity, ownerName, ownerType, kind, parentId, ...(selectedLocation ? { selectedLocation } : {}) };
    try { const id = draftId || crypto.randomUUID(); await storeDraft({ data: { id, mode, payload } }); setDraftId(id); await queryClient.invalidateQueries({ queryKey: ['license-drafts'] }); setDraftMessage(lang === 'ar' ? 'تم حفظ المسودة في حسابك دون تقديم الطلب. المرفقات تحتاج إعادة اختيار عند العودة.' : 'Draft saved to your account, not submitted. Attachments must be selected again when returning.'); } catch(e) { setDraftMessage(e instanceof Error ? e.message : 'Could not save draft.'); } finally { setDraftBusy(false); }
  }
  function selectParent(id: string) {
    setParentId(id); const r = requests.find(r => r.id === id); if (!r) return;
    setPropertyId(r.property_id ?? ''); setFloor(r.floor ?? ''); setUnitNumber(r.unit_number ?? ''); setSelectedLocation(readMapLocation(r.selected_location));
    setLicenseType(r.license_type as 'building' | 'unit'); setBuildingType(r.building_type ?? ''); setDistrict(r.district ?? ''); setPlotNumber(r.plot_number); setArea(String(r.area ?? '')); setActivity(r.activity); setOwnerName(r.owner_name); setOwnerType((r.owner_type as 'company' | 'individual' | null) ?? '');
  }
  async function ensureAvailable() {
    if (mode !== 'new') return;
    if (!propertyId) throw new Error('اختر قطعة معتمدة واحدة');
    const result = await availability({ data: { propertyId, floor, unitNumber } });
    if (result.trackingId) throw new Error(`يوجد ترخيص أو طلب جاري على هذا العقار: ${result.trackingId}`);
  }
  async function continueStep() {
    setChecking(true); setError('');
    try { if (step === 2) await ensureAvailable(); setStep(step + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر التحقق من العقار'); }
    finally { setChecking(false); }
  }
  async function save() {
    setBusy(true); setError('');
    try {
      await ensureAvailable();
      const { data: userData } = await supabase.auth.getUser(); if (!userData.user) throw new Error('سجلي الدخول أولًا.');
      const id = requestId || crypto.randomUUID(); setRequestId(id);
      const documents = await uploadLicenseDocuments({ files, userId: userData.user.id, requestId: id, uploaded: uploaded.current, attempted: attempted.current, onProgress: setUploadCount,
        upload: async (path, file, replace) => {
          // Never delete on first upload; only retry/replacement needs cleanup.
          if (replace) {
            const { error: removeError } = await supabase.storage.from('license-documents').remove([path]);
            if (removeError) throw new Error('تعذر إعادة رفع المستند. حاولي مرة أخرى.');
          }
          const { error: uploadError } = await supabase.storage.from('license-documents').upload(path, file, { contentType: 'application/pdf' });
          if (uploadError) throw new Error(`تعذر رفع ${file.name}. حاولي مرة أخرى؛ المستندات المكتملة محفوظة.`);
        },
      });
      const result = await submit({ data: { id, kind, parentId: parentId || undefined, licenseType: effectiveType, buildingType: effectiveType === 'building' ? buildingType || undefined : undefined, district: district || undefined, plotNumber, propertyId: propertyId || undefined, floor, unitNumber, selectedLocation, area: area ? Number(area) : undefined, activity, ownerName, ownerType: ownerType || undefined, documents } });
      setSavedId(result.trackingId); if (draftId) { try { await deleteDraft({ data: { id: draftId } }); await queryClient.invalidateQueries({ queryKey: ['license-drafts'] }); } catch { /* Submitted request remains successful; draft can be removed later. */ } } await queryClient.invalidateQueries({ queryKey: ['license-requests'] }); await queryClient.invalidateQueries({ queryKey: ['account-notifications'] });
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر حفظ الطلب.'); } finally { setBusy(false); }
  }
  if (savedId) return <section className="space-y-6 border-t-4 border-gold pt-8"><Check className="size-12 text-primary" /><h2 className="text-2xl font-bold">تم رفع جميع الملفات</h2><p className="break-all text-muted-foreground">رقم الطلب: <span dir="ltr">{savedId}</span></p><p className="flex gap-3 rounded-md border border-gold bg-muted p-5 leading-8"><Clock className="mt-1 size-6 shrink-0 text-primary" />تم رفع جميع الملفات بنجاح، وفي انتظار مراجعة الإدارة للأوراق خلال 48 ساعة. سيتم إخطاركم برسالة الدفع بعد قبول المستندات.</p><Button asChild><Link to="/my/requests">متابعة طلباتي <ArrowLeft /></Link></Button></section>;
  return <div className="space-y-8">
    <div className="flex flex-wrap items-center gap-3"><Button type="button" variant="outline" disabled={busy || draftBusy} onClick={saveDraft}><Save />{lang === 'ar' ? (draftBusy ? 'جاري الحفظ…' : 'حفظ كمسودة') : (draftBusy ? 'Saving…' : 'Save draft')}</Button>{drafts.some(d => d.mode === mode) && <select className={field} aria-label={lang === 'ar' ? 'استكمال مسودة' : 'Resume draft'} value={draftId} onChange={e => restoreDraft(e.target.value)}><option value="">{lang === 'ar' ? 'استكمال مسودة محفوظة' : 'Resume a saved draft'}</option>{drafts.filter(d => d.mode === mode).map(d => <option key={d.id} value={d.id}>{d.payload.plotNumber || (lang === 'ar' ? 'طلب غير مكتمل' : 'Incomplete request')} — {new Date(d.updated_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</option>)}</select>}</div>
    {draftMessage && <p role="status" className="text-sm text-primary">{draftMessage}</p>}
    <ol aria-label="مراحل الطلب" className="flex flex-wrap gap-4 border-t-4 border-gold pt-6">{(['الشركة', 'نوع الترخيص', 'بيانات الطلب', 'المستندات', 'الرفع'] as const).map((label, index) => index === 1 ? null : <li key={label} className={`flex items-center gap-2 text-sm ${step === index ? 'font-bold text-primary' : 'text-muted-foreground'}`}><span className={`grid size-7 shrink-0 place-items-center rounded-full ${step >= index ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{index === 0 ? 1 : index}</span>{label}</li>)}</ol>
    {step === 0 && <section><h2 className="mb-6 text-2xl font-bold">اختيار الشركة</h2><Button variant="outline" className="portal-choice h-auto w-full justify-between whitespace-normal p-6 text-right text-lg font-bold" data-selected="false" onClick={() => { setLicenseType('unit'); setStep(2); }}><Building2 className="size-8" />شركة العاصمة الادارية للتنمية العمرانية<ArrowLeft /></Button></section>}
    {step === 1 && <section><h2 className="mb-6 text-2xl font-bold">نوع الترخيص</h2><div className="grid gap-5 md:grid-cols-2">{(['building','unit'] as const).map(type => <Button key={type} variant="outline" className="portal-choice h-40 flex-col whitespace-normal text-lg font-bold" data-selected="false" onClick={() => { setLicenseType(type); setStep(2); }}><Building2 className="size-10" />{type === 'building' ? 'ترخيص مبنى كامل' : 'ترخيص وحدة داخل مبنى'}<ArrowLeft /></Button>)}</div></section>}
    {step === 2 && <section className="space-y-6">
      {mode !== 'new' ? <><label className="block font-bold">الطلب الأصلي<select className={field} value={parentId} onChange={e => selectParent(e.target.value)}><option value="">اختاري الطلب</option>{requests.filter(r => r.kind === 'new' && r.status === 'issued' && r.expires_at && new Date(r.expires_at) > new Date()).map(r => <option key={r.id} value={r.id}>{r.plot_number} — {r.tracking_id}</option>)}</select></label>{requests.filter(r => r.kind === 'new' && r.status === 'issued' && r.expires_at && new Date(r.expires_at) > new Date()).length === 0 && <p className="text-muted-foreground">لا يوجد ترخيص ساري في حسابك. التجديد والتعديل متاحان فقط على ترخيص صادر ولم ينتهِ. <Link className="underline" to="/my/new-request">تقديم طلب ترخيص</Link></p>}{mode === 'amendment' && <div className="flex flex-wrap gap-3">{(['activity_change','ownership_transfer'] as const).map(k => <Button key={k} variant={kind === k ? 'default' : 'outline'} onClick={() => setKind(k)}>{k === 'activity_change' ? 'تعديل نشاط' : 'نقل ملكية'}</Button>)}</div>}<p className="text-muted-foreground">{mode === 'renewal' ? 'التجديد سنوي ومتاح فقط قبل انتهاء الترخيص الحالي. الرسوم متغيرة وتحددها الشركة بعد مراجعة الطلب.' : 'تعديل النشاط أو نقل الملكية متاح فقط على ترخيص ساري لم ينتهِ؛ الرسوم تحددها الشركة.'}</p></> : <>{licenseType === 'building' && <><h2 className="text-2xl font-bold">ترخيص مبنى كامل</h2><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{buildings.map(b => <Button key={b.id} variant={buildingType === b.id ? 'default' : 'outline'} className="portal-choice h-28 flex-col whitespace-normal text-base" data-selected={buildingType === b.id} onClick={() => setBuildingType(b.id)}><Building2 />{b.name}</Button>)}</div></>}<h2 className="text-2xl font-bold">أحياء ومناطق العاصمة الإدارية الجديدة</h2><div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">{districts.map(d => <Button key={d.id} variant={district === d.id ? 'default' : 'outline'} className="portal-choice h-36 items-start whitespace-normal p-5 text-right" data-selected={district === d.id} onClick={() => { setDistrict(d.id); resetProperty(); }}><span className="flex flex-col gap-2"><span className="text-xs">{d.id}</span><span className="text-lg font-bold">{d.name}</span><span className="text-xs font-normal">{d.description}</span></span></Button>)}</div>{district && <ApprovedPlotPicker key={district} district={district} name={districtInfo?.name ?? ''} selectedId={propertyId} onPick={pickPlot} onClear={resetProperty} onReset={() => { setDistrict(''); resetProperty(); }} />}</>}
      {(mode !== 'new' ? !!parent : !!propertyId) && <div className="grid gap-5 border-t pt-6 md:grid-cols-2">
        {mode === 'new' && plotRequiresUnit(plotNumber, hasUnits) && <><label className="font-bold">الطابق<input aria-label="الطابق" maxLength={40} className={field} value={floor} onChange={e => { setFloor(e.target.value); setError(''); }} /></label><label className="font-bold">رقم الوحدة<input aria-label="رقم الوحدة" maxLength={40} className={field} value={unitNumber} onChange={e => { setUnitNumber(e.target.value); setError(''); }} /></label></>}
        {mode === 'new' && licenseType === 'unit' && <label className="font-bold">مساحة الوحدة بالمتر المربع<input type="number" min="1" step="1" className={field} value={area} onChange={e => setArea(e.target.value)} /></label>}
        {mode === 'new' && largeUnit && <label className="font-bold">المساحة أكبر من 500 متر مربع — اختر نوع المبنى<select className={field} value={buildingType} onChange={e => setBuildingType(e.target.value)}><option value="">اختر نوع المبنى</option>{buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>}
        {mode === 'amendment' && kind === 'activity_change' && <label className="font-bold">النشاط الحالي (القديم)<input disabled className={field} value={parent?.activity ?? ''} readOnly /></label>}
        {mode === 'amendment' && kind === 'ownership_transfer' && <label className="font-bold">اسم المالك القديم<input disabled className={field} value={parent?.owner_name ?? ''} readOnly /></label>}
        <label className="font-bold">{kind === 'activity_change' ? 'النشاط الجديد' : 'النشاط'}<input disabled={mode === 'renewal' || kind === 'ownership_transfer'} className={field} value={activity} onChange={e => setActivity(e.target.value)} /></label>
        <label className="font-bold">{kind === 'ownership_transfer' ? 'نوع المالك الجديد' : 'نوع المالك'}<select disabled={mode === 'renewal' || kind === 'activity_change'} className={field} value={ownerType} onChange={e => { setOwnerType(e.target.value as 'company' | 'individual' | ''); setOwnerName(''); }}><option value="">اختر نوع المالك</option><option value="company">{ownerTypeLabels.company}</option><option value="individual">{ownerTypeLabels.individual}</option></select></label>
        {(ownerType || mode !== 'new') && <label className="font-bold">{ownerType === 'company' ? (kind === 'ownership_transfer' ? 'اسم الشركة الجديدة' : 'اسم الشركة') : ownerType === 'individual' ? (kind === 'ownership_transfer' ? 'اسم المالك الجديد (الفرد)' : 'اسم المالك (الفرد)') : 'اسم المالك'}<input disabled={mode === 'renewal' || kind === 'activity_change'} maxLength={200} className={field} value={ownerName} onChange={e => setOwnerName(e.target.value)} /></label>}
        {mode === 'new' && fee === null && area && Number(area) >= 101 && Number(area) <= 150 && <p className="text-lg font-bold text-destructive md:col-span-2">هذه المساحة (101 إلى 150 متر) غير متاحة للتقديم حاليًا.</p>}
      </div>}
    </section>}
    {step === 3 && <section><h2 className="mb-4 text-2xl font-bold">المستندات المطلوبة</h2><ol className="list-inside list-decimal divide-y">{requiredDocuments.map(doc => <li className="py-4 leading-7" key={doc}>{doc}</li>)}</ol></section>}
    {step === 4 && <section><div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-bold">رفع المستندات</h2><span className="font-bold text-primary">{Object.keys(files).length} / 12</span></div><div className="divide-y">{requiredDocuments.map((doc,i) => <label key={doc} className="flex flex-col gap-3 py-5"><span className="font-semibold">{i+1}. {doc}</span><span className="flex gap-2 text-sm text-muted-foreground"><FileText />{files[i+1]?.name ?? 'PDF'}</span><input type="file" accept="application/pdf,.pdf" aria-label={`رفع المستند ${i+1}`} onChange={e => { const file=e.target.files?.[0]; setFiles(previous => { const next={...previous}; if(file) next[i+1]=file; else delete next[i+1]; return next; }); }} className="max-w-full text-sm file:mr-0 file:ml-3 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-primary" /></label>)}</div><div className="mt-6"><ReviewNote /></div><p className="mt-6 leading-7 text-muted-foreground">بعد رفع المستندات ستراجعها الإدارة خلال 48 ساعة، ثم يظهر لك الدفع في الموقع.</p><Button disabled={busy || Object.keys(files).length !== 12} className="mt-4 h-auto whitespace-normal py-3" onClick={save}><Upload />{busy ? 'جاري رفع المستندات وحفظ الطلب…' : 'رفع المستندات وتقديم الطلب'}</Button></section>}
    {busy && <div role="status" aria-live="polite" className="space-y-2"><p className="text-sm font-semibold text-primary">{uploadCount === 12 ? 'اكتمل رفع المستندات — جاري حفظ الطلب…' : `تم رفع ${uploadCount} من 12 مستندًا…`}</p><progress aria-label="تقدم رفع المستندات" max={12} value={uploadCount} className="h-2 w-full accent-primary" /></div>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
    <div className="flex justify-between border-t pt-6">{step > (mode === 'new' ? 0 : 2) ? <Button disabled={busy} variant="outline" onClick={() => setStep(mode === 'new' && step === 2 ? 0 : step-1)}><ArrowRight />السابق</Button> : <span />}{step >= 2 && step < 4 && <Button onClick={() => void continueStep()} disabled={checking || (step === 2 ? !canContinue : false)}>{step === 3 ? 'متابعة لرفع المستندات' : 'التالي'}<ArrowLeft /></Button>}</div>
  </div>;
}