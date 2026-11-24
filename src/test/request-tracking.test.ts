import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, it } from 'vitest';
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT NULL::uuid $$;
    CREATE TABLE public.license_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid());`);
  await db.exec(readFileSync('drizzle/migrations/0001_temporary_request_tracking.sql','utf8'));
},30000);
afterAll(async () => { await db?.close(); });
it('generates ACUD_0001 then ACUD_0002 in the database',async () => {
  const r=await db.query<{temp_track_id:string}>(`INSERT INTO public.license_requests DEFAULT VALUES RETURNING temp_track_id`);
  expect(r.rows[0]?.temp_track_id).toBe('ACUD_0001');
  const next=await db.query<{temp_track_id:string}>(`INSERT INTO public.license_requests DEFAULT VALUES RETURNING temp_track_id`);
  expect(next.rows[0]?.temp_track_id).toBe('ACUD_0002');
});
it('assigns distinct IDs to concurrent submissions and ignores supplied numbers',async () => {
  const results=await Promise.all(Array.from({length:8},()=>db.query<{temp_track_id:string}>(`INSERT INTO public.license_requests(temp_track_id,tracking_id) VALUES('FORGED','FORGED') RETURNING temp_track_id`)));
  expect(new Set(results.map(r=>r.rows[0]?.temp_track_id)).size).toBe(8);
  expect(results.every(r=>r.rows[0]?.temp_track_id.startsWith('ACUD_'))).toBe(true);
});
it('keeps the temporary number immutable while allowing a separate official number',async () => {
  await expect(db.exec(`UPDATE public.license_requests SET temp_track_id='ACUD_9999' WHERE temp_track_id='ACUD_0001'`)).rejects.toThrow('read-only');
  await db.exec(`UPDATE public.license_requests SET license_number='OFFICIAL-1' WHERE temp_track_id='ACUD_0001'`);
  const r=await db.query<{temp_track_id:string;license_number:string}>(`SELECT temp_track_id,license_number FROM public.license_requests WHERE temp_track_id='ACUD_0001'`);
  expect(r.rows[0]).toEqual({temp_track_id:'ACUD_0001',license_number:'OFFICIAL-1'});
});