import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { mapPlacesInput, readNamedPlaces } from './map-places';

export const searchMapPlaces = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => mapPlacesInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env['GOOGLE_MAPS_API_KEY'];
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!key || !apiKey) throw new Error('Google Maps place search is not configured.');
    const circle = { center: { latitude: data.center.lat, longitude: data.center.lng }, radius: 1500 };
    const response = await fetch(`https://connector-gateway.lovable.dev/google_maps/places/v1/places:${data.query ? 'searchText' : 'searchNearby'}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'X-Connection-Api-Key': key, 'Content-Type': 'application/json', 'X-Goog-FieldMask': 'places.id,places.displayName,places.location' },
      body: JSON.stringify(data.query
        ? { textQuery: `${data.query} العاصمة الإدارية الجديدة مصر`, pageSize: 20, locationBias: { circle }, languageCode: data.language }
        : { locationRestriction: { circle }, maxResultCount: 20, languageCode: data.language }),
    });
    if (!response.ok) {
      const body = await response.text();
      console.error(`Maps places [${response.status}]: ${body}`);
      if (response.status === 403) {
        let reason: string | undefined;
        try { reason = (JSON.parse(body) as { error?: { details?: Array<{ reason?: string }> } }).error?.details?.find(d => d.reason)?.reason; } catch { /* Provider may return plain text. */ }
        if (reason === 'API_KEY_HTTP_REFERRER_BLOCKED') throw new Error('Google Maps server key is referrer-restricted. Set its application restrictions to None or IP addresses in Google Cloud Console.');
        if (reason === 'API_KEY_SERVICE_BLOCKED') throw new Error('Enable Places API (New) and allow it on the Google Maps server key in Google Cloud Console.');
        throw new Error(`Google Maps denied place search (403). Check server key restrictions. ${body}`);
      }
      throw new Error(`Google Maps place search [${response.status}]: ${body}`);
    }
    return readNamedPlaces(await response.json());
  });