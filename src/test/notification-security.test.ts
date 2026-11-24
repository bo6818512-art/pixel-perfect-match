import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql = readFileSync('drizzle/migrations/0000_import_portal_schema.sql', 'utf8');
describe('Account event privacy', () => {
  it('limits notification reads to the owner', () => {
    expect(sql).toMatch(/FOR SELECT TO authenticated USING \(user_id = auth\.uid\(\)\)/);
  });
  it('only grants read-state updates, never applicant-created events', () => {
    expect(sql).toContain('GRANT UPDATE (read_at)');
    expect(sql).not.toMatch(/GRANT[^;]*INSERT[^;]*ON public\.account_notifications[^;]*TO authenticated/);
  });
  it('creates events on registration and request changes', () => {
    expect(sql).toContain('AFTER INSERT ON public.profiles');
    expect(sql).toContain('AFTER INSERT OR UPDATE ON public.license_requests');
  });
});