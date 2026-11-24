import { describe, expect, it } from 'vitest';
import { readMapLocation } from '@/lib/map-location';
describe('Applicant map coordinates', () => {
  it('preserves the selected point without inventing a plot number', () => {
    expect(readMapLocation({ lat: 30.01, lng: 31.75 })).toEqual({ lat: 30.01, lng: 31.75 });
  });
  it('rejects impossible or nonnumeric coordinates', () => {
    for (const point of [{ lat: 91, lng: 31 }, { lat: 30, lng: 181 }, { lat: NaN, lng: 31 }, { lat: '30', lng: 31 }]) expect(readMapLocation(point)).toBeUndefined();
  });
});