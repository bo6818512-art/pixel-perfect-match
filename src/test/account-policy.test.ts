import { describe, expect, it } from 'vitest';
import { postLoginDestination } from '@/lib/portal-access';
describe('Account landing policy', () => {
  it('opens the main platform after successful authentication', () => {
    expect(postLoginDestination).toBe('/');
  });
});