import { describe, expect, it } from 'vitest';
import { missingEnvironmentalSlots } from '@/lib/environmental';
describe('environmental documents', () => {
  it('requires every document except the swimming-pool drawings', () => { expect(missingEnvironmentalSlots([1, 2, 3, 4, 5, 6, 8])).toEqual([]); });
  it('reports missing authorization letter', () => { expect(missingEnvironmentalSlots([1, 2, 3, 4, 5, 6, 7])).toEqual([8]); });
});
