import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { profileSchema } from './account';
export const getAccount = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context}) => {
  const [profile,company,user] = await Promise.all([context.supabase.from('profiles').select('*').eq('id',context.userId).single(),context.supabase.from('companies').select('*').eq('user_id',context.userId).maybeSingle(),context.supabase.auth.getUser()]);
  if(profile.error || company.error || !user.data.user) throw new Error('تعذر تحميل بيانات الحساب');
  const {data:documents,error}=await context.supabase.from('application_documents').select('request_id,document_id,document_name,path,bucket');
  if(error) throw new Error('تعذر تحميل المستندات');
  return {profile:profile.data,company:company.data,email:user.data.user.email ?? '',documents:documents ?? []};
});
export const saveAccount = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>profileSchema.parse(v)).handler(async ({data,context})=>{
  const {error}=await context.supabase.rpc('save_portal_account',{p_data:data});
  if(error) throw new Error('تعذر حفظ البيانات؛ راجع المستندات والرقم القومي المتحقق منه.');
  return {ok:true};
});
export const saveContacts = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({phone:z.string().trim().min(7).max(30),representativePhone:z.string().trim().min(7).max(30).optional()}).parse(v)).handler(async ({data,context})=>{
  const {error}=await context.supabase.rpc('save_contact_details',{p_phone:data.phone,...(data.representativePhone ? {p_representative_phone:data.representativePhone} : {})});
  if(error) throw new Error('تعذر حفظ بيانات الاتصال / Could not save contact details');
  return {ok:true};
});
export const getRequiredDocuments = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({propertyId:z.string().uuid(),category:z.enum(['other','food_beverage'])}).parse(v)).handler(async ({data,context})=>{
  const {data:rows,error}=await context.supabase.rpc('required_plot_documents',{p_property:data.propertyId,p_category:data.category});
  if(error) throw new Error('تعذر تحميل المستندات المطلوبة'); return rows;
});
export const getRequestHistory = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data,error}=await context.supabase.from('admin_request_events').select('id,request_id,action,note,created_at').order('created_at');
  if(error) throw new Error('تعذر تحميل سجل الطلبات'); return data;
});
export const supplementDocument = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id:z.string().uuid(),slot:z.number().int().min(1).max(12),path:z.string().min(1).max(400)}).parse(v)).handler(async ({context,data})=>{
  const {error}=await context.supabase.rpc('submit_missing_document',{p_request:data.id,p_slot:data.slot,p_path:data.path});
  if(error) throw new Error('تعذر تسجيل المستند؛ تأكد أن الطلب يحتاج استكمالًا.'); return {ok:true};
});
export const resubmitDocuments = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({id:z.string().uuid()}).parse(v)).handler(async ({context,data})=>{
  const {error}=await context.supabase.rpc('resubmit_missing_documents',{p_request:data.id}); if(error) throw new Error('ارفع المستندات الناقصة أولًا'); return {ok:true};
});
export const getProperties = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async ({context})=>{
  const {data,error}=await context.supabase.from('license_requests').select('*').eq('user_id',context.userId).order('created_at',{ascending:false});
  if(error) throw new Error('تعذر تحميل أملاكي / Could not load properties');
  return data;
});