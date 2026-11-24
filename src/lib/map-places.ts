import { z } from 'zod';
import { mapLocationSchema } from './map-location';

export const mapPlacesInput = z.object({
  center: mapLocationSchema.extend({ lat: z.number().min(29.8).max(30.2), lng: z.number().min(31.5).max(32) }),
  query: z.string().trim().max(100).default(''),
  language: z.enum(['ar', 'en']),
});
export type NamedMapPlace = { id: string; name: string; lat: number; lng: number };
export function readNamedPlaces(input: unknown): NamedMapPlace[] {
  const parsed = z.object({ places: z.array(z.object({ id: z.string().min(1), displayName: z.object({ text: z.string().trim().min(1).max(120) }), location: z.object({ latitude: z.number(), longitude: z.number() }) })).default([]) }).safeParse(input);
  if (!parsed.success) return [];
  const seen = new Set<string>();
  return parsed.data.places.flatMap(p => {
    const point = mapLocationSchema.safeParse({ lat: p.location.latitude, lng: p.location.longitude });
    if (!point.success || seen.has(p.id)) return [];
    seen.add(p.id);
    return [{ id: p.id, name: p.displayName.text, ...point.data }];
  }).slice(0, 20);
}
export function namedPlaceSelection(place: NamedMapPlace) {
  return { plotNumber: place.name, location: { lat: place.lat, lng: place.lng } };
}