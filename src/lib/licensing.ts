import { z } from 'zod';
import { mapLocationSchema } from './map-location';
import { plotRequiresUnit } from './property-selection';

export const buildings = [
  { id: 'compounds', name: 'كمبوندات', fee: 33000 },
  { id: 'schools', name: 'مدارس / حضانات', fee: 22000 },
  { id: 'clubs', name: 'نوادي', fee: 22000 }, { id: 'malls', name: 'مراكز تجارية (مولات)', fee: 22000 },
  { id: 'administrative', name: 'مباني ادارية', fee: 22000 }, { id: 'mixed', name: 'مباني متعددة الاستخدامات', fee: 21000 },
  { id: 'fuel', name: 'محطات وقود', fee: 21000 },
] as const;
export function buildingNameLabel(type: string) {
  const labels: Record<string, string> = { compounds: 'اسم الكمبوند', schools: 'اسم المدرسة / الحضانة', clubs: 'اسم النادي', malls: 'اسم المركز التجاري (المول)', administrative: 'اسم المبنى الإداري', mixed: 'اسم المبنى متعدد الاستخدامات', fuel: 'اسم محطة الوقود' };
  return labels[type] ?? 'اسم المبنى';
}
export const districts = [
  { id: 'DIP', name: 'الحي الدبلوماسي', description: 'مقرات السفارات والبعثات الدبلوماسية' },
  { id: 'FIN', name: 'حي المال والأعمال', description: 'الأبراج الإدارية والبنوك والشركات' },
  { id: 'GOV2', name: 'الحي الحكومي (GOV2)', description: 'الوزارات والمقرات والمباني الحكومية' },
  { id: 'INV', name: 'حي الاعمال المركزية بالعاصمة الادارية', description: 'المناطق الاستثمارية والخدمية والتجارية' },
  { id: 'R7', name: 'الحي السكني R7', description: 'حي سكني — بلوكات R7-1 إلى R7-3' },
  { id: 'R8', name: 'الحي السكني R8', description: 'حي سكني — بلوكات R8-1 إلى R8-3' },
  { id: 'MU', name: 'مناطق متعددة الاستخدامات', description: 'بلوكات MU1 إلى MU4 (48 قطعة)' },
] as const;
// Temporary example blocks until the company supplies the official plot list; numbering differs per district.
const temporaryBlockLayout: Record<string, { prefix: string; blocks: number; plots: number }> = {
  DIP: { prefix: 'D', blocks: 2, plots: 12 }, FIN: { prefix: 'F', blocks: 3, plots: 10 }, GOV2: { prefix: 'G', blocks: 3, plots: 8 },
  INV: { prefix: 'B', blocks: 4, plots: 15 }, R7: { prefix: 'R7-', blocks: 3, plots: 10 }, R8: { prefix: 'R8-', blocks: 3, plots: 10 }, MU: { prefix: 'MU', blocks: 4, plots: 12 },
};
export function temporaryBlocks(district: string) {
  const l = temporaryBlockLayout[district]; if (!l) return [];
  return Array.from({ length: l.blocks }, (_, b) => { const block = `${l.prefix}${b + 1}`; return { block, plots: Array.from({ length: l.plots }, (_, i) => `${block}-${i + 1}`) }; });
}
export const normalizePlotQuery = (q: string) => q.toUpperCase().replace(/[\s_]+/g, '').replace(/ب/g, 'B');
export function searchBlocks(district: string, q: string) {
  const n = normalizePlotQuery(q); const all = temporaryBlocks(district);
  if (!n) return all;
  const exact = all.filter(b => b.block === n);
  if (exact.length) return exact;
  return all.map(b => ({ ...b, plots: b.block.startsWith(n) ? b.plots : b.plots.filter(p => p.startsWith(n)) })).filter(b => b.plots.length);
}
export const requiredDocuments = [
  'تحقيق الشخصية (أفراد) أو الشكل القانوني (للشركات) أو توكيل رسمي بالإدارة في حالة التقديم بالمركز التكنولوجي',
  'مستخرج رسمي من السجل التجاري',
  'صورة من عقد الملكية / عقد الإيجار موثق بالشهر العقاري ومعتمد من شركة العاصمة الإدارية في التعامل واستخراج التراخيص، ويشار إليه في الخطاب',
  'صورة من رخصة البناء معتمدة بصورة طبق الأصل بخاتم الشركة',
  'إفادة من إدارة التراخيص بموقف المحل العام في حالة وجود رخصة بناء أو تقنين وضع العقار',
  'تقرير هندسي معتمد يثبت السلامة الإنشائية للعقار في حالة عدم وجود رخصة بناء أو تقنين وضع العقار أو مخالف لشروط الترخيص',
  'رسم توضيحي (كروكي) واضح به موقع المحل واسم الجهاز أو المنطقة واسم الشارع ورقم العقار (إن وجد)',
  'صورة من البطاقة الضريبية بعد الاطلاع على الأصل',
  'شهادات صحية للعاملين بالمحلات المتخصصة بتقديم وتحضير وتداول الأغذية والمشروبات',
  'صورة طبق الأصل من محضر الاستلام للمولات',
  'في حالة الإيجار من شركة العاصمة: صورة طبق الأصل من عقد الإيجار ومحضر الاستلام',
  'صورة من محضر الحماية المدنية للمبنى أو المحل المراد ترخيصه',
] as const;
export function unitFee(area: number): number | null {
  if (!Number.isInteger(area) || area <= 0) return null;
  if (area <= 50) return 4000;
  if (area <= 100) return 5000;
  if (area <= 150) return null;
  if (area <= 200) return 7000;
  return 11000;
}
export function hasAllDocuments(slots: number[]) {
  return slots.length === 12 && new Set(slots).size === 12 && slots.every(slot => Number.isInteger(slot) && slot >= 1 && slot <= 12);
}
export const money = (value: number) => `${value.toLocaleString('en-US')} جنيه مصري`;
export const requestSchema = z.object({
  id: z.string().uuid(), kind: z.enum(['new', 'renewal', 'activity_change', 'ownership_transfer']), parentId: z.string().uuid().optional(),
  licenseType: z.enum(['building', 'unit']), buildingType: z.string().optional(), district: z.string().optional(),
  plotNumber: z.string().trim().min(1).max(120), area: z.number().int().positive().optional(),
  selectedLocation: mapLocationSchema.optional(),
  propertyId: z.string().uuid().optional(), floor: z.string().trim().max(40).optional(), unitNumber: z.string().trim().max(40).optional(),
  activity: z.string().trim().min(1).max(300), ownerName: z.string().trim().min(1).max(200), ownerType: z.enum(['company', 'individual']).optional(),
  activityCategory: z.enum(['other','food_beverage']).default('other'),
  documents: z.array(z.object({ slot: z.number().int().min(1).max(12), path: z.string(), name: z.string().max(250), bucket: z.enum(['license-documents','company-documents']).optional() })).min(1).max(12),
}).superRefine((data, ctx) => {
  if (new Set(data.documents.map(d => d.slot)).size !== data.documents.length) ctx.addIssue({ code: 'custom', message: 'لا يمكن تكرار المستند' });
  if (data.kind === 'new' && !data.ownerType) ctx.addIssue({ code: 'custom', message: 'اختر نوع المالك' });
  if (data.kind === 'new' && !data.propertyId) ctx.addIssue({ code: 'custom', message: 'اختر قطعة معتمدة واحدة' });
  if (data.kind === 'new' && plotRequiresUnit(data.plotNumber) && (!data.floor?.trim() || !data.unitNumber?.trim())) ctx.addIssue({ code: 'custom', message: 'الطابق ورقم الوحدة مطلوبان' });
  if (data.kind !== 'new' && !data.parentId) ctx.addIssue({ code: 'custom', message: 'اختاري الطلب الأصلي' });
  if (data.kind === 'new' && data.licenseType === 'building' && !buildings.some(b => b.id === data.buildingType)) ctx.addIssue({ code: 'custom', message: 'اختاري نوع المبنى' });
  if (data.licenseType === 'unit' && (!districts.some(d => d.id === data.district) || !data.area)) ctx.addIssue({ code: 'custom', message: 'الحي والمساحة مطلوبان' });
  if (data.kind === 'new' && data.licenseType === 'unit' && (data.area ?? 0) > 500) ctx.addIssue({ code: 'custom', message: 'المساحة أكبر من 500 متر تُحسب كمبنى' });
  if (data.kind === 'new' && data.licenseType === 'unit' && unitFee(data.area ?? 0) === null) ctx.addIssue({ code: 'custom', message: 'سعر المساحة لم يتم اعتماده' });
});
export type LicenseInput = z.infer<typeof requestSchema>;
export const ownerTypeLabels = { company: 'شركة', individual: 'فرد' } as const;
/** The applicant only sees the fee after the admin approves the documents. */
export function feeVisibleToApplicant(status: string) {
  return !['awaiting_document_review', 'needs_info', 'rejected'].includes(status);
}
export const receiptExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp'] as const;
