'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface LocationPing {
  id?: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  recordedAt?: string;
}

interface LiveLocationMapProps {
  lat: number;
  lng: number;
  userName?: string;
  accuracyMeters?: number | null;
  pings?: LocationPing[];
  isResolved?: boolean;
  className?: string;
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  lat,
  lng,
  userName = 'Traveler',
  accuracyMeters = 15,
  pings = [],
  isResolved = false,
  className = '',
}) => {
  const numericLat = Number(lat) || 15.2993;
  const numericLng = Number(lng) || 74.1240;
  const numericAccuracy = Number(accuracyMeters) || 15;

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);

  // Initialize and update Leaflet map
  useEffect(() => {
    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix default Leaflet icon assets in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize map instance if not already present
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [numericLat, numericLng],
          zoom: 16,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // High quality OpenStreetMap 2D raster tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
      } else {
        mapInstanceRef.current.panTo([numericLat, numericLng], { animate: true, duration: 1 });
      }

      const map = mapInstanceRef.current;

      // Custom pulsing HTML live beacon marker
      const beaconIcon = L.divIcon({
        className: 'custom-live-beacon-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%); display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: -8px; border-radius: 9999px; background: ${isResolved ? 'rgba(90, 120, 99, 0.35)' : 'rgba(220, 38, 38, 0.4)'}; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 36px; height: 36px; border-radius: 9999px; background: ${isResolved ? '#5A7863' : '#DC2626'}; border: 3px solid #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 13px; font-family: sans-serif;">
              ${userName.charAt(0).toUpperCase()}
            </div>
            <div style="position: absolute; top: 40px; background: rgba(244, 245, 238, 0.95); backdrop-filter: blur(4px); border: 1px solid #D1D8BE; border-radius: 8px; padding: 2px 8px; white-space: nowrap; font-size: 11px; font-weight: 700; color: #3B4953; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
              ${userName} ${isResolved ? '• Safe' : '• Live'}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      // Update or create main beacon marker
      if (!markerRef.current) {
        markerRef.current = L.marker([numericLat, numericLng], { icon: beaconIcon }).addTo(map);
      } else {
        markerRef.current.setLatLng([numericLat, numericLng]);
        markerRef.current.setIcon(beaconIcon);
      }

      // Update or create accuracy circle
      const effectiveRadius = Math.max(numericAccuracy, 10);
      if (!circleRef.current) {
        circleRef.current = L.circle([numericLat, numericLng], {
          radius: effectiveRadius,
          color: isResolved ? '#5A7863' : '#DC2626',
          fillColor: isResolved ? '#86EFAC' : '#F87171',
          fillOpacity: 0.22,
          weight: 1.5,
          dashArray: isResolved ? undefined : '4, 4',
        }).addTo(map);
      } else {
        circleRef.current.setLatLng([numericLat, numericLng]);
        circleRef.current.setRadius(effectiveRadius);
        circleRef.current.setStyle({
          color: isResolved ? '#5A7863' : '#DC2626',
          fillColor: isResolved ? '#86EFAC' : '#F87171',
        });
      }

      // Update breadcrumb polyline trail
      if (pings.length > 1) {
        const latLngs = pings.map((p) => [Number(p.latitude) || numericLat, Number(p.longitude) || numericLng]);
        if (!polylineRef.current) {
          polylineRef.current = L.polyline(latLngs as any, {
            color: '#DC2626',
            weight: 3.5,
            opacity: 0.75,
            dashArray: '6, 6',
          }).addTo(map);
        } else {
          polylineRef.current.setLatLngs(latLngs);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [numericLat, numericLng, userName, numericAccuracy, pings, isResolved]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([numericLat, numericLng], 17, { animate: true });
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#D1D8BE] shadow-md bg-[#F4F5EE] ${className}`}>
      {/* Real OpenStreetMap Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[300px]" style={{ zIndex: 1 }} />

      {/* Floating Recenter Button */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={handleRecenter}
          className="px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white text-[#3B4953] border border-[#D1D8BE] text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs"
        >
          <span>🎯 Recenter on {userName}</span>
        </button>
      </div>

      {/* Live Telemetry Pill */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-xs border border-[#D1D8BE] rounded-xl px-3 py-1.5 shadow-sm text-xs font-mono text-[#3B4953] flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isResolved ? 'bg-[#5A7863]' : 'bg-red-600 animate-pulse'}`} />
        <span className="font-bold">
          {numericLat.toFixed(5)}, {numericLng.toFixed(5)}
        </span>
        <span className="text-[10px] text-[#6B7C85] border-l border-[#D1D8BE] pl-2">
          ±{Math.round(numericAccuracy)}m
        </span>
      </div>
    </div>
  );
};
