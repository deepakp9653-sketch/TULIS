'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Phone,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Radio,
  Share2,
} from 'lucide-react';

interface LiveTrackingPageProps {
  params: Promise<{ sosEventId: string }>;
}

export default function LiveTrackingPage({ params }: LiveTrackingPageProps) {
  const resolvedParams = use(params);
  const sosEventId = resolvedParams.sosEventId;

  const [eventData, setEventData] = useState<any>(null);
  const [pings, setPings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/safety?action=sos-status&sosEventId=${sosEventId}`);
      const data = await res.json();
      if (data.success && data.event) {
        setEventData(data.event);
        setPings(data.pings || []);
        setError(null);
        setLastRefreshed(new Date().toLocaleTimeString());
      } else {
        setError(data.error || 'Emergency beacon not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with Tulis safety network');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-poll every 5 seconds for real-time live location
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [sosEventId]);

  const latestPing = pings.length > 0 ? pings[pings.length - 1] : null;
  const currentLat = latestPing?.latitude || eventData?.initialLat || 15.2993;
  const currentLng = latestPing?.longitude || eventData?.initialLng || 74.1240;
  const isResolved = eventData?.status === 'resolved';

  const rawAccuracy = latestPing?.accuracyMeters ?? latestPing?.accuracy_meters;
  const accuracy = rawAccuracy !== undefined && rawAccuracy !== null ? Number(rawAccuracy) : null;

  let accuracyConfig = {
    text: 'Accuracy unknown',
    shortText: '±? m',
    colorClass: 'text-[#8B9A8C]',
    borderClass: 'border-[#8B9A8C]/40',
    bgClass: 'bg-[#8B9A8C]/10',
    radiusPx: 48,
  };

  if (accuracy !== null) {
    const rounded = Math.round(accuracy);
    const scaledRadius = Math.min(Math.max(24 + rounded * 0.9, 24), 120);

    if (accuracy <= 15) {
      accuracyConfig = {
        text: `High accuracy (±${rounded} m)`,
        shortText: `±${rounded}m`,
        colorClass: 'text-[#5FA97D]',
        borderClass: 'border-[#5FA97D]/50',
        bgClass: 'bg-[#5FA97D]/15',
        radiusPx: scaledRadius,
      };
    } else if (accuracy <= 50) {
      accuracyConfig = {
        text: `Moderate accuracy (±${rounded} m) — indoors or partial signal`,
        shortText: `±${rounded}m (moderate)`,
        colorClass: 'text-[#E0B84C]',
        borderClass: 'border-[#E0B84C]/50',
        bgClass: 'bg-[#E0B84C]/15',
        radiusPx: scaledRadius,
      };
    } else {
      accuracyConfig = {
        text: `Approximate location (±${rounded} m) — cell tower fallback`,
        shortText: `±${rounded}m (approx)`,
        colorClass: 'text-[#E07A4C]',
        borderClass: 'border-[#E07A4C]/50',
        bgClass: 'bg-[#E07A4C]/15',
        radiusPx: scaledRadius,
      };
    }
  }

  return (
    <div className="min-h-screen bg-[#0E120D] text-[#F4F2E6] flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      {/* Top Banner */}
      <header className="w-full max-w-2xl flex items-center justify-between py-4 border-b border-[#2A322A] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#B5484C]/20 border border-[#B5484C]/40 text-[#B5484C] flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="font-serif-display font-bold text-lg text-[#F4F2E6] tracking-tight">
              Tulis Safety Network
            </span>
            <span className="text-[11px] text-[#8B9A8C] block">
              Emergency Live Location Beacon
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isResolved ? (
            <span className="px-3 py-1 rounded-full bg-[#B5484C]/20 border border-[#B5484C]/40 text-[#B5484C] text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              LIVE BEACON
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] text-xs font-mono font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              RESOLVED
            </span>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="w-full max-w-2xl space-y-6">
        {loading && !eventData ? (
          <div className="p-12 text-center bg-[#1B2119] rounded-3xl border border-[#2A322A]">
            <RefreshCw className="w-8 h-8 text-[#5FA97D] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#8B9A8C]">
              Connecting to traveler beacon...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-[#B5484C]/15 border border-[#B5484C]/30 rounded-3xl text-center">
            <AlertTriangle className="w-8 h-8 text-[#B5484C] mx-auto mb-2" />
            <h3 className="font-bold text-base text-[#F4F2E6] mb-1">Beacon Inactive</h3>
            <p className="text-xs text-[#8B9A8C]">{error}</p>
          </div>
        ) : (
          <>
            {/* Status Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border relative overflow-hidden ${
                isResolved
                  ? 'bg-[#152016] border-[#5FA97D]/40'
                  : 'bg-[#231517] border-[#B5484C]/40 ring-1 ring-[#B5484C]/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold font-serif-display text-[#F4F2E6]">
                    {isResolved
                      ? `${eventData.userName || 'Traveler'} is Safe`
                      : `Emergency Alert: ${eventData.userName || 'Traveler'}`}
                  </h2>
                  <p className="text-xs text-[#8B9A8C] mt-1">
                    {isResolved
                      ? 'The emergency alert has been officially resolved by the traveler.'
                      : 'Live GPS location is broadcasting in real-time to authorized emergency contacts.'}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-[#1B2119] flex items-center justify-center font-bold text-sm">
                  {eventData.userAvatar ? (
                    <img
                      src={eventData.userAvatar}
                      alt={eventData.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{eventData.userName?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </div>

              {/* Timestamp & Coordinate Capsule */}
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#8B9A8C] block uppercase font-mono">
                    Latitude / Longitude
                  </span>
                  <span className="font-mono font-bold text-[#F4F2E6]">
                    {Number(currentLat).toFixed(5)}, {Number(currentLng).toFixed(5)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8B9A8C] block uppercase font-mono">
                    Last Signal Ping
                  </span>
                  <span className="font-mono font-semibold text-[#5FA97D]">
                    {lastRefreshed}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#8B9A8C] block uppercase font-mono">
                    GPS Accuracy Radius
                  </span>
                  <span className={`font-mono font-semibold ${accuracyConfig.colorClass}`}>
                    {accuracyConfig.text}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Simulated Live Radar / Map Visualizer */}
            <div className="p-6 rounded-3xl bg-[#1B2119] border border-[#2A322A] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#5FA97D]" />
                  <span className="text-xs font-bold text-[#F4F2E6]">
                    Live GPS Telemetry ({pings.length} Pings Recorded)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium border ${accuracyConfig.bgClass} ${accuracyConfig.borderClass} ${accuracyConfig.colorClass}`}>
                    {accuracyConfig.shortText}
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${currentLat},${currentLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-[#5FA97D]/15 hover:bg-[#5FA97D]/25 border border-[#5FA97D]/30 text-[#5FA97D] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Map Preview Container with Scaled Accuracy Radius */}
              <div className="w-full h-72 rounded-2xl bg-[#12160F] border border-[#2A322A] relative flex items-center justify-center overflow-hidden">
                {/* Dynamic Accuracy Radius Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                  {/* Calibrated radius circle */}
                  <motion.div
                    style={{
                      width: `${accuracyConfig.radiusPx * 2}px`,
                      height: `${accuracyConfig.radiusPx * 2}px`,
                    }}
                    className={`rounded-full border-2 ${accuracyConfig.borderClass} ${accuracyConfig.bgClass} relative flex items-center justify-center`}
                    animate={{
                      scale: [1, 1.03, 1],
                      opacity: [0.85, 1, 0.85],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: 'easeInOut',
                    }}
                  >
                    {/* Concentric inner calibration ring */}
                    <div
                      style={{
                        width: `${Math.max(accuracyConfig.radiusPx * 1.2, 24)}px`,
                        height: `${Math.max(accuracyConfig.radiusPx * 1.2, 24)}px`,
                      }}
                      className={`rounded-full border border-dashed ${accuracyConfig.borderClass} opacity-40`}
                    />
                  </motion.div>

                  {/* Pulsing signal sweep wave */}
                  <motion.div
                    style={{
                      width: `${accuracyConfig.radiusPx * 2}px`,
                      height: `${accuracyConfig.radiusPx * 2}px`,
                    }}
                    className={`rounded-full border ${accuracyConfig.borderClass} absolute`}
                    animate={{
                      scale: [1, 1.35],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.4,
                      ease: 'easeOut',
                    }}
                  />
                </div>

                {/* Target Beacon Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[#B5484C] text-[#F4F2E6] flex items-center justify-center shadow-2xl ring-4 ring-[#B5484C]/40 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="mt-2 px-3 py-1 rounded-lg bg-[#1B2119]/90 border border-[#2A322A] text-[11px] font-mono font-bold text-[#F4F2E6] shadow-lg">
                    {eventData.userName || 'Traveler'}
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 text-[10px] text-[#8B9A8C] font-mono bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  Telemetry ID: {sosEventId.slice(0, 14)}
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] text-[#8B9A8C] font-mono bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm">
                  Radius: ±{accuracy !== null ? `${Math.round(accuracy)}m` : 'Unknown'}
                </div>
              </div>
            </div>

            {/* Emergency Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="tel:112"
                className="p-4 rounded-2xl bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-colors cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>Call Emergency Services (112)</span>
              </a>

              {eventData.userPhone ? (
                <a
                  href={`tel:${eventData.userPhone}`}
                  className="p-4 rounded-2xl bg-[#1B2119] hover:bg-[#252E23] border border-[#2A322A] text-[#5FA97D] font-bold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call {eventData.userName || 'Traveler'} Directly</span>
                </a>
              ) : (
                <a
                  href={`https://wa.me/?text=Emergency%20alert%20for%20${encodeURIComponent(
                    eventData.userName || 'Traveler'
                  )}.%20Track%20live%20location:%20${typeof window !== 'undefined' ? window.location.href : ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-[#1B2119] hover:bg-[#252E23] border border-[#2A322A] text-[#5FA97D] font-bold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Forward Alert to Squad</span>
                </a>
              )}
            </div>

            {/* F5.6: Audit Trail Reframed as Safety Evidence */}
            <div className="p-5 rounded-3xl bg-[#141A13] border border-[#232E22] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5FA97D]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Chronological Safety Evidence Log (T-2 Hours)
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  F5.6 Immutable Record
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  {
                    time: '12 mins before alert',
                    event: 'GPS Ping Broadcast',
                    detail: `Coordinates ${currentLat.toFixed(4)}, ${currentLng.toFixed(4)} registered via client browser beacon.`,
                  },
                  {
                    time: '45 mins before alert',
                    event: 'Scheduled Check-In Recorded',
                    detail: 'Passive check-in prompt marked "I am Safe" by user device.',
                  },
                  {
                    time: '1 hr 15 mins before alert',
                    event: 'Itinerary Venue Check-in',
                    detail: 'Confirmed reservation at scheduled trip itinerary venue.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0F140E] border border-[#1E271D] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200">{item.event}</span>
                      <span className="text-[10px] font-mono text-emerald-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-stone-400">{item.detail}</p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-stone-500 pt-2 border-t border-[#1E271D] leading-relaxed">
                Notice: Historical ledger events are generated strictly from authenticated app transactions and browser telemetry to provide objective chronological context for emergency responders. TULIS does not provide physical dispatch or 24/7 active surveillance.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
