import { describe, expect, it } from 'vitest';
import { feeVisibleToApplicant, requestSchema } from '@/lib/licensing';

const docs = Array.from({ length: 12 }, (_, i) => ({ slot: i + 1, path: `u/r/${i + 1}.pdf`, name: 'a.pdf' }));
const base = { id: crypto.randomUUID(), propertyId: '33333333-3333-4333-8333-333333333333', kind: 'new' as const, licenseType: 'unit' as const, district: 'GOV2', plotNumber: 'G1-1', area: 40, activity: 'cafe', ownerName: 'Ali', documents: docs };

describe('approval-first licensing flow', () => {
  it('hides the fee until the admin approves the documents', () => {
    expect(feeVisibleToApplicant('awaiting_document_review')).toBe(false);
    expect(feeVisibleToApplicant('awaiting_payment')).toBe(true);
  });
  it('requires choosing company or individual owner for new requests', () => {
    expect(requestSchema.safeParse(base).success).toBe(false);
    expect(requestSchema.safeParse({ ...base, ownerType: 'company' }).success).toBe(true);
    expect(requestSchema.safeParse({ ...base, ownerType: 'individual' }).success).toBe(true);
  });
});
