/// <reference types="google.maps" />
declare global {
  interface Window { initLicensingMap?: () => void }
}
let pending: Promise<typeof google.maps> | undefined;
export function loadLicensingMap() {
  if (typeof google !== 'undefined' && google.maps?.Map) return Promise.resolve(google.maps);
  if (pending) return pending;
  pending = new Promise<typeof google.maps>((resolve, reject) => {
    const key = import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY'];
    if (!key) { reject(new Error('Map key unavailable')); return; }
    const script = document.createElement('script');
    const timer = window.setTimeout(() => { reject(new Error('Map loading timed out')); }, 20000);
    window.initLicensingMap = () => { window.clearTimeout(timer); resolve(google.maps); };
    script.onerror = () => { window.clearTimeout(timer); reject(new Error('Map could not load')); };
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&loading=async&callback=initLicensingMap&channel=${encodeURIComponent(import.meta.env['VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID'] ?? '')}`;
    script.async = true;
    document.head.appendChild(script);
  });
  return pending;
}