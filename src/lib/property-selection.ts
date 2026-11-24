import { z } from 'zod';

export const unitPlotCodes = ['H5', 'SI4', 'N1'] as const;
export const normalizePlotCode = (value: string) => value.trim().toUpperCase().replace(/[\s_]+/g, '');
export const plotRequiresUnit = (code: string, hasUnits = false) => hasUnits || (unitPlotCodes as readonly string[]).includes(normalizePlotCode(code));
export const propertySelectionSchema = z.object({
  propertyId: z.string().uuid(), floor: z.string().trim().max(40).optional(), unitNumber: z.string().trim().max(40).optional(),
});
export type PortalPlot = { id: string; code: string; district: string; has_units: boolean; latitude: number | null; longitude: number | null };
export function matchingPlots(plots: PortalPlot[], query: string) {
  const code = normalizePlotCode(query);
  return plots.filter(plot => normalizePlotCode(plot.code).startsWith(code));
}
export function validUnitSelection(code: string, hasUnits: boolean, floor: string, unit: string) {
  return !plotRequiresUnit(code, hasUnits) || Boolean(floor.trim() && unit.trim());
}