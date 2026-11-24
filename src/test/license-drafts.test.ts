import { describe, expect, it } from 'vitest';
import { draftInputSchema } from '@/lib/license-drafts';
const draft = { id: '12345678-1234-4234-8234-123456789012', mode: 'new', payload: { step: 0, licenseType: 'unit', buildingType: '', district: '', plotNumber: '', area: '', activity: '', ownerName: '', kind: 'new', parentId: '' } };
describe('Incomplete request drafts', () => {
  it('accepts an incomplete request without mandatory documents or fees', () => { expect(draftInputSchema.safeParse(draft).success).toBe(true); });
  it('preserves entered identification and area for restoration', () => { const parsed = draftInputSchema.parse({ ...draft, payload: { ...draft.payload, step: 2, plotNumber: 'MU-48', area: '80' } }); expect(parsed.payload.plotNumber).toBe('MU-48'); expect(parsed.payload.area).toBe('80'); });
  it('rejects invalid selected coordinates', () => { expect(draftInputSchema.safeParse({ ...draft, payload: { ...draft.payload, selectedLocation: { lat: 120, lng: 31 } } }).success).toBe(false); });
});