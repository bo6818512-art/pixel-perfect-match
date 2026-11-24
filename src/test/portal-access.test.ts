import { describe, expect, it } from 'vitest';
import { isServicePath, safeDestination } from '@/lib/portal-access';
import { registrationSchema } from '@/lib/auth-schema';
describe('Portal account requirements', () => {
  it.each(['/my/new-request', '/my/renew-license', '/my/amend-license', '/my/requests', '/my/licenses', '/inquiry', '/help'])('requires an account for %s', path => { expect(isServicePath(path)).toBe(true); });
  it('leaves the FAQ available without an account', () => { expect(isServicePath('/faq')).toBe(false); });
  it('leaves contact us available without an account', () => { expect(isServicePath('/contact')).toBe(false); });
  it('leaves complaints available without an account', () => { expect(isServicePath('/complaints')).toBe(false); });
  it('keeps the selected service destination', () => { expect(safeDestination('/my/new-request')).toBe('/my/new-request'); });
  it('rejects external redirect destinations', () => { expect(safeDestination('https://example.com')).toBe('/my/requests'); });
  const valid = { fullName: 'Test Person', phone: '01012345678', email: 'test@example.com', password: 'ExamplePass123', confirmPassword: 'ExamplePass123', nationalId: '29001010123456', accountType: 'citizen' };
  it('requires a name when creating an account', () => { expect(registrationSchema.safeParse(valid).success).toBe(true); expect(registrationSchema.safeParse({ ...valid, fullName: '' }).success).toBe(false); });
  it('requires a mobile number when creating an account', () => { expect(registrationSchema.safeParse({ ...valid, phone: '' }).success).toBe(false); });
});