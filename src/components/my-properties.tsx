import { queryOptions,useSuspenseQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { RefreshCw } from 'lucide-react';
import { getProperties } from '@/lib/account.functions';
import { propertySections } from '@/lib/properties';
import { renewalEligible } from '@/lib/account';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
export const propertiesOptions=queryOptions({queryKey:['my-properties'],queryFn:()=>getProperties()});
export function MyProperties(){
  const {data}=useSuspenseQuery(propertiesOptions);const {lang}=useI18n();const ar=lang==='ar';
  const {licenses,current,properties}=propertySections(data);
  const empty=<p className="py-6 text-muted-foreground">{ar?'لا توجد سجلات في حسابك.':'No records in your account.'}</p>;
  const unit=(r:typeof data[number])=>[r.plot_number,r.floor,r.unit_number].filter(Boolean).join(' / ');
  const statusLabels={active:ar?'ساري':'Active',expired:ar?'منتهي':'Expired',under_review:ar?'قيد المراجعة':'Under review',inactive:ar?'غير نشط':'Inactive'};
  return <div className="space-y-10">
    <section className="border-t pt-6"><h2 className="mb-5 text-xl font-bold">{ar?'تراخيصي الصادرة':'My Issued Licenses'}</h2>{licenses.length===0?empty:<div className="overflow-x-auto"><table className="w-full text-start text-sm"><thead className="border-b text-muted-foreground"><tr>{(ar?['الوحدة','النشاط','رقم الترخيص','تاريخ الانتهاء','']:['Unit','Activity','License Number','Expiry Date','']).map((h,i)=><th key={i} className="p-3 text-start">{h}</th>)}</tr></thead><tbody>{licenses.map(r=><tr key={r.id} className="border-b"><td className="p-3">{unit(r)}</td><td className="p-3">{r.activity}</td><td className="p-3" dir="ltr">{r.license_number||'—'}<span className="mt-1 block text-xs text-muted-foreground">{r.temp_track_id}</span></td><td className="p-3">{r.expires_at?new Date(r.expires_at).toLocaleDateString(ar?'ar-EG':'en-GB'):'—'}</td><td className="p-3">{renewalEligible(r)&&<Button asChild variant="outline" size="sm"><Link to="/my/renew-license" search={{request:r.id}}><RefreshCw/>{ar?'تجديد':'Renew'}</Link></Button>}</td></tr>)}</tbody></table></div>}</section>
    <section className="border-t pt-6"><h2 className="mb-5 text-xl font-bold">{ar?'طلباتي الجارية':'My Current Requests'}</h2>{current.length===0?empty:<ul className="divide-y">{current.map(r=><li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{unit(r)}</p><p dir="ltr" className="mt-1 text-sm text-muted-foreground">{r.temp_track_id}</p></div><Badge variant="secondary">{ar?({'awaiting_document_review':'بانتظار مراجعة المستندات','awaiting_payment':'بانتظار الدفع','awaiting_payment_review':'قيد مراجعة السداد','needs_info':'يحتاج استكمال','under_review':'قيد المراجعة'}[r.status]??r.status):r.status.replaceAll('_',' ')}</Badge><Button asChild variant="link"><Link to="/my/requests">{ar?'مراجعة الطلب':'Request Review'}</Link></Button></li>)}</ul>}</section>
    <section className="border-t pt-6"><h2 className="mb-5 text-xl font-bold">{ar?'عقاراتي / وحداتي':'My Properties / Units'}</h2>{properties.length===0?empty:<ul className="divide-y">{properties.map(({request:r,status})=><li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p className="font-semibold">{unit(r)}</p><p className="text-sm text-muted-foreground">{r.activity}</p></div><Badge variant={status==='active'?'default':'secondary'}>{statusLabels[status]}</Badge></li>)}</ul>}</section>
  </div>;
}