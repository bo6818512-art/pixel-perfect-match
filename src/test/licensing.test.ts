import { describe, expect, it } from 'vitest';
import { buildings, hasAllDocuments, unitFee, requestSchema, searchBlocks } from '@/lib/licensing';
describe('Temporary plot ranges', () => {
  it('shows all MU plot examples from MU-1 through MU-48', () => {
    expect(searchBlocks('MU', '').flatMap(b => b.plots)).toHaveLength(48);
    expect(searchBlocks('INV', 'b 1')).toEqual([{ block: 'B1', plots: Array.from({ length: 15 }, (_, i) => `B1-${i + 1}`) }]);
    expect(searchBlocks('INV', 'B1-1').flatMap(b => b.plots)).toEqual(['B1-1', 'B1-10', 'B1-11', 'B1-12', 'B1-13', 'B1-14', 'B1-15']);
  });
});
describe('Licensing fees', () => {
  it.each([['compounds',33000],['schools',22000],['clubs',22000],['malls',22000],['administrative',22000],['mixed',21000],['fuel',21000]])('%s costs %i EGP', (id, fee) => expect(buildings.find(b => b.id === id)?.fee).toBe(fee));
  it.each([[1,4000],[50,4000],[51,5000],[100,5000],[151,7000],[200,7000],[201,11000]])('%i sqm costs %i EGP', (area, fee) => expect(unitFee(area)).toBe(fee));
  it('does not invent the unspecified 101–150 price', () => { expect(unitFee(101)).toBeNull(); expect(unitFee(150)).toBeNull(); });
  it('requires a positive whole-number area', () => { expect(unitFee(0)).toBeNull(); expect(unitFee(50.5)).toBeNull(); });
  it('requires all twelve distinct document slots', () => { expect(hasAllDocuments(Array.from({ length:12 },(_,i)=>i+1))).toBe(true); expect(hasAllDocuments(Array.from({ length:11 },(_,i)=>i+1))).toBe(false); expect(hasAllDocuments(Array(12).fill(1))).toBe(false); });
  it('requires a parent request for renewal and amendments', () => { const base = { id:'11111111-1111-4111-8111-111111111111', licenseType:'building', buildingType:'malls', plotNumber:'A1', activity:'تجارة', ownerName:'اسم المالك', documents:Array.from({length:12},(_,i)=>({slot:i+1,path:`${i+1}.pdf`,name:'file.pdf'})) }; for (const kind of ['renewal','activity_change','ownership_transfer']) { expect(requestSchema.safeParse({...base,kind}).success).toBe(false); expect(requestSchema.safeParse({...base,kind,parentId:'22222222-2222-4222-8222-222222222222'}).success).toBe(true); } });
});
import { requestSchema as rs500 } from '@/lib/licensing';
import { describe as d500, it as i500, expect as e500 } from 'vitest';
d500('area above 500', () => {
  i500('rejects a unit request above 500 m²', () => {
    const docs = Array.from({ length: 12 }, (_, i) => ({ slot: i + 1, path: 'p', name: 'n' }));
    const r = rs500.safeParse({ id: crypto.randomUUID(), kind: 'new', licenseType: 'unit', district: 'GOV2', plotNumber: 'x', area: 501, activity: 'a', ownerName: 'o', documents: docs });
    e500(r.success).toBe(false);
  });
});
