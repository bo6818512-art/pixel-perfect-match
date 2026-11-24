import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { matchingPlots, plotRequiresUnit, validUnitSelection, type PortalPlot } from '@/lib/property-selection';
import { requestSchema } from '@/lib/licensing';

const user = '11111111-1111-4111-8111-111111111111';
const property = '22222222-2222-4222-8222-222222222222';
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`CREATE ROLE authenticated; CREATE ROLE service_role; CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$ SELECT '${user}'::uuid $$;
    CREATE TABLE public.license_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT '${user}', kind text NOT NULL DEFAULT 'new', parent_id uuid, district text, plot_number text NOT NULL, status text NOT NULL DEFAULT 'awaiting_document_review', expires_at timestamptz, deleted_at timestamptz, selected_location jsonb);`);
  for (const file of ['0001_application_tracking_and_property_catalog','0002_enforce_property_license_conflicts','0003_tracking_default_and_followup_compatibility','0004_followups_require_valid_license']) await db.exec(readFileSync(`drizzle/migrations/${file}.sql`, 'utf8'));
}, 30000);
beforeEach(async () => {
  await db.exec(`TRUNCATE public.license_requests,public.licensing_plots; ALTER SEQUENCE public.license_tracking_counter RESTART WITH 1; INSERT INTO public.licensing_plots(id,code,district) VALUES ('${property}','H5','FIN');`);
});
afterAll(async () => { await db?.close(); });
const insert = (floor = '1', unit = '10', status = 'awaiting_document_review') => db.query<{ id: string; tracking_id: string }>(`INSERT INTO public.license_requests(property_id,district,plot_number,floor,unit_number,status) VALUES ($1,'FIN','H5',$2,$3,$4) RETURNING id,tracking_id`, [property, floor, unit, status]);

