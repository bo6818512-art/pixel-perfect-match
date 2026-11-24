import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const sql = readFileSync('drizzle/migrations/0000_import_portal_schema.sql', 'utf8');
describe('request removal safety', () => {
  it('allows only the signed-in owner to remove their request', () => {
    expect(sql).toContain('IF auth.uid() IS NULL');
    expect(sql).toContain('id = request_id AND user_id = auth.uid() AND deleted_at IS NULL');
    expect(sql).toContain('REVOKE ALL ON FUNCTION public.delete_own_license_request(uuid) FROM PUBLIC, anon');
  });
  it('preserves other requests and documents instead of cascading deletion', () => {
    expect(sql).toContain('SET deleted_at = now()');
    expect(sql).not.toMatch(/DELETE FROM (?:public\.license_requests|storage\.objects)/i);
  });
  it('prevents new follow-ups on a removed original', () => {
    expect(sql).toContain('id = NEW.parent_id AND deleted_at IS NOT NULL');
    expect(sql).toContain("RAISE EXCEPTION 'Original request was deleted'");
  });
});
