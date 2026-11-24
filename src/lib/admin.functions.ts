import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { adminStatuses } from './admin-policy';

export const getCompanyAdminAccess = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (error) throw new Error('تعذر التحقق من صلاحية الحساب');
  return { isAdmin: data === true };
});
export const getAdminPortalData = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: authorized, error: denied } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (denied || !authorized) throw new Error('هذه الصفحة متاحة لإدارة شركة العاصمة فقط');
  const results = await Promise.all([
    context.supabase.from('license_requests').select('*').order('created_at', { ascending: false }),
    context.supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    context.supabase.from('support_submissions').select('*').order('created_at', { ascending: false }),
    context.supabase.from('admin_request_events').select('*').order('created_at', { ascending: false }),
  ]);
  if (results.some(r => r.error)) throw new Error('تعذر تحميل بيانات الإدارة');
  return { requests: results[0].data ?? [], profiles: results[1].data ?? [], support: results[2].data ?? [], events: results[3].data ?? [] };
});
export const reviewAdminRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), status: z.enum(adminStatuses), note: z.string().trim().min(1).max(2000), fee: z.number().int().positive().max(1000000).optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc('admin_review_request', { request_id: data.id, next_status: data.status, review_note: data.note, ...(data.fee === undefined ? {} : { reviewed_fee: data.fee }) });
    if (error) throw new Error('تعذر تحديث الطلب؛ إصدار الترخيص يتطلب تأكيد السداد وتحديد الرسوم.');
    return { ok: true };
  });
export const confirmTreasuryPayment = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), reference: z.string().trim().min(3).max(200) }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc('admin_confirm_treasury_payment', { request_id: data.id, receipt_reference: data.reference });
    if (error) throw new Error('تعذر تأكيد السداد؛ راجع الرسوم ورقم إيصال الخزنة.');
    return { ok: true };
  });
export const getAdminDocument = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), slot: z.number().int().min(1).max(12) }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: authorized } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!authorized) throw new Error('غير مصرح');
    const { data: request, error } = await context.supabase.from('license_requests').select('user_id').eq('id', data.id).single();
    if (error || !request) throw new Error('الطلب غير موجود');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const path = `${request.user_id}/${data.id}/${data.slot}.pdf`;
    const { data: signed, error: failed } = await supabaseAdmin.storage.from('license-documents').createSignedUrl(path, 60);
    if (failed || !signed) throw new Error('تعذر فتح المستند');
    return { url: signed.signedUrl };
  });
export const approveRequestDocuments = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), note: z.string().trim().min(1).max(2000), fee: z.number().int().positive().max(1000000).optional() }).parse(input))
  .handler(async ({ context, data }) => {
    const { error } = await context.supabase.rpc('admin_approve_documents', { request_id: data.id, review_note: data.note, ...(data.fee === undefined ? {} : { reviewed_fee: data.fee }) });
    if (error) throw new Error('تعذر قبول المستندات؛ تأكد من تحديد الرسوم لطلبات التجديد والتعديل.');
    return { ok: true };
  });
export const getAdminReceipt = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { data: authorized } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
    if (!authorized) throw new Error('غير مصرح');
    const { data: request, error } = await context.supabase.from('license_requests').select('receipt_path').eq('id', data.id).single();
    if (error || !request?.receipt_path) throw new Error('لا يوجد إيصال');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: signed, error: failed } = await supabaseAdmin.storage.from('license-documents').createSignedUrl(request.receipt_path, 60);
    if (failed || !signed) throw new Error('تعذر فتح الإيصال');
    return { url: signed.signedUrl };
  });
