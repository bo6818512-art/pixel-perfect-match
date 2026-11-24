import { describe, expect, it } from 'vitest';
import { canIssueLicense } from '@/lib/admin-policy';
import { registrationError } from '@/lib/auth-errors';
describe('Company administration rules', () => {
  const request = { paid_at: '2026-11-02T19:00:00Z', fee: 33000, status: 'under_review', deleted_at: null };
  it('requires confirmed payment before issuance', () => { expect(canIssueLicense(request)).toBe(true); expect(canIssueLicense({ ...request, paid_at: null })).toBe(false); });
  it('requires approved fees before issuance', () => { expect(canIssueLicense({ ...request, fee: null })).toBe(false); });
  it('does not reissue or issue a deleted request', () => { expect(canIssueLicense({ ...request, status: 'issued' })).toBe(false); expect(canIssueLicense({ ...request, deleted_at: '2026-11-02T19:01:00Z' })).toBe(false); });
  it('classifies signup retry and password failures separately', () => { expect(registrationError('weak_password', '')).not.toEqual(registrationError('over_email_send_rate_limit', '')); });
  it('classifies undeliverable confirmation email distinctly from generic failures', () => { expect(registrationError('unknown', 'Email to this address could not be delivered recently')).not.toEqual(registrationError('unknown', 'Network failed')); });
});