import { ReviewNote } from '@/components/review-note';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { listLicenseRequests } from '@/lib/licensing.functions';
import { money, ownerTypeLabels } from '@/lib/licensing';
import { PaymentReceiptUpload } from '@/components/payment-receipt-upload';
import { readMapLocation } from '@/lib/map-location';
import { useI18n } from '@/lib/i18n';
import { LicenseDraftList } from '@/components/license-draft-list';
function SelectedLocation({ value }: { value: unknown }) {
  const point = readMapLocation(value); const { lang } = useI18n();
  if (!point) return null;
  return <div><dt className="text-muted-foreground">{lang === 'ar' ? 'الموقع المختار (غير معتمد)' : 'Selected location (unverified)'}</dt><dd dir="ltr">{point.lat.toFixed(6)}, {point.lng.toFixed(6)}</dd></div>;
}
import { DeleteLicenseRequest } from '@/components/delete-license-request';
export const licenseRequestsOptions = queryOptions({ queryKey: ['license-requests'], queryFn: () => listLicenseRequests() });
const names: Record<string,string> = { new:'طلب ترخيص', renewal:'تجديد سنوي', activity_change:'تعديل نشاط', ownership_transfer:'نقل ملكية' };
const states: Record<string,string> = { awaiting_document_review:'بانتظار مراجعة المستندات', awaiting_payment:'بانتظار الدفع', awaiting_payment_review:'تم رفع الإيصال — قيد المراجعة', under_review:'قيد المراجعة', issued:'تم إصدار الرخصة', rejected:'مرفوض' };
export function LicenseRecords({ issuedOnly = false, searchable = false }: { issuedOnly?: boolean; searchable?: boolean }) {
  const { data } = useSuspenseQuery(licenseRequestsOptions); const [search, setSearch] = useState('');
  const rows = data.filter(r => (!issuedOnly || r.status === 'issued') && (!search || r.tracking_id.toLowerCase().includes(search.toLowerCase()) || r.plot_number.includes(search)));
  return <section className="space-y-6">{!issuedOnly && <LicenseDraftList />}{searchable && <ReviewNote />}{searchable && <label className="block font-bold">رقم الطلب أو الكود الخاص بقطعة الأرض<input value={search} onChange={e=>setSearch(e.target.value)} className="mt-2 w-full rounded-md border bg-background px-4 py-3" /></label>}<div className="flex flex-wrap gap-3">{searchable ? <Button asChild><Link to="/my/requests">طلباتي السابقة</Link></Button> : <><Button asChild><Link to="/my/new-request">طلب ترخيص المحال التجارية العامة</Link></Button><Button asChild variant="outline"><Link to="/my/renew-license">تجديد سنوي</Link></Button><Button asChild variant="outline"><Link to="/my/amend-license">تعديل نشاط / نقل ملكية</Link></Button></>}</div>{rows.length === 0 ? <p className="py-8 text-muted-foreground">{issuedOnly ? 'لا توجد تراخيص صادرة في حسابك حتى الآن.' : 'لا توجد طلبات مطابقة في حسابك.'}</p> : rows.map(r=><article key={r.id} className="space-y-4 rounded-md border bg-background p-6"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">{names[r.kind]} — {r.plot_number}</h2><div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{states[r.status]}</span><DeleteLicenseRequest id={r.id} label={`${names[r.kind]} — ${r.plot_number}`} /></div></div><p className="break-all text-sm text-muted-foreground">رقم الطلب: <span dir="ltr">{r.tracking_id}</span></p><dl className="grid gap-4 text-sm sm:grid-cols-2"><SelectedLocation value={r.selected_location} />{r.unit_number && <div><dt className="text-muted-foreground">الطابق / الوحدة</dt><dd>{r.floor} / {r.unit_number}</dd></div>}<div><dt className="text-muted-foreground">المالك{r.owner_type ? ` (${ownerTypeLabels[r.owner_type as keyof typeof ownerTypeLabels]})` : ''}</dt><dd>{r.owner_name}</dd></div><div><dt className="text-muted-foreground">النشاط</dt><dd>{r.activity}</dd></div>{r.area && <div><dt className="text-muted-foreground">المساحة</dt><dd>{r.area} متر مربع</dd></div>}{r.fee !== null && <div><dt className="text-muted-foreground">الرسوم</dt><dd>{money(r.fee)}</dd></div>}<div><dt className="text-muted-foreground">تاريخ الطلب</dt><dd>{new Date(r.created_at).toLocaleDateString('ar-EG')}</dd></div></dl><RequestStage status={r.status} id={r.id} fee={r.fee} /></article>)}</section>;
}
function RequestStage({ status, id, fee }: { status: string; id: string; fee: number | null }) {
  if (status === 'awaiting_document_review') return <p role="status" className="rounded-md border border-gold bg-muted p-4 leading-7">تم رفع جميع الملفات وفي انتظار مراجعة الإدارة للأوراق خلال 48 ساعة، وسيتم إخطاركم برسالة الدفع.</p>;
  if (status === 'awaiting_payment') return <PaymentReceiptUpload requestId={id} fee={fee} />;
  if (status === 'awaiting_payment_review' || status === 'under_review') return <p role="status" className="rounded-md border border-gold bg-muted p-4 leading-7">تم استلام إيصال الدفع. سيتم مراجعة الطلب وإصدار الترخيص خلال 30 يومًا من الدفع ورفع المستندات.</p>;
  return null;
}
