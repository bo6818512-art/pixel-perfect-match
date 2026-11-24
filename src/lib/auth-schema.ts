import { z } from 'zod';
export const accountTypes = ['citizen', 'acud', 'capital_authority', 'developer'] as const;
export const accountTypeSchema = z.enum(accountTypes, { errorMap: () => ({ message: 'يرجى اختيار نوع الحساب' }) });
export const passwordSchema = z.object({
  password: z.string().min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف').max(128),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: 'كلمتا المرور غير متطابقتين', path: ['confirmPassword'] });
export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'يرجى إدخال الاسم').max(100),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{7,30}$/, 'يرجى إدخال رقم موبايل صحيح'),
  email: z.string().trim().email('يرجى إدخال بريد إلكتروني صحيح').max(255),
  nationalId: z.string().trim().regex(/^\d{14}$/, 'الرقم القومي يجب أن يتكون من 14 رقمًا'),
  accountType: accountTypeSchema,
  password: z.string().min(8, 'كلمة المرور يجب ألا تقل عن 8 أحرف').max(128),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, { message: 'كلمتا المرور غير متطابقتين', path: ['confirmPassword'] });