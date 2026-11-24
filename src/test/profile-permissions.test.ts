import { PGlite } from '@electric-sql/pglite';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { portalDatabase, testUser } from './portal-database';
let db:PGlite;
beforeAll(async()=>{db=await portalDatabase();},30000);
afterAll(async()=>{await db?.close();});
it('locks national ID, name and account type after approval',async()=>{
  await db.query(`INSERT INTO public.user_roles(user_id,role) VALUES($1,'admin')`,[testUser]);
  await db.query(`SELECT public.verify_portal_identity($1)`,[testUser]);
  await expect(db.exec(`UPDATE public.profiles SET national_id='99999999999999'`)).rejects.toThrow('read-only');
  await expect(db.exec(`UPDATE public.profiles SET full_name='Changed legal name'`)).rejects.toThrow('read-only');
  await expect(db.exec(`UPDATE public.profiles SET account_type='company'`)).rejects.toThrow('read-only');
});
it('allows a contact update without changing approved identity',async()=>{
  await db.exec(`SELECT public.save_contact_details('01099999999')`);
  const row=await db.query<{phone:string;national_id:string}>(`SELECT phone,national_id FROM public.profiles WHERE id=$1`,[testUser]);
  expect(row.rows[0]).toEqual({phone:'01099999999',national_id:'12345678901234'});
});
it('does not let contact updates target another account',async()=>{
  const other='22222222-2222-4222-8222-222222222222';
  await db.query(`INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,'{"phone":"01011111111"}')`,[other]);
  await db.exec(`SELECT public.save_contact_details('01088888888')`);
  const r=await db.query<{phone:string}>(`SELECT phone FROM public.profiles WHERE id=$1`,[other]);
  expect(r.rows[0]?.phone).toBe('01011111111');
});