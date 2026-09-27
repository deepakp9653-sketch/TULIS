'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface OpenStreetMap2DProps {
  center: [number, number]; // [lat, lng]
  zoom?: number;
  destinationName: string;
  weatherIntensity: number; // mm/h
  impactRadiusKm: number;
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
  zoom = 11,
  destinationName,
  weatherIntensity,
  impactRadiusKm,
  venues = [],
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const circleLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);

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
          center,
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
        mapInstanceRef.current.setView(center, zoom);
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

      const circle = L.circle(center, {
        color: circleColor,
        fillColor: circleFill,
        fillOpacity: 0.28,
        radius: impactRadiusKm * 1000, // in meters
        dashArray: isSevere ? '6, 6' : undefined,
      }).addTo(map);

      circleLayerRef.current = circle;

      // Center Pin (Destination Weather Epicenter)
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

      L.marker(center, { icon: centerIcon })
        .addTo(markersLayer)
        .bindPopup(centerPopupContent);

      // Render venue markers
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
  }, [center, zoom, destinationName, weatherIntensity, impactRadiusKm, venues]);

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
      
      {/* 2D Free Map Provider Badge */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#D1D8BE] text-[10px] font-mono text-[#3B4953] shadow-xs flex items-center gap-1.5 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#5A7863] animate-pulse" />
        <span>OpenStreetMap 2D Free Provider</span>
      </div>
    </div>
  );
};
