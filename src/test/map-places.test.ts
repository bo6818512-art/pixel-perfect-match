import { describe, expect, it } from 'vitest';
import { mapPlacesInput, namedPlaceSelection, readNamedPlaces } from '@/lib/map-places';

describe('Named place selection across districts', () => {
  it("fills the identification with Primo's Pizza, not a fabricated parcel code", () => {
    expect(namedPlaceSelection({ id: 'primo', name: "Primo's Pizza", lat: 30.01, lng: 31.75 })).toEqual({ plotNumber: "Primo's Pizza", location: { lat: 30.01, lng: 31.75 } });
  });
  it('uses the selected name and coordinates for any other place', () => {
    expect(namedPlaceSelection({ id: 'other', name: 'Selected business', lat: 30.02, lng: 31.76 })).toEqual({ plotNumber: 'Selected business', location: { lat: 30.02, lng: 31.76 } });
  });
  it('rejects lookup centers outside the New Capital area', () => {
    expect(mapPlacesInput.safeParse({ center: { lat: 40, lng: 31.7 }, language: 'ar' }).success).toBe(false);
  });
  it('deduplicates provider markers and bounds the list to twenty', () => {
    const place = { id: 'one', displayName: { text: 'One' }, location: { latitude: 30, longitude: 31.7 } };
    expect(readNamedPlaces({ places: [place, place] })).toHaveLength(1);
    expect(readNamedPlaces({ places: Array.from({ length: 25 }, (_, i) => ({ ...place, id: String(i) })) })).toHaveLength(20);
  });
});