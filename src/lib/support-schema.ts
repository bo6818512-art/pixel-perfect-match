import { z } from "zod";

export const supportSchema = z.object({
  kind: z.enum(["question", "feedback", "complaint"]),
  name: z.string().trim().min(1, "يرجى إدخال الاسم").max(100),
  email: z.string().trim().email("يرجى إدخال بريد إلكتروني صحيح").max(255),
  phone: z.string().trim().max(30),
  complaintType: z.string().trim().max(100),
  message: z.string().trim().min(1, "يرجى كتابة الرسالة").max(5000),
}).superRefine((data, ctx) => {
  if (data.kind !== "complaint") return;
  if (!/^[+\d\s()-]{7,30}$/.test(data.phone)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "يرجى إدخال رقم تواصل صحيح" });
  if (!data.complaintType) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["complaintType"], message: "يرجى اختيار نوع الشكوى" });
});
export type SupportInput = z.infer<typeof supportSchema>;