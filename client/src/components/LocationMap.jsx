import { useEffect, useRef } from 'react';
import { googleMapsEmbedUrl, googleMapsUrl } from '../constants/geo';
import { useI18n } from '../context/LanguageContext';

let leafletLoader;

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (leafletLoader) return leafletLoader;

  leafletLoader = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      css.setAttribute('data-leaflet', 'true');
      document.head.appendChild(css);
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return leafletLoader;
}

export default function LocationMap({
  lat,
  lng,
  interactive = false,
  onChange,
  className = 'h-64 w-full overflow-hidden rounded-2xl border border-line/80',
}) {
  const { t } = useI18n();
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!interactive || lat == null || lng == null) return undefined;
    let cancelled = false;

    loadLeaflet().then((L) => {
      if (cancelled || !mapRef.current) return;
      L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

      if (!layerRef.current) {
        const map = L.map(mapRef.current).setView([lat, lng], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        const marker = L.marker([lat, lng]).addTo(map);
        map.on('click', (event) => {
          onChange?.({ lat: event.latlng.lat, lng: event.latlng.lng });
        });
        layerRef.current = { map, marker };
      } else {
        layerRef.current.marker.setLatLng([lat, lng]);
        layerRef.current.map.setView([lat, lng]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [interactive, lat, lng, onChange]);

  useEffect(() => () => {
    layerRef.current?.map.remove();
    layerRef.current = null;
  }, []);

  if (lat == null || lng == null) return null;

  if (!interactive) {
    return (
      <div>
        <div className={className}>
          <iframe
            title={t.map.title}
            src={googleMapsEmbedUrl(lat, lng)}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a
          href={googleMapsUrl(lat, lng)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-sm font-semibold text-forest hover:underline"
        >
          {t.map.openGoogle}
        </a>
      </div>
    );
  }

  return (
    <div>
      <div ref={mapRef} className={className} />
      <a
        href={googleMapsUrl(lat, lng)}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-sm font-semibold text-forest hover:underline"
      >
        {t.map.openGoogle}
      </a>
    </div>
  );
}
