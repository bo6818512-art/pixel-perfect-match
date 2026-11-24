import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { draftInputSchema, draftPayloadSchema } from './license-drafts';
export const listLicenseDrafts = createServerFn({ method: 'GET' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.from('license_drafts').select('*').eq('user_id', context.userId).order('updated_at', { ascending: false });
  if (error) throw new Error('Could not load drafts. / تعذر تحميل المسودات.');
  return data.map(row => ({ ...row, payload: draftPayloadSchema.parse(row.payload) }));
});
export const saveLicenseDraft = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => draftInputSchema.parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('license_drafts').upsert({ ...data, user_id: context.userId, updated_at: new Date().toISOString() });
  if (error) throw new Error('Could not save draft. / تعذر حفظ المسودة.');
  return { id: data.id };
});
export const removeLicenseDraft = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const { error } = await context.supabase.from('license_drafts').delete().eq('id', data.id).eq('user_id', context.userId);
  if (error) throw new Error('Could not remove draft. / تعذر حذف المسودة.');
});