describe('database tracking numbers', () => {
  it('assigns ACUD_0001 and ACUD_0002 without frontend values', async () => {
    expect((await insert()).rows[0]?.tracking_id).toBe('ACUD_0001');
    expect((await insert('1','11')).rows[0]?.tracking_id).toBe('ACUD_0002');
  });
  it('grows past four digits without truncation', async () => {
    await db.exec('ALTER SEQUENCE public.license_tracking_counter RESTART WITH 10000');
    expect((await insert()).rows[0]?.tracking_id).toBe('ACUD_10000');
  });
  it('overrides applicant-supplied tracking numbers and rejects later changes', async () => {
    const r = await db.query<{ id: string; tracking_id: string }>(`INSERT INTO public.license_requests(property_id,district,plot_number,floor,unit_number,tracking_id) VALUES ($1,'FIN','H5','1','2','FORGED') RETURNING id,tracking_id`,[property]);
    expect(r.rows[0]?.tracking_id).toBe('ACUD_0001');
    await expect(db.query('UPDATE public.license_requests SET tracking_id=$1 WHERE id=$2',['ACUD_9000',r.rows[0]?.id])).rejects.toThrow('read-only');
  });
  it('keeps tracking numbers distinct for simultaneously queued submissions', async () => {
    const results = await Promise.all(Array.from({length: 10},(_,i) => insert('1',String(i))));
    expect(new Set(results.map(r => r.rows[0]?.tracking_id)).size).toBe(10);
  });
});
describe('database property slots', () => {
  it.each(['submitted','under_review','needs_info','approved','pending_payment','payment_review','processing','issued','awaiting_document_review','awaiting_payment','awaiting_payment_review'])('%s blocks the same property and unit', async status => {
    await insert('1','10',status);
    await expect(insert()).rejects.toThrow('ACUD_0001');
  });
  it.each(['rejected','cancelled','expired'])('%s does not block a new request', async status => {
    await insert('1','10',status); expect((await insert()).rows).toHaveLength(1);
  });
  it('allows distinct floors and unit numbers, but normalizes whitespace and case', async () => {
    await insert('G','A'); await insert('G','B'); await insert('1','A');
    await expect(insert(' g ',' a ')).rejects.toThrow('يوجد ترخيص أو طلب جاري');
  });
  it.each(['H5','SI4','N1'])('%s requires floor and unit even without has_units', async code => {
    await db.query('UPDATE public.licensing_plots SET code=$1 WHERE id=$2',[code,property]);
    await expect(db.query(`INSERT INTO public.license_requests(property_id,district,plot_number) VALUES ($1,'FIN',$2)`,[property,code])).rejects.toThrow('الطابق ورقم الوحدة مطلوبان');
  });
  it('treats NULL unit as one whole-plot slot', async () => {
    await db.query(`UPDATE public.licensing_plots SET code='P1' WHERE id=$1`,[property]);
    await db.query(`INSERT INTO public.license_requests(property_id,district,plot_number) VALUES ($1,'FIN','P1')`,[property]);
    await expect(db.query(`INSERT INTO public.license_requests(property_id,district,plot_number,floor,unit_number) VALUES ($1,'FIN','P1','2','other')`,[property])).rejects.toThrow('ACUD_0001');
  });
  it('only accepts one of two concurrent requests for the same slot', async () => {
    const results = await Promise.allSettled([insert(),insert()]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
  });
  it('rejects unknown property ids and district mismatches', async () => {
    await expect(db.query(`INSERT INTO public.license_requests(property_id,district,plot_number) VALUES (gen_random_uuid(),'FIN','UNKNOWN')`)).rejects.toThrow('كود القطعة غير موجود');
    await expect(db.query(`INSERT INTO public.license_requests(property_id,district,plot_number,floor,unit_number) VALUES ($1,'MU','H5','1','1')`,[property])).rejects.toThrow('القطعة لا تتبع الحي');
  });
  it('returns only the existing tracking id for a conflicting slot', async () => {
    await insert();
    const result = await db.query<{ tracking: string }>('SELECT public.check_license_property($1,$2,$3) AS tracking',[property,'1','10']);
    expect(result.rows).toEqual([{tracking:'ACUD_0001'}]);
  });
  it('makes property and unit immutable after submission', async () => {
    const saved = (await insert()).rows[0];
    if (!saved) throw new Error('Request missing');
    await expect(db.query('UPDATE public.license_requests SET unit_number=$1 WHERE id=$2',['99',saved.id])).rejects.toThrow('read-only');
  });
  it('preserves linked follow-ups but allows only one open follow-up', async () => {
    const saved = (await insert()).rows[0];
    if (!saved) throw new Error('Request missing');
    await db.query(`UPDATE public.license_requests SET status='issued', expires_at=now()+interval '6 months' WHERE id=$1`,[saved.id]);
    const followup = await db.query<{ property_id: string; unit_number: string }>(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES ('renewal',$1,'FIN','H5') RETURNING property_id,unit_number`,[saved.id]);
    expect(followup.rows).toEqual([{property_id:property,unit_number:'10'}]);
    await expect(db.query(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES ('activity_change',$1,'FIN','H5')`,[saved.id])).rejects.toThrow('license_one_open_followup');
  });
  it('rejects follow-ups before issuance and after the license expires', async () => {
    const saved = (await insert()).rows[0];
    if (!saved) throw new Error('Request missing');
    await expect(db.query(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES ('renewal',$1,'FIN','H5')`,[saved.id])).rejects.toThrow('ترخيص ساري');
    await db.query(`UPDATE public.license_requests SET status='issued', expires_at=now()-interval '1 day' WHERE id=$1`,[saved.id]);
    await expect(db.query(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES ('renewal',$1,'FIN','H5')`,[saved.id])).rejects.toThrow('ترخيص ساري');
    await expect(db.query(`INSERT INTO public.license_requests(kind,parent_id,district,plot_number) VALUES ('activity_change',$1,'FIN','H5')`,[saved.id])).rejects.toThrow('ترخيص ساري');
  });
});
describe('single plot catalog selection', () => {
  const plots: PortalPlot[] = [{id:property,code:'H5',district:'FIN',has_units:false,latitude:null,longitude:null}];
  it('autocompletes an existing code and rejects nonexistent codes', () => { expect(matchingPlots(plots,' h5 ')).toEqual(plots); expect(matchingPlots(plots,'H6')).toEqual([]); });
  it('requires exactly one property UUID, not free text or multiple selections', () => {
    const request = { id:user,kind:'new',licenseType:'unit',district:'FIN',plotNumber:'P1',area:40,activity:'shop',ownerName:'Owner',ownerType:'individual',documents:Array.from({length:12},(_,i)=>({slot:i+1,path:'p',name:'file.pdf'})) };
    expect(requestSchema.safeParse(request).success).toBe(false);
    expect(requestSchema.safeParse({...request,propertyId:[property,user]}).success).toBe(false);
    expect(requestSchema.safeParse({...request,propertyId:property}).success).toBe(true);
  });
  it.each(['H5','SI4','N1'])('%s requires both unit identifiers', code => { expect(plotRequiresUnit(code)).toBe(true); expect(validUnitSelection(code,false,'1','')).toBe(false); expect(validUnitSelection(code,false,'1','2')).toBe(true); });
});