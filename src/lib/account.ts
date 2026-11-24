import { z } from 'zod';
export const companySchema = z.object({
  name: z.string().trim().min(1).max(200), commercial_number: z.string().trim().min(1).max(100), commercial_path: z.string().min(1).max(400),
  tax_number: z.string().trim().min(1).max(100), tax_path: z.string().min(1).max(400), representative_name: z.string().trim().min(1).max(200),
  representative_national_id: z.string().regex(/^\d{14}$/), representative_phone: z.string().trim().min(7).max(30), representative_role: z.string().trim().min(1).max(100),
});
export const profileSchema = z.object({ full_name: z.string().trim().min(2).max(200), national_id: z.string().regex(/^\d{14}$/), phone: z.string().trim().min(7).max(30), account_type: z.enum(['individual','company']), company: companySchema.optional() }).superRefine((v,c) => {
  if (v.account_type === 'company' && !v.company) c.addIssue({ code:'custom',message:'بيانات الشركة ومستنداتها مطلوبة' });
});
export function renewalEligible(r: {status: string; expires_at: string | null}, now = Date.now()) {
  return r.status === 'issued' && r.expires_at !== null && Date.parse(r.expires_at) <= now + 60 * 86400000;
}
export function amendmentEligible(r: {status: string; expires_at: string | null}, now = Date.now()) {
  return r.status === 'issued' && r.expires_at !== null && Date.parse(r.expires_at) > now;
}
export function readDocumentSnapshot(value: unknown): Array<{id:number;name:string}> {
  return z.array(z.object({id:z.number().int().min(1).max(12),name:z.string()})).catch([]).parse(value);
}