import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listApprovedPlots } from '@/lib/licensing.functions';
import { loadLicensingMap } from '@/lib/google-map-loader';
import { matchingPlots, normalizePlotCode, type PortalPlot } from '@/lib/property-selection';

function PlotMap({ plots, selectedId, onPick }: { plots: PortalPlot[]; selectedId: string; onPick: (plot: PortalPlot) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onPick); callback.current = onPick;
  const [state, setState] = useState('loading');
  useEffect(() => {
    let disposed = false;
    const pins: google.maps.Marker[] = [];
    const listeners: google.maps.MapsEventListener[] = [];
    const positioned = plots.filter(p => p.latitude !== null && p.longitude !== null);
    const first = positioned[0];
    if (!first || first.latitude === null || first.longitude === null) { setState('empty'); return; }
    const center = { lat: first.latitude, lng: first.longitude };
    setState('loading');
    loadLicensingMap().then(maps => {
      if (disposed || !container.current) return;
      const map = new maps.Map(container.current, { center, zoom: 16, mapTypeId: 'satellite', clickableIcons: false, streetViewControl: false, gestureHandling: 'cooperative' });
      const bounds = new maps.LatLngBounds();
      positioned.forEach(plot => {
        if (plot.latitude === null || plot.longitude === null) return;
        const position = { lat: plot.latitude, lng: plot.longitude };
        bounds.extend(position);
        const pin = new maps.Marker({ map, position, title: plot.code, label: plot.id === selectedId ? `✓ ${plot.code}` : plot.code, zIndex: plot.id === selectedId ? 2 : 1 });
        pins.push(pin); listeners.push(pin.addListener('click', () => callback.current(plot)));
      });
      if (positioned.length > 1) map.fitBounds(bounds);
      setState('ready');
    }).catch(() => { if (!disposed) setState('error'); });
    return () => { disposed = true; listeners.forEach(l => l.remove()); pins.forEach(p => p.setMap(null)); };
  }, [plots, selectedId]);
  return <div className="relative overflow-hidden rounded-md"><div ref={container} className="h-80 w-full" aria-label="خريطة القطع المعتمدة" />{state !== 'ready' && <p role="status" className="absolute inset-0 grid place-items-center bg-muted p-6 text-center text-muted-foreground">{state === 'loading' ? 'تحميل الخريطة…' : state === 'empty' ? 'مواقع القطع على الخريطة لم تُعتمد بعد.' : 'تعذر تحميل الخريطة. اختيار كود القطعة ما زال متاحًا.'}</p>}</div>;
}

export function ApprovedPlotPicker({ district, name, selectedId, onPick, onReset, onClear }: { district: string; name: string; selectedId: string; onPick: (plot: PortalPlot) => void; onReset: () => void; onClear: () => void }) {
  const list = useServerFn(listApprovedPlots);
  const query = useQuery({ queryKey: ['approved-plots', district], queryFn: () => list({ data: { district } }) });
  const [search, setSearch] = useState('');
  const plots = query.data ?? [];
  const matches = matchingPlots(plots, search);
  const selected = plots.find(p => p.id === selectedId);
  const invalid = search.trim() && !plots.some(p => p.code === normalizePlotCode(search)) && matches.length === 0;
  return <div className="space-y-5 border-t pt-6"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-2xl font-bold">{name} <span dir="ltr">({district})</span></h3><Button variant="ghost" type="button" onClick={onReset}><ArrowRight />تغيير الحي</Button></div>
    <p role="note" className="rounded-md border border-gold bg-muted p-4 text-sm leading-7 text-muted-foreground">قائمة القطع الحالية عينة مؤقتة لأحياء العاصمة الإدارية لحين اعتماد القائمة الرسمية واستبدالها.</p>
    <label className="flex items-center gap-3 rounded-md border bg-background px-4 py-3"><Search className="size-5 shrink-0 text-muted-foreground" /><input aria-label="كود القطعة" role="combobox" aria-expanded={matches.length > 0} aria-controls="approved-plot-options" aria-autocomplete="list" maxLength={120} placeholder="كود القطعة، مثال H5 أو SI4 أو N1" className="min-w-0 flex-1 bg-transparent outline-none" dir="ltr" value={search} onKeyDown={e => { if (e.key === 'Enter' && matches.length === 1 && matches[0]) { e.preventDefault(); onPick(matches[0]); setSearch(matches[0].code); } }} onChange={e => { setSearch(e.target.value); const exact = plots.find(p => p.code === normalizePlotCode(e.target.value)); if (exact) onPick(exact); else onClear(); }} /></label>
    {query.isPending ? <p role="status">تحميل القطع…</p> : query.isError ? <p role="alert" className="text-destructive">تعذر تحميل قائمة القطع. <Button variant="link" onClick={() => void query.refetch()}>إعادة المحاولة</Button></p> : !plots.length ? <p role="status" className="text-muted-foreground">قائمة القطع الرسمية لهذا الحي غير متاحة حاليًا. لا يمكن تقديم طلب قبل اعتماد القطعة.</p> : <><PlotMap plots={plots} selectedId={selectedId} onPick={plot => { onPick(plot); setSearch(plot.code); }} /><div id="approved-plot-options" role="listbox" aria-label="القطع المطابقة" className="grid grid-cols-3 gap-2 sm:grid-cols-5">{matches.map(plot => <Button key={plot.id} role="option" aria-selected={plot.id === selectedId} variant={plot.id === selectedId ? 'default' : 'outline'} onClick={() => { onPick(plot); setSearch(plot.code); }} dir="ltr">{plot.code}</Button>)}</div></>}
    {invalid && <p role="alert" className="text-destructive">كود القطعة غير موجود في الحي المختار</p>}
    {selected && <p role="status" className="flex flex-wrap items-center gap-2 border border-gold bg-muted p-4 font-semibold"><MapPin className="size-4" />القطعة المختارة: <b dir="ltr">{selected.code}</b> — {name}</p>}
  </div>;
}