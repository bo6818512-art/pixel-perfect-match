import { useState, type FormEvent } from 'react';
import { queryOptions, useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Download, Eye, Save } from 'lucide-react';
import { getAccount, saveContacts } from '@/lib/account.functions';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/lib/i18n';

export const accountOptions=queryOptions({queryKey:['my-account'],queryFn:()=>getAccount()});
export function MyData(){
  const {data}=useSuspenseQuery(accountOptions);const {lang}=useI18n();const ar=lang==='ar';
  const save=useServerFn(saveContacts);const queryClient=useQueryClient();
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  const company=data.company;
  const documents=[...(company ? [{request_id:'company',document_id:2,document_name:ar?'السجل التجاري':'Commercial Register',path:company.commercial_path,bucket:'company-documents'},{request_id:'company',document_id:8,document_name:ar?'البطاقة الضريبية':'Tax Card',path:company.tax_path,bucket:'company-documents'}]:[]),...data.documents];
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const fields=new FormData(event.currentTarget);setBusy(true);setMessage('');
    try{
      await save({data:{phone:String(fields.get('phone')??''),...(company ? {representativePhone:String(fields.get('representativePhone')??'')} : {})}});
      const email=String(fields.get('email')??'').trim();
      if(email!==data.email){const {error}=await supabase.auth.updateUser({email});if(error)throw error;setMessage(ar?'تم حفظ الاتصال؛ تحقق من بريدك لتأكيد تغيير البريد الإلكتروني.':'Contacts saved. Check your email to confirm the address change.');}
      else setMessage(ar?'تم حفظ بيانات الاتصال.':'Contact details saved.');
      await queryClient.invalidateQueries({queryKey:['my-account']});
    }catch(e){setMessage(e instanceof Error?e.message:'Could not save');}finally{setBusy(false);}
  }
  async function openDocument(bucket:string,path:string,download:boolean){
    setMessage('');
    try{
      if(download){const {data:file,error}=await supabase.storage.from(bucket).download(path);if(error)throw error;const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download=path.split('/').pop()??'document.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
      else {const {data:url,error}=await supabase.storage.from(bucket).createSignedUrl(path,60);if(error)throw error;window.open(url.signedUrl,'_blank','noopener,noreferrer');}
    }catch{setMessage(ar?'تعذر فتح المستند.':'Could not open document.');}
  }
  const legal=[{label:ar?'الاسم الكامل':'Full name',value:data.profile.full_name},{label:ar?'الرقم القومي':'National ID',value:data.profile.national_id??''},...(company?[{label:ar?'اسم الشركة':'Company name',value:company.name},{label:ar?'السجل التجاري':'Commercial Register',value:company.commercial_number},{label:ar?'البطاقة الضريبية':'Tax Card',value:company.tax_number},{label:ar?'ممثل الشركة':'Company representative',value:company.representative_name},{label:ar?'الرقم القومي للممثل':'Representative national ID',value:company.representative_national_id},{label:ar?'صفة الممثل':'Representative role',value:company.representative_role}]:[])];
  return <div className="space-y-8">
    <section className="border-t pt-6"><h2 className="mb-5 text-xl font-bold">{ar?'بيانات الهوية':'Identity details'}</h2><dl className="grid gap-5 sm:grid-cols-2">{legal.map(field=><div key={field.label}><dt className="text-sm text-muted-foreground">{field.label}</dt><dd className="mt-1 break-words font-semibold">{field.value||'—'}</dd></div>)}</dl>{data.profile.national_id_verified_at&&<p className="mt-5 text-sm text-muted-foreground">{ar?'الهوية معتمدة':'Identity approved'}</p>}</section>
    <form onSubmit={submit} className="space-y-5 border-t pt-6"><h2 className="text-xl font-bold">{ar?'بيانات الاتصال':'Contact details'}</h2><div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2"><span>{ar?'رقم الهاتف':'Phone number'}</span><Input name="phone" type="tel" dir="ltr" defaultValue={data.profile.phone} required minLength={7} maxLength={30}/></label><label className="space-y-2"><span>{ar?'البريد الإلكتروني':'Email address'}</span><Input name="email" type="email" dir="ltr" defaultValue={data.email} required /></label>{company&&<label className="space-y-2"><span>{ar?'هاتف ممثل الشركة':'Representative phone'}</span><Input name="representativePhone" type="tel" dir="ltr" defaultValue={company.representative_phone} required minLength={7} maxLength={30}/></label>}</div><Button type="submit" disabled={busy}><Save/>{ar?'حفظ بيانات الاتصال':'Save contacts'}</Button></form>
    <section className="border-t pt-6"><h2 className="mb-5 text-xl font-bold">{ar?'مستنداتي':'My documents'}</h2>{documents.length===0?<p className="text-muted-foreground">{ar?'لا توجد مستندات مرفوعة.':'No uploaded documents.'}</p>:<ul className="divide-y">{documents.map(d=><li key={`${d.request_id}-${d.document_id}`} className="flex flex-wrap items-center justify-between gap-3 py-4"><span className="min-w-0 flex-1 break-words">{d.document_name}</span><div className="flex gap-2"><Button variant="outline" size="icon" title={ar?'عرض':'View'} aria-label={`${ar?'عرض':'View'} ${d.document_name}`} onClick={()=>void openDocument(d.bucket,d.path,false)}><Eye/></Button><Button variant="outline" size="icon" title={ar?'تنزيل':'Download'} aria-label={`${ar?'تنزيل':'Download'} ${d.document_name}`} onClick={()=>void openDocument(d.bucket,d.path,true)}><Download/></Button></div></li>)}</ul>}</section>
    {message&&<p role="status" className="text-sm text-primary">{message}</p>}
  </div>;
}