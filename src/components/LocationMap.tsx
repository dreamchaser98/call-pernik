'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

const PERNIK_CENTER = { lat: 42.6050, lng: 23.0378 };
const DEFAULT_ZOOM = 14;

export default function LocationMap({ latitude, longitude, onLocationChange }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [latitude || PERNIK_CENTER.lat, longitude || PERNIK_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add marker if position already set
      if (latitude && longitude) {
        markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current.getLatLng();
          onLocationChange(pos.lat, pos.lng);
          reverseGeocode(pos.lat, pos.lng);
        });
      }

      // Click to place marker
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            onLocationChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
        }

        onLocationChange(lat, lng);
        reverseGeocode(lat, lng);
      });

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=bg`
      );
      const data = await res.json();
      if (data.display_name) {
        setAddress(data.display_name);
      }
    } catch {
      setAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  }

  async function handleSearch() {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    try {
      const query = searchInput.includes('Перник') ? searchInput : `${searchInput}, Перник, България`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=bg`
      );
      const data = await res.json();
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const L = (await import('leaflet')).default;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            onLocationChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
        }

        mapInstanceRef.current.setView([lat, lng], 17);
        onLocationChange(lat, lng);
        setAddress(data[0].display_name);
      }
    } catch {
      // Ignore search errors
    }
    setIsLoading(false);
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        const L = (await import('leaflet')).default;

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current.getLatLng();
            onLocationChange(pos.lat, pos.lng);
            reverseGeocode(pos.lat, pos.lng);
          });
        }

        mapInstanceRef.current.setView([lat, lng], 17);
        onLocationChange(lat, lng);
        reverseGeocode(lat, lng);
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Местоположение на проблема <span className="text-red-500">*</span>
      </label>

      <p className="text-xs text-slate-500">
        Кликнете на картата или потърсете адрес, за да посочите местоположението.
      </p>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder='Напр. "ул. Тинтява 13, Перник"'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:border-[#2d4a7a] transition-colors pr-10"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2.5 bg-[#2d4a7a] text-white rounded-lg text-sm font-medium hover:bg-[#1a2744] transition-colors disabled:opacity-50"
        >
          {isLoading ? '...' : 'Търси'}
        </button>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isLocating}
          className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          title="Моето местоположение"
        >
          {isLocating ? (
            <span className="animate-spin inline-block">⌛</span>
          ) : (
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        className="h-[350px] sm:h-[400px] rounded-xl border border-slate-200 overflow-hidden"
      />

      {/* Coordinates display */}
      {latitude && longitude && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
          <span className="font-medium">
            📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
          {address && (
            <span className="text-slate-400 truncate">
              — {address}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
