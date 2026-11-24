import { useEffect, useRef, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { loadLicensingMap } from '@/lib/google-map-loader';
import type { MapLocation } from '@/lib/map-location';
import { searchMapPlaces } from '@/lib/map-places.functions';
import type { NamedMapPlace } from '@/lib/map-places';

export function MapPointPicker({ center, value, onChange, onPlace }: { center: MapLocation; value: MapLocation | undefined; onChange: (point: MapLocation | undefined) => void; onPlace: (place: NamedMapPlace) => void }) {
  const { lang } = useI18n();
  const ar = lang === 'ar';
  const container = useRef<HTMLDivElement>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const placeCallback = useRef(onPlace);
  placeCallback.current = onPlace;
  const [searchText, setSearchText] = useState('');
  const [query, setQuery] = useState('');
  const search = useServerFn(searchMapPlaces);
  const callback = useRef(onChange);
  callback.current = onChange;
  const currentValue = useRef(value);
  currentValue.current = value;
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const { data: places = [], isFetching, error } = useQuery({ queryKey: ['map-places', center.lat, center.lng, query, lang], queryFn: () => search({ data: { center, query, language: lang } }), staleTime: 300000, retry: false, refetchOnWindowFocus: false });
  function selectPlace(place: NamedMapPlace) {
    mapRef.current?.panTo(place);
    placeCallback.current(place);
  }
  useEffect(() => {
    let disposed = false;
    let listener: google.maps.MapsEventListener | undefined;
    setState('loading');
    loadLicensingMap().then(maps => {
      if (disposed || !container.current) return;
      const map = new maps.Map(container.current, { center, zoom: 16, mapTypeId: 'satellite', clickableIcons: false, styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }], streetViewControl: false, gestureHandling: 'cooperative' });
      mapRef.current = map;
      marker.current = new maps.Marker({ map, ...(currentValue.current ? { position: currentValue.current } : {}), visible: !!currentValue.current });
      listener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return;
        const point = { lat: event.latLng.lat(), lng: event.latLng.lng() };
        marker.current?.setPosition(point);
        marker.current?.setVisible(true);
        callback.current(point);
      });
      setState('ready');
    }).catch(() => { if (!disposed) setState('error'); });
    return () => { disposed = true; listener?.remove(); marker.current?.setMap(null); marker.current = null; mapRef.current = null; };
  }, [center.lat, center.lng]);
  useEffect(() => {
    const map = mapRef.current;
    if (state !== 'ready' || !map) return;
    const markers = places.map(place => {
      const pin = new google.maps.Marker({ map, position: place, title: place.name, label: { text: place.name }, zIndex: 1 });
      const listener = pin.addListener('click', () => placeCallback.current(place));
      return { pin, listener };
    });
    return () => markers.forEach(({ pin, listener }) => { listener.remove(); pin.setMap(null); });
  }, [places, state]);
  useEffect(() => {
    marker.current?.setVisible(!!value);
    if (value) marker.current?.setPosition(value);
  }, [value]);
  return <div className="space-y-3">
    <form className="flex gap-2" onSubmit={e => { e.preventDefault(); setQuery(searchText.trim()); }}>
      <input maxLength={100} value={searchText} onChange={e => setSearchText(e.target.value)} aria-label={ar ? 'بحث باسم المكان' : 'Search by place name'} placeholder={ar ? 'اسم المكان' : 'Place name'} className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-foreground" />
      <Button type="submit" disabled={isFetching} variant="outline" aria-label={ar ? 'بحث الأماكن' : 'Search places'}><Search /></Button>
    </form>
    <div className="relative">
      <div ref={container} className="h-80 w-full md:h-96" aria-label={ar ? 'اختيار الموقع على خريطة جوجل' : 'Select location on Google Maps'} />
      {state !== 'ready' && <div role="status" className="absolute inset-0 grid place-items-center bg-muted p-6 text-center text-muted-foreground">{state === 'loading' ? (ar ? 'تحميل الخريطة…' : 'Loading map…') : (ar ? 'تعذر تحميل الخريطة التفاعلية. جرّبي الموقع المنشور.' : 'Unable to load the interactive map. Try the deployed website.')}</div>}
    </div>
    <p role="note" className="text-sm text-muted-foreground">{ar ? 'اسم المكان المختار يُملأ تلقائيًا، وليس رقم قطعة رسميًا؛ راجعيه مع مستندات الملكية.' : 'The selected place name is filled automatically, not an official parcel number; verify it against ownership documents.'}</p>
    {isFetching && <p role="status">{ar ? 'تحميل الأماكن…' : 'Loading places…'}</p>}
    {error && <p role="alert" className="text-sm text-destructive">{ar ? 'تعذر تحميل أسماء الأماكن. يمكنك كتابة الاسم يدويًا.' : 'Could not load place names. You can enter the name manually.'} <span>{error.message}</span></p>}
    {!isFetching && !error && places.length === 0 && <p role="status">{ar ? 'لم يتم العثور على أماكن؛ جرّبي البحث بالاسم.' : 'No places found; try searching by name.'}</p>}
    <div className="flex flex-wrap gap-2">{places.map(place => <Button key={place.id} type="button" variant="outline" className="h-auto whitespace-normal text-start" onClick={() => selectPlace(place)}><MapPin className="size-4 shrink-0" />{place.name}</Button>)}</div>
    {value && <div role="status" className="flex flex-wrap items-center justify-between gap-3 border border-gold bg-muted p-4 text-sm"><span className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" />{ar ? 'الموقع المختار' : 'Selected location'}: <b dir="ltr">{value.lat.toFixed(6)}, {value.lng.toFixed(6)}</b></span><Button type="button" variant="ghost" size="icon" aria-label={ar ? 'مسح الموقع' : 'Clear location'} onClick={() => onChange(undefined)}><X /></Button></div>}
  </div>;
}