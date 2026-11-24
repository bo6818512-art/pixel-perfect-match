import { z } from 'zod';

export const mapLocationSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
});
export type MapLocation = z.infer<typeof mapLocationSchema>;
export function readMapLocation(value: unknown): MapLocation | undefined {
  const result = mapLocationSchema.safeParse(value);
  return result.success ? result.data : undefined;
}