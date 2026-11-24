import { describe, expect, it } from 'vitest';
import { accountTypeSchema, registrationSchema } from '@/lib/auth-schema';

const valid = { fullName: 'Test Person', phone: '01012345678', email: 'test@example.com', nationalId: '29001010123456', accountType: 'citizen', password: 'ExamplePass123', confirmPassword: 'ExamplePass123' };
describe('Registration details', () => {
  it.each(['citizen', 'acud', 'capital_authority', 'developer'])('accepts requested account category %s', accountType => { expect(registrationSchema.safeParse({ ...valid, accountType }).success).toBe(true); });
  it('rejects account categories outside the three options', () => { expect(accountTypeSchema.safeParse('superadmin').success).toBe(false); });
  it('requires national ID', () => { expect(registrationSchema.safeParse({ ...valid, nationalId: '' }).success).toBe(false); });
  it.each(['1234567890123', '123456789012345', 'abcdefghijklmno'])('rejects invalid national ID %s', nationalId => { expect(registrationSchema.safeParse({ ...valid, nationalId }).success).toBe(false); });
  it('requires matching password confirmation', () => { expect(registrationSchema.safeParse({ ...valid, confirmPassword: 'DifferentPass123' }).success).toBe(false); });
});