'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

export interface MapSocialSignalPin {
  id: string;
  author: string;
  content: string;
  lat: number;
  lng: number;
  platform: 'reddit' | 'news' | 'community' | 'sensor' | string;
  url?: string;
  timestamp?: string;
  weatherCategory?: 'rain_flood' | 'temp_wind' | 'alert_warning' | 'telemetry' | string;
  sentiment?: 'caution' | 'alert' | 'positive' | 'neutral' | string;
  sourceName?: string;
}

interface OpenStreetMap2DProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  destinationName: string;
  weatherIntensity: number; // mm/h
  impactRadiusKm: number;
  userLocation?: {
    lat: number;
    lng: number;
    label?: string;
  };
  socialSignals?: MapSocialSignalPin[];
  venues?: Array<{
    name: string;
    lat: number;
    lng: number;
    status: 'safe' | 'at_risk' | 'suspended';
  }>;
  className?: string;
}

export const OpenStreetMap2D: React.FC<OpenStreetMap2DProps> = ({
  center,
  zoom = 12,
  destinationName,
  weatherIntensity,
  impactRadiusKm,
  userLocation,
  socialSignals = [],
  venues = [],
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

  // Determine effective map center: Real user location if available, otherwise target destination
  const effectiveCenter: [number, number] = userLocation
    ? [Number(userLocation.lat), Number(userLocation.lng)]
    : [Number(center[0]), Number(center[1])];

  useEffect(() => {
    let isMounted = true;

    // Dynamically load leaflet on client side to avoid SSR window errors
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet's default marker icons in webpack / Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: effectiveCenter,
          zoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Free OpenStreetMap 2D Tile Provider
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        markersLayerRef.current = L.layerGroup().addTo(map);
      } else {
        mapInstanceRef.current.setView(effectiveCenter, zoom, { animate: true });
      }

      const map = mapInstanceRef.current;
      const markersLayer = markersLayerRef.current;

      // Clear previous markers
      if (markersLayer) {
        markersLayer.clearLayers();
      }

      // Draw Weather Radar / Impact Radius Circle
      if (circleLayerRef.current) {
        map.removeLayer(circleLayerRef.current);
      }

      const isSevere = weatherIntensity >= 35;
      const isModerate = weatherIntensity >= 15;
      const circleColor = isSevere ? '#EF4444' : isModerate ? '#F59E0B' : '#5A7863';
      const circleFill = isSevere ? '#F87171' : isModerate ? '#FBBF24' : '#86EFAC';

      const circle = L.circle(effectiveCenter, {
        color: circleColor,
        fillColor: circleFill,
        fillOpacity: 0.22,
        radius: Math.max(impactRadiusKm, 2) * 1000, // in meters
        dashArray: isSevere ? '6, 6' : undefined,
      }).addTo(map);

      circleLayerRef.current = circle;

      // 1. RENDER REAL USER LOCATION MARKER ("YOU ARE HERE")
      if (userLocation) {
        const userIcon = L.divIcon({
          className: 'custom-user-live-marker',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
              <div style="position: absolute; inset: -4px; border-radius: 9999px; background: rgba(90, 120, 99, 0.4); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 34px; height: 34px; border-radius: 9999px; background: #5A7863; border: 3px solid #ffffff; box-shadow: 0 8px 18px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: 800; font-size: 14px;">
                🎯
              </div>
              <div style="position: absolute; top: 38px; background: rgba(244, 245, 238, 0.96); border: 1.5px solid #5A7863; border-radius: 8px; padding: 2px 8px; white-space: nowrap; font-size: 11px; font-weight: 800; color: #1C261F; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">
                ${userLocation.label || 'You Are Here'}
              </div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        L.marker([Number(userLocation.lat), Number(userLocation.lng)], { icon: userIcon })
          .addTo(markersLayer)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; min-width: 170px;">
              <strong style="color: #5A7863; font-size: 13px;">🎯 Your Live GPS Location</strong><br/>
              <span style="color: #3B4953; font-weight: 600;">${userLocation.label || 'Current Device Position'}</span><br/>
              <span style="color: #6B7C85; font-size: 11px; font-family: monospace;">
                ${Number(userLocation.lat).toFixed(4)}° N, ${Number(userLocation.lng).toFixed(4)}° E
              </span>
            </div>
          `);
      }

      // 2. RENDER WEATHER EPICENTER PIN
      const centerPopupContent = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4;">
          <strong style="color: #3B4953; font-size: 13px;">📍 ${destinationName}</strong><br/>
          <span style="color: ${circleColor}; font-weight: bold;">
            Weather: ${weatherIntensity} mm/h precipitation
          </span><br/>
          <span style="color: #6B7C85;">Impact Radius: ${impactRadiusKm} km</span>
        </div>
      `;

      const centerIcon = L.divIcon({
        className: 'custom-center-marker',
        html: `
          <div style="background-color: ${circleColor}; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
            ${weatherIntensity > 20 ? '⛈️' : '🌤️'}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker(effectiveCenter, { icon: centerIcon })
        .addTo(markersLayer)
        .bindPopup(centerPopupContent);

      // 3. RENDER 100% PURE METEOROLOGICAL WEATHER PINS (STRICTLY FROM TODAY)
      socialSignals.forEach((sig) => {
        const isRainFlood = sig.weatherCategory === 'rain_flood';
        const isAlertWarning = sig.weatherCategory === 'alert_warning';
        const isTempWind = sig.weatherCategory === 'temp_wind';

        const badgeColor = isAlertWarning
          ? '#DC2626'
          : isRainFlood
          ? '#2563EB'
          : isTempWind
          ? '#D97706'
          : '#059669';

        const iconChar = isAlertWarning
          ? '⚠️'
          : isRainFlood
          ? '🌧️'
          : isTempWind
          ? '🌡️'
          : '🛰️';

        const categoryLabel = isAlertWarning
          ? 'Weather Alert'
          : isRainFlood
          ? 'Rain & Flood'
          : isTempWind
          ? 'Temp & Wind'
          : 'Atmospheric Telemetry';

        const socialIcon = L.divIcon({
          className: 'custom-weather-signal-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transform: translate(-50%, -50%);">
              <div style="width: 30px; height: 30px; border-radius: 9999px; background: #ffffff; border: 2.5px solid ${badgeColor}; box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; font-size: 14px;">
                ${iconChar}
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupHtml = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; max-width: 250px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px;">
              <span style="font-size: 10px; font-weight: bold; color: ${badgeColor}; text-transform: uppercase;">
                ${iconChar} ${categoryLabel}
              </span>
              <span style="font-size: 10px; color: #5A7863; font-weight: bold;">
                ${sig.timestamp || 'Today'}
              </span>
            </div>
            <p style="color: #3B4953; font-weight: 600; margin: 0 0 6px 0;">
              "${sig.content.slice(0, 120)}${sig.content.length > 120 ? '...' : ''}"
            </p>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #6B7C85; border-top: 1px solid #D1D8BE; padding-top: 5px;">
              <span>By ${sig.author}</span>
              ${
                sig.url
                  ? `<a href="${sig.url}" target="_blank" rel="noopener noreferrer" style="color: ${badgeColor}; font-weight: bold; text-decoration: none;">
                      Read report &rarr;
                     </a>`
                  : ''
              }
            </div>
          </div>
        `;

        L.marker([Number(sig.lat), Number(sig.lng)], { icon: socialIcon })
          .addTo(markersLayer)
          .bindPopup(popupHtml);
      });

      // 4. RENDER ITINERARY VENUE MARKERS
      venues.forEach((v) => {
        const markerColor =
          v.status === 'suspended' ? '#EF4444' : v.status === 'at_risk' ? '#F59E0B' : '#5A7863';
        const markerIcon = L.divIcon({
          className: 'custom-venue-marker',
          html: `
            <div style="background-color: white; color: ${markerColor}; width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 13px; border: 2px solid ${markerColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              📍
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        L.marker([v.lat, v.lng], { icon: markerIcon })
          .addTo(markersLayer)
          .bindPopup(`
            <div style="font-family: sans-serif; font-size: 12px;">
              <strong>${v.name}</strong><br/>
              <span style="color: ${markerColor}; font-weight: 600;">Status: ${v.status.toUpperCase()}</span>
            </div>
          `);
      });
    });

    return () => {
      isMounted = false;
    };
  }, [
    effectiveCenter,
    zoom,
    destinationName,
    weatherIntensity,
    impactRadiusKm,
    userLocation,
    socialSignals,
    venues,
  ]);

  // Cleanup map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#D1D8BE] shadow-md ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px]" />

      {/* Real Location Indicator Badge */}
      {userLocation && (
        <div className="absolute top-2.5 left-2.5 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#5A7863]/40 text-[10px] font-mono text-[#1C261F] shadow-xs flex items-center gap-1.5 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-[#5A7863] animate-pulse" />
          <span className="font-bold">Grounded to Your Real Location: {userLocation.label || 'Live GPS'}</span>
        </div>
      )}

      {/* 2D Free Map Provider Badge */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D1D8BE] text-[10px] font-mono text-[#3B4953] shadow-xs flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#5A7863] animate-pulse" />
        <span>OpenStreetMap 2D Free Provider</span>
      </div>
    </div>
  );
};
