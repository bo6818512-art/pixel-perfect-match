import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql = readFileSync('drizzle/migrations/0000_import_portal_schema.sql','utf8');
describe('Draft privacy and renewal reminders', () => {
  it('restricts draft reads and writes to their owner', () => { expect(sql).toContain('USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid())'); });
  it('deduplicates reminders for the same expiry event', () => { expect(sql).toContain('CREATE UNIQUE INDEX account_notifications_event_key'); expect(sql).toContain('ON CONFLICT(event_key) WHERE event_key IS NOT NULL DO NOTHING'); });
  it('only reminds issued, non-deleted licenses within thirty days', () => { expect(sql).toContain("r.status='issued' AND r.deleted_at IS NULL"); expect(sql).toContain("r.expires_at<=now()+interval '30 days'"); });
  it('prevents applicants from generating renewal notifications', () => { expect(sql).toContain('REVOKE ALL ON FUNCTION public.send_license_renewal_alerts() FROM PUBLIC,anon,authenticated'); });
});