import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll, beforeEach, afterAll, expect, it } from 'vitest';
const user='11111111-1111-4111-8111-111111111111';
const plot='22222222-2222-4222-8222-222222222222';
let db:PGlite;
beforeAll(async()=>{
  db=new PGlite();
  await db.exec(`CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role;CREATE SCHEMA auth;CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${user}'::uuid $$;
    CREATE TABLE public.license_requests(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid DEFAULT '${user}',kind text DEFAULT 'new',parent_id uuid,status text DEFAULT 'under_review',deleted_at timestamptz,expires_at timestamptz,district text,plot_number text,selected_location jsonb);`);
  await db.exec(readFileSync('drizzle/migrations/0001_temporary_request_tracking.sql','utf8'));
  await db.exec(readFileSync('drizzle/migrations/0002_prevent_duplicate_plot_licensing.sql','utf8'));
},30000);
beforeEach(async()=>{await db.exec(`TRUNCATE public.license_requests,public.licensing_plots;INSERT INTO public.licensing_plots(id,code,district) VALUES('${plot}','P1','FIN')`);});
afterAll(async()=>{await db?.close();});
const insert=()=>db.query<{id:string}>(`INSERT INTO public.license_requests(property_id,district,plot_number) VALUES('${plot}','FIN','P1') RETURNING id`);
it('blocks an in-progress request even when another unit is supplied',async()=>{
  await insert();
  await expect(db.exec(`INSERT INTO public.license_requests(property_id,district,plot_number,floor,unit_number) VALUES('${plot}','FIN','P1','2','other')`)).rejects.toThrow('already licensed or under review');
});
it('blocks an active issued license',async()=>{
  await insert();await db.exec(`UPDATE public.license_requests SET status='issued',expires_at=now()+interval '1 year'`);
  await expect(insert()).rejects.toThrow('already licensed or under review');
});
it('allows only one concurrent request for a plot',async()=>{
  const r=await Promise.allSettled([insert(),insert()]);
  expect(r.filter(v=>v.status==='fulfilled')).toHaveLength(1);
});
it('directs an expired owner license to renewal and accepts that renewal',async()=>{
  const r=await insert();const id=r.rows[0]?.id;if(!id)throw new Error('Missing request');
  await db.exec(`UPDATE public.license_requests SET status='issued',expires_at=now()-interval '1 day'`);
  await expect(insert()).rejects.toThrow('use Renew');
  const renewed=await db.query(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES('renewal',$1,'FIN','P1') RETURNING id`,[id]);
  expect(renewed.rows).toHaveLength(1);
});
it('does not reserve expired land against a different owner',async()=>{
  await insert();await db.exec(`UPDATE public.license_requests SET status='issued',expires_at=now()-interval '1 day',user_id='33333333-3333-4333-8333-333333333333'`);
  expect((await insert()).rows).toHaveLength(1);
});