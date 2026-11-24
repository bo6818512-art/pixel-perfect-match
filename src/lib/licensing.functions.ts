import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { buildings, districts, feeVisibleToApplicant, receiptExtensions, requestSchema, unitFee } from './licensing';
import { z } from 'zod';
import { readMapLocation } from './map-location';
import { propertySelectionSchema } from './property-selection';

export const listApprovedPlots = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ district: z.string().min(1).max(20) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: plots, error } = await context.supabase.from('licensing_plots').select('id,code,district,has_units,latitude,longitude').eq('district', data.district).eq('enabled', true).order('code');
    if (error) throw new Error('تعذر تحميل قائمة القطع');
    return plots;
  });
export const checkPropertyAvailability = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => propertySelectionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: trackingId, error } = await context.supabase.rpc('check_license_property', { p_property_id: data.propertyId, p_floor: data.floor ?? '', p_unit_number: data.unitNumber ?? '' });
    if (error) throw new Error(error.message);
    return { trackingId };
  });

export const listLicenseRequests = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('license_requests').select('*').eq('user_id', context.userId).is('deleted_at', null).order('created_at', { ascending: false });
  if (error) throw new Error('تعذر تحميل الطلبات. حاولي مرة أخرى.');
  // Fees stay hidden from the applicant until the admin approves the documents.
  return data.map(r => feeVisibleToApplicant(r.status) ? r : { ...r, fee: null });
});
export const submitPaymentReceipt = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid(), path: z.string().min(1).max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    const ext = data.path.split('.').pop()?.toLowerCase() ?? '';
    if (!data.path.startsWith(`${context.userId}/${data.id}/receipt-`) || !(receiptExtensions as readonly string[]).includes(ext)) throw new Error('ملف الإيصال غير صالح.');
    const { error } = await context.supabase.rpc('submit_payment_receipt', { request_id: data.id, receipt_path: data.path });
    if (error) throw new Error('تعذر تسجيل إيصال الدفع. حاول مرة أخرى.');
    return { ok: true };
  });
export const deleteLicenseRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: removed, error } = await context.supabase.rpc('delete_own_license_request', { request_id: data.id });
    if (error || !removed) throw new Error('تعذر حذف الطلب. قد يكون محذوفًا بالفعل أو غير موجود في حسابك.');
    return { id: data.id };
  });
export const submitLicenseRequest = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => requestSchema.parse(input)).handler(async ({ data, context }) => {
    let details = data;
    if (data.kind !== 'new') {
      const { data: parent, error } = await context.supabase.from('license_requests').select('*').eq('id', data.parentId ?? '').eq('user_id', context.userId).eq('kind', 'new').is('deleted_at', null).single();
      if (error || !parent) throw new Error('الطلب الأصلي غير متاح.');
      details = { ...data, selectedLocation: readMapLocation(parent.selected_location), licenseType: parent.license_type as 'building' | 'unit', buildingType: parent.building_type ?? undefined, district: parent.district ?? undefined, plotNumber: parent.plot_number, area: parent.area ?? undefined, activity: data.kind === 'activity_change' ? data.activity : parent.activity, ownerName: data.kind === 'ownership_transfer' ? data.ownerName : parent.owner_name, ownerType: data.kind === 'ownership_transfer' ? (data.ownerType ?? (parent.owner_type as 'company' | 'individual' | null) ?? undefined) : ((parent.owner_type as 'company' | 'individual' | null) ?? undefined) };
    }
    const fee = data.kind === 'new' ? (details.licenseType === 'building' ? buildings.find(b => b.id === details.buildingType)?.fee : unitFee(details.area ?? 0)) : null;
    if (data.kind === 'new' && fee == null) throw new Error('لم يتم اعتماد سعر هذه المساحة بعد.');
    const { data: saved, error } = await context.supabase.from('license_requests').insert({
      id: data.id, user_id: context.userId, kind: data.kind, parent_id: data.parentId ?? null,
      license_type: details.licenseType, building_type: details.buildingType ?? null, district: details.district ?? null,
      plot_number: details.plotNumber, area: details.area ?? null, activity: details.activity, owner_name: details.ownerName, owner_type: details.ownerType ?? null,
      selected_location: details.selectedLocation ?? null, property_id: data.kind === 'new' ? details.propertyId ?? null : null,
      floor: data.kind === 'new' ? details.floor ?? null : null, unit_number: data.kind === 'new' ? details.unitNumber ?? null : null, activity_category: data.activityCategory,
      fee: fee ?? null, payment_method: 'offline', status: 'awaiting_document_review', documents: data.documents,
    }).select('id,tracking_id').single();
    if (error) {
      if (error.code === '23505') {
        const { data: trackingId } = data.propertyId ? await context.supabase.rpc('check_license_property', { p_property_id: data.propertyId, p_floor: data.floor ?? '', p_unit_number: data.unitNumber ?? '' }) : { data: null };
        throw new Error(`يوجد ترخيص أو طلب جاري على هذا العقار${trackingId ? `: ${trackingId}` : ''}`);
      }
      throw new Error('لم يتم حفظ الطلب. راجع المستندات المطلوبة للقطعة وموعد التجديد وحاول مرة أخرى.');
    }
    return { id: saved.id, trackingId: saved.tracking_id };
  });

export const getDistrictLocation = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ district: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const district = districts.find(d => d.id === data.district);
    if (!district) throw new Error('الحي غير متاح');
    const key = process.env['GOOGLE_MAPS_API_KEY']; const apiKey = process.env['LOVABLE_API_KEY'];
    if (!key || !apiKey) return { location: null, error: 'خريطة الحي غير متاحة حاليًا.' };
    const response = await fetch('https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText', {
      method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'X-Connection-Api-Key': key, 'Content-Type': 'application/json', 'X-Goog-FieldMask': 'places.location,places.displayName' },
      body: JSON.stringify({ textQuery: `${district.name} العاصمة الإدارية الجديدة مصر`, pageSize: 1, languageCode: 'ar' }),
    });
    if (!response.ok) {
      const body = await response.text(); console.error(`Maps [${response.status}]: ${body}`);
      if (response.status === 403) {
        let reason: string | undefined;
        try { const details = JSON.parse(body) as { error?: { details?: Array<{ reason?: string }> } }; reason = details.error?.details?.find(d => d.reason)?.reason; } catch { /* Non-JSON provider response. */ }
        if (reason === 'API_KEY_HTTP_REFERRER_BLOCKED') return { location: null, error: 'مفتاح خدمة الخرائط على الخادم مقيد بالمواقع. في Google Cloud، اضبطي قيود مفتاح الخادم على None أو IP addresses؛ اتركي مفتاح عرض الخريطة مقيدًا بالمواقع.' };
        if (reason === 'API_KEY_SERVICE_BLOCKED') return { location: null, error: 'مفتاح خدمة الخرائط لا يسمح ببحث الأحياء. في Google Cloud، فعّلي Places API (New) وأضيفيها إلى الخدمات المسموح بها لمفتاح الخادم.' };
        return { location: null, error: 'جوجل رفض بيانات الحي (403)؛ راجعي قيود مفتاح خدمة الخرائط في Google Cloud.' };
      }
      return { location: null, error: `تعذر تحميل خريطة الحي (${response.status}).` };
    }
    const result = await response.json() as { places?: Array<{ location?: { latitude: number; longitude: number }; displayName?: { text: string } }> };
    const place = result.places?.[0];
    return { location: place?.location ?? null, error: place?.location ? null : 'لم يتم العثور على موقع مؤكد للحي.' };
  });