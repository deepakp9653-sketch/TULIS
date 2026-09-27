'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Users,
  Navigation,
  CloudRain,
  Wind,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Compass,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  Radio,
} from 'lucide-react';
import { Participant, Booking } from '@/lib/types';
import { DigitalTwinSimulationResult, WeatherSimulationParameters } from '@/lib/digital-twin-engine';
import { SocialSignal } from '@/lib/social-signals-service';

interface GeospatialImpactMapProps {
  simulation: DigitalTwinSimulationResult;
  participants: Participant[];
  bookings: Booking[];
  onSelectEpicenter?: (coords: { lat: number; lng: number }, name: string) => void;
  className?: string;
}

interface MapEntity {
  id: string;
  name: string;
  type: 'squad' | 'booking' | 'swap' | 'social_signal';
  lat: number;
  lng: number;
  xPct: number; // 0 - 100 on visual canvas
  yPct: number; // 0 - 100 on visual canvas
  status: 'safe' | 'at_risk' | 'suspended';
  details: string;
  badge?: string;
}

export const GeospatialImpactMap: React.FC<GeospatialImpactMapProps> = ({
  simulation,
  participants,
  bookings,
  onSelectEpicenter,
  className = '',
}) => {
  const [activeLayers, setActiveLayers] = useState({
    radar: true,
    shockwaves: true,
    squad: true,
    bookings: true,
    social: true,
  });

  const [selectedEntity, setSelectedEntity] = useState<MapEntity | null>(null);

  // Map geographic bounds roughly around Goa/Regional destination:
  // Lat: 15.2 to 15.7 (South to North)
  // Lng: 73.65 to 74.25 (West coastline to East hinterland)
  const minLat = 15.25;
  const maxLat = 15.75;
  const minLng = 73.65;
  const maxLng = 74.15;

  const latLngToPercent = (lat: number, lng: number) => {
    const xPct = Math.max(8, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert Y because latitude increases northward (upward)
    const yPct = Math.max(8, Math.min(92, 100 - ((lat - minLat) / (maxLat - minLat)) * 100));
    return { xPct, yPct };
  };

  const epicenterPct = latLngToPercent(
    simulation.parameters.epicenterCoords.lat,
    simulation.parameters.epicenterCoords.lng
  );

  // Build entity list
  const entities: MapEntity[] = [];

  // 1. Squad entities
  if (activeLayers.squad) {
    simulation.squadSafetyVectors.forEach((sv, idx) => {
      const { xPct, yPct } = latLngToPercent(sv.coordinates.lat, sv.coordinates.lng);
      entities.push({
        id: `squad-${sv.participantId}`,
        name: sv.name,
        type: 'squad',
        lat: sv.coordinates.lat,
        lng: sv.coordinates.lng,
        xPct: xPct + (idx % 2 === 0 ? -1.5 : 1.5),
        yPct: yPct + (idx % 2 === 0 ? 1.5 : -1.5),
        status: sv.safetyStatus === 'at_risk_evacuate' ? 'at_risk' : 'safe',
        details: `Location: ${sv.currentLocationName} • Distance to storm: ${sv.distanceToStormKm} km`,
        badge: sv.safetyStatus === 'at_risk_evacuate' ? '⚠️ Regrouping' : '🟢 Safe',
      });
    });
  }

  // 2. Bookings
  if (activeLayers.bookings) {
    simulation.impactedBookings.forEach((ib) => {
      // Approximate coords based on title
      const isWater = ib.booking.title.toLowerCase().includes('yacht') || ib.booking.title.toLowerCase().includes('cruise');
      const lat = isWater ? 15.5020 : 15.5553;
      const lng = isWater ? 73.8290 : 73.7517;
      const { xPct, yPct } = latLngToPercent(lat, lng);
      entities.push({
        id: `booking-${ib.booking.id}`,
        name: ib.booking.title,
        type: 'booking',
        lat,
        lng,
        xPct,
        yPct,
        status: ib.impactSeverity === 'suspended' ? 'suspended' : 'at_risk',
        details: `${ib.disruptionReason} (Original cost: ₹${(ib.booking.actualCost || ib.booking.estimatedCost || (ib.booking as any).cost || 0).toLocaleString()})`,
        badge: ib.impactSeverity === 'suspended' ? '🚫 Suspended' : '⚠️ At Risk',
      });

      // Recommended swap entity
      const swapCoords = ib.recommendedIndoorSwap.coordinates;
      const swapPct = latLngToPercent(swapCoords.lat, swapCoords.lng);
      entities.push({
        id: `swap-${ib.booking.id}`,
        name: ib.recommendedIndoorSwap.title,
        type: 'swap',
        lat: swapCoords.lat,
        lng: swapCoords.lng,
        xPct: swapPct.xPct,
        yPct: swapPct.yPct,
        status: 'safe',
        details: `${ib.recommendedIndoorSwap.highlights} (Estimated cost: ₹${ib.recommendedIndoorSwap.estimatedCost.toLocaleString()})`,
        badge: '✨ Safe Indoor Swap',
      });
    });
  }

  // 3. Social signals
  if (activeLayers.social) {
    simulation.socialVerification.signals.forEach((sig) => {
      const { xPct, yPct } = latLngToPercent(sig.coordinates.lat, sig.coordinates.lng);
      entities.push({
        id: `social-${sig.id}`,
        name: sig.author,
        type: 'social_signal',
        lat: sig.coordinates.lat,
        lng: sig.coordinates.lng,
        xPct,
        yPct,
        status: sig.severity === 'critical' || sig.severity === 'high' ? 'suspended' : 'at_risk',
        details: `[${sig.platform.toUpperCase()}] ${sig.content}`,
        badge: `${sig.timestamp} • ${sig.sentiment.toUpperCase()}`,
      });
    });
  }

  // Storm severity gradient
  const stormIntensity = simulation.parameters.rainfallMmPerHour;
  const stormColor =
    stormIntensity >= 40
      ? 'rgba(239, 68, 68, 0.45)' // Crimson Red
      : stormIntensity >= 20
      ? 'rgba(245, 158, 11, 0.45)' // Amber
      : 'rgba(90, 120, 99, 0.35)'; // Forest green mist

  return (
    <div className={`relative flex flex-col rounded-3xl bg-[#F4F5EE] border border-[#D1D8BE] overflow-hidden shadow-md select-none ${className}`}>
      {/* Top Map Action Bar */}
      <div className="p-3.5 bg-[#EBF4DD]/80 border-b border-[#D1D8BE] flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#5A7863] text-white flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '18s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#3B4953]">Geospatial Digital Twin Visualizer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] font-semibold">
                Live Open-Meteo & Social GIS
              </span>
            </div>
            <p className="text-[11px] text-[#6B7C85]">
              Impact Radius: <strong className="text-[#3B4953]">{simulation.impactRadiusKm} km</strong> • Epicenter: <strong className="text-[#3B4953]">{simulation.parameters.epicenterName}</strong>
            </p>
          </div>
        </div>

        {/* Layer Toggles */}
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, radar: !p.radar }))}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeLayers.radar
                ? 'bg-[#5A7863] text-white border-[#5A7863]'
                : 'bg-white text-[#6B7C85] border-[#D1D8BE]'
            }`}
          >
            <CloudRain className="w-3 h-3" /> Radar
          </button>
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, shockwaves: !p.shockwaves }))}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeLayers.shockwaves
                ? 'bg-[#5A7863] text-white border-[#5A7863]'
                : 'bg-white text-[#6B7C85] border-[#D1D8BE]'
            }`}
          >
            <Radio className="w-3 h-3" /> Ripples
          </button>
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, squad: !p.squad }))}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeLayers.squad
                ? 'bg-[#5A7863] text-white border-[#5A7863]'
                : 'bg-white text-[#6B7C85] border-[#D1D8BE]'
            }`}
          >
            <Users className="w-3 h-3" /> Squad
          </button>
          <button
            onClick={() => setActiveLayers((p) => ({ ...p, social: !p.social }))}
            className={`px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer flex items-center gap-1 ${
              activeLayers.social
                ? 'bg-[#854D0E] text-white border-[#854D0E]'
                : 'bg-white text-[#6B7C85] border-[#D1D8BE]'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Socials ({simulation.socialVerification.signals.length})
          </button>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div
        className="relative w-full aspect-[16/10] min-h-[380px] bg-[#E7EEDB] overflow-hidden cursor-crosshair"
        onClick={(e) => {
          if (!onSelectEpicenter) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const clickXPct = ((e.clientX - rect.left) / rect.width) * 100;
          const clickYPct = ((e.clientY - rect.top) / rect.height) * 100;
          const lat = minLat + ((100 - clickYPct) / 100) * (maxLat - minLat);
          const lng = minLng + (clickXPct / 100) * (maxLng - minLng);
          onSelectEpicenter({ lat, lng }, 'Custom User Location');
        }}
      >
        {/* Coastal & Geographic Decorative SVG Background */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <defs>
            <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9DBC3" />
              <stop offset="35%" stopColor="#D9E6D5" />
              <stop offset="100%" stopColor="#EBF4DD" />
            </linearGradient>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD8C1" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Grid lines */}
          <rect width="100%" height="100%" fill="url(#gridPattern)" />

          {/* Coastline shape (representing Arabian Sea on west) */}
          <path
            d="M 0 0 L 160 0 Q 140 120 190 220 T 150 420 T 210 650 L 0 650 Z"
            fill="url(#oceanGrad)"
          />

          {/* Mandovi & Zuari River channels */}
          <path
            d="M 180 200 Q 280 220 380 190 T 520 220"
            fill="none"
            stroke="#9EBA9F"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 170 340 Q 260 360 420 330 T 540 370"
            fill="none"
            stroke="#9EBA9F"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        {/* Region Labels */}
        <div className="absolute top-4 left-6 text-[10px] font-mono font-bold tracking-widest text-[#788E75] uppercase">
          🌊 Arabian Sea Basin
        </div>
        <div className="absolute top-10 right-6 text-[10px] font-mono font-bold tracking-widest text-[#788E75] uppercase">
          🏞️ Western Ghats Hinterland
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-mono text-[#8C9E89] text-center">
          Click anywhere on map to reposition storm epicenter
        </div>

        {/* WEATHER RADAR OVERLAY LAYER */}
        {activeLayers.radar && (
          <motion.div
            className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 blur-2xl"
            style={{
              left: `${epicenterPct.xPct}%`,
              top: `${epicenterPct.yPct}%`,
              width: `${simulation.impactRadiusKm * 18}px`,
              height: `${simulation.impactRadiusKm * 18}px`,
              backgroundColor: stormColor,
            }}
            animate={{
              scale: [0.95, 1.05, 0.95],
              opacity: [0.6, 0.85, 0.6],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* ANIMATED IMPACT PROPAGATION SHOCKWAVES */}
        {activeLayers.shockwaves && (
          <>
            {[0, 1.2, 2.4].map((delay, idx) => (
              <motion.div
                key={`shockwave-${idx}`}
                className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 border-2 border-dashed"
                style={{
                  left: `${epicenterPct.xPct}%`,
                  top: `${epicenterPct.yPct}%`,
                  borderColor:
                    stormIntensity >= 40
                      ? 'rgba(239, 68, 68, 0.7)'
                      : 'rgba(245, 158, 11, 0.7)',
                }}
                initial={{ width: 0, height: 0, opacity: 0.9 }}
                animate={{
                  width: `${simulation.impactRadiusKm * 24}px`,
                  height: `${simulation.impactRadiusKm * 24}px`,
                  opacity: 0,
                }}
                transition={{
                  duration: 3.6,
                  repeat: Infinity,
                  delay,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}

        {/* STORM EPICENTER PIN */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
          style={{ left: `${epicenterPct.xPct}%`, top: `${epicenterPct.yPct}%` }}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFE4E6] border-2 border-red-500 shadow-xl flex items-center justify-center text-red-600 animate-bounce">
            <CloudRain className="w-5 h-5" />
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#1C261F]/90 text-white text-[10px] font-bold shadow-md whitespace-nowrap border border-white/20">
            ⛈️ Storm Epicenter ({stormIntensity} mm/h)
          </div>
        </div>

        {/* MAP ENTITY PINS */}
        {entities.map((ent) => {
          const isSelected = selectedEntity?.id === ent.id;

          return (
            <motion.div
              key={ent.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer"
              style={{ left: `${ent.xPct}%`, top: `${ent.yPct}%` }}
              whileHover={{ scale: 1.18 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedEntity(ent);
              }}
            >
              {ent.type === 'squad' && (
                <div className="relative group">
                  <div
                    className={`w-7 h-7 rounded-full border-2 shadow-md flex items-center justify-center text-xs font-bold ${
                      ent.status === 'at_risk'
                        ? 'bg-amber-100 border-amber-600 text-amber-900 animate-pulse'
                        : 'bg-[#5A7863] border-white text-white'
                    }`}
                  >
                    {ent.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-[#3B4953] bg-white/90 px-1 rounded shadow-xs whitespace-nowrap">
                    {ent.name}
                  </span>
                </div>
              )}

              {ent.type === 'booking' && (
                <div className="relative group">
                  <div
                    className={`w-8 h-8 rounded-xl border shadow-lg flex items-center justify-center text-sm ${
                      ent.status === 'suspended'
                        ? 'bg-[#FFE4E6] border-red-500 text-red-700 animate-pulse'
                        : 'bg-amber-100 border-amber-500 text-amber-800'
                    }`}
                  >
                    📍
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-[#3B4953] bg-white/95 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[110px] truncate border border-[#D1D8BE]">
                    {ent.name}
                  </span>
                </div>
              )}

              {ent.type === 'swap' && (
                <div className="relative group">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF9C3] border-2 border-[#5A7863] shadow-lg flex items-center justify-center text-sm text-[#5A7863]">
                    ✨
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#5A7863] bg-[#FEF9C3] px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap max-w-[110px] truncate border border-[#FDE047]">
                    Indoor Swap
                  </span>
                </div>
              )}

              {ent.type === 'social_signal' && (
                <div className="relative group">
                  <div className="w-6 h-6 rounded-full bg-[#3B4953] text-white border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold">
                    💬
                  </div>
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-medium text-white bg-[#3B4953]/90 px-1 rounded whitespace-nowrap">
                    Report
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* SELECTED ENTITY POPUP DRAWER / CARD */}
        <AnimatePresence>
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#D1D8BE] shadow-xl z-40 space-y-2 text-[#3B4953]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF4DD] text-[#5A7863] font-bold">
                    {selectedEntity.badge || selectedEntity.type.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-bold mt-1 text-[#3B4953]">{selectedEntity.name}</h4>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 rounded-md text-[#6B7C85] hover:bg-[#F4F5EE] cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-[#6B7C85] leading-relaxed">{selectedEntity.details}</p>
              <div className="pt-2 border-t border-[#EBF4DD] flex items-center justify-between text-[11px] text-[#6B7C85]">
                <span>Lat: {selectedEntity.lat.toFixed(4)}</span>
                <span>Lng: {selectedEntity.lng.toFixed(4)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Legend Footer */}
      <div className="p-3 bg-[#EBF4DD]/70 border-t border-[#D1D8BE] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#6B7C85]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium text-[#3B4953]">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Suspended Booking
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#3B4953]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FDE047] border border-[#854D0E]" /> Safe Indoor Swap
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#3B4953]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5A7863]" /> Squad Member
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#3B4953]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B4953]" /> Social Signal Pin
          </span>
        </div>
        <div className="text-[10px] font-mono text-[#5A7863] font-semibold">
          ⚡ Automated Real-Time Propagation Mode
        </div>
      </div>
    </div>
  );
};
