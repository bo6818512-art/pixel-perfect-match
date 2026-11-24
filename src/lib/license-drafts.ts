import { z } from 'zod';
import { mapLocationSchema } from './map-location';
export const draftPayloadSchema = z.object({
  step: z.number().int().min(0).max(5), licenseType: z.enum(['unit', 'building']),
  buildingType: z.string().max(60), district: z.string().max(20), plotNumber: z.string().max(120),
  area: z.string().max(12), activity: z.string().max(500), ownerName: z.string().max(200), ownerType: z.enum(['company','individual','']).optional(),
  kind: z.enum(['new', 'renewal', 'activity_change', 'ownership_transfer']), parentId: z.string().max(36),
  selectedLocation: mapLocationSchema.optional(),
  propertyId: z.string().uuid().optional(), floor: z.string().max(40).optional(), unitNumber: z.string().max(40).optional(),
});
export const draftInputSchema = z.object({ id: z.string().uuid(), mode: z.enum(['new','renewal','amendment']), payload: draftPayloadSchema });
export type DraftPayload = z.infer<typeof draftPayloadSchema>;