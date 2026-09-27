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
  Copy,
  Navigation,
} from 'lucide-react';
import { LiveLocationMap } from '@/components/LiveLocationMap';

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
  const [copied, setCopied] = useState(false);

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
    // Auto-poll every 3.5 seconds for real-time live location updates
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, [sosEventId]);

  const latestPing = pings.length > 0 ? pings[pings.length - 1] : null;
  const currentLat = Number(latestPing?.latitude ?? eventData?.initialLat ?? 15.2993);
  const currentLng = Number(latestPing?.longitude ?? eventData?.initialLng ?? 74.1240);
  const isResolved = eventData?.status === 'resolved';

  const rawAccuracy = latestPing?.accuracyMeters ?? latestPing?.accuracy_meters ?? 15;
  const accuracy = Number(rawAccuracy);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (currentUrl) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `🚨 EMERGENCY LIVE LOCATION: ${eventData?.userName || 'Traveler'} is broadcasting their live GPS coordinates.\n\n🔴 Watch real-time live movement:\n${currentUrl}\n\n📍 Google Maps Pin:\nhttps://maps.google.com/?q=${currentLat},${currentLng}\n\nPlease check on them or contact authorities if unresponsive.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F4F5EE] text-[#3B4953] flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      {/* Top Banner Header */}
      <header className="w-full max-w-3xl flex items-center justify-between py-4 border-b border-[#D1D8BE] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-display font-extrabold text-lg sm:text-xl text-[#3B4953] tracking-tight">
                Tulis Safety Network
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE] font-bold">
                LIVE RADAR
              </span>
            </div>
            <span className="text-xs text-[#6B7C85] block">
              Real-time Emergency Live Location Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isResolved ? (
            <span className="px-3 py-1.5 rounded-full bg-red-100 border border-red-300 text-red-700 text-xs font-mono font-extrabold flex items-center gap-2 shadow-xs animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              LIVE SOS BEACON
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-full bg-[#EBF4DD] border border-[#5A7863]/30 text-[#5A7863] text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-[#5A7863]" />
              RESOLVED (SAFE)
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-3xl space-y-6">
        {loading && !eventData ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#D1D8BE] shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#5A7863] animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#6B7C85]">
              Connecting to live traveler GPS beacon...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border-2 border-red-200 rounded-3xl text-center shadow-sm">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="font-bold text-base text-red-800 mb-1">Beacon Not Found or Inactive</h3>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        ) : (
          <>
            {/* Status Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border-2 relative overflow-hidden shadow-md ${
                isResolved
                  ? 'bg-white border-[#D1D8BE]'
                  : 'bg-white border-red-400 ring-4 ring-red-500/10'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                        isResolved
                          ? 'bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE]'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {isResolved ? 'Status: Resolved' : 'Status: Emergency Live'}
                    </span>
                    <span className="text-[11px] text-[#6B7C85] font-mono">
                      Last ping: {lastRefreshed}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold font-serif-display text-[#3B4953]">
                    {isResolved
                      ? `${eventData?.userName || 'Traveler'} is Safe`
                      : `Emergency Alert from ${eventData?.userName || 'Traveler'}`}
                  </h1>
                  <p className="text-xs text-[#6B7C85] leading-relaxed max-w-xl">
                    {isResolved
                      ? 'The emergency alert has been safely deactivated by the traveler.'
                      : 'Live high-precision GPS telemetry is broadcasting in real-time. Follow the live map below.'}
                  </p>
                </div>

                <div className="w-14 h-14 rounded-2xl border-2 border-[#D1D8BE] bg-[#EBF4DD] flex items-center justify-center font-bold text-lg text-[#5A7863] shrink-0 shadow-inner">
                  {eventData?.userAvatar ? (
                    <img
                      src={eventData.userAvatar}
                      alt={eventData.userName}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <span>{eventData?.userName?.charAt(0)?.toUpperCase() || 'T'}</span>
                  )}
                </div>
              </div>

              {/* Telemetry Stats Bar */}
              <div className="mt-5 pt-4 border-t border-[#D1D8BE] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#6B7C85] block uppercase font-mono font-semibold">
                    Current Coordinates
                  </span>
                  <span className="font-mono font-bold text-[#3B4953]">
                    {Number(currentLat).toFixed(5)}, {Number(currentLng).toFixed(5)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7C85] block uppercase font-mono font-semibold">
                    GPS Accuracy Radius
                  </span>
                  <span className="font-mono font-semibold text-[#5A7863]">
                    ±{Math.round(accuracy)} meters
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7C85] block uppercase font-mono font-semibold">
                    Telemetry Pings
                  </span>
                  <span className="font-mono font-bold text-[#3B4953]">
                    {pings.length} Recorded
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#6B7C85] block uppercase font-mono font-semibold">
                    Live Stream Speed
                  </span>
                  <span className="font-mono font-bold text-red-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                    Every 3.5s
                  </span>
                </div>
              </div>
            </motion.div>

            {/* REAL 2D OPENSTREETMAP LIVE MAP */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#5A7863]" />
                  <span className="text-xs font-bold text-[#3B4953]">
                    Real-Time 2D OpenStreetMap Radar
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://maps.google.com/?q=${currentLat},${currentLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#5A7863]" />
                  </a>
                </div>
              </div>

              {/* Interactive OpenStreetMap Container */}
              <div className="h-80 w-full rounded-3xl overflow-hidden shadow-md border-2 border-[#D1D8BE]">
                <LiveLocationMap
                  lat={currentLat}
                  lng={currentLng}
                  userName={eventData?.userName || 'Traveler'}
                  accuracyMeters={accuracy}
                  pings={pings}
                  isResolved={isResolved}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Location Sharing via WhatsApp & Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7C85] px-1">
                Instant Location Sharing & Emergency Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary WhatsApp Share Button */}
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Forward Live Location via WhatsApp</span>
                </a>

                {/* Copy Live Tracking Link */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-3.5 rounded-2xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4 text-[#5A7863]" />
                  <span>{copied ? 'Copied Live Link!' : 'Copy Live Tracking Link'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Call Emergency 112 */}
                <a
                  href="tel:112"
                  className="p-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial National Emergency (112)</span>
                </a>

                {/* Call Traveler Directly */}
                {eventData?.userPhone ? (
                  <a
                    href={`tel:${eventData.userPhone}`}
                    className="p-3.5 rounded-2xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {eventData.userName || 'Traveler'} Directly</span>
                  </a>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] text-[#6B7C85] text-xs font-semibold flex items-center justify-center gap-2">
                    <Radio className="w-4 h-4 text-[#5A7863]" />
                    <span>Live GPS Broadcast Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Chronological GPS Trail Log */}
            <div className="p-5 rounded-3xl bg-white border border-[#D1D8BE] shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#D1D8BE]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5A7863]" />
                  <h3 className="text-xs font-bold text-[#3B4953]">
                    GPS Telemetry Audit Trail ({pings.length} Signals)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-[#6B7C85]">
                  Automated Beacon Stream
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {pings.length === 0 ? (
                  <p className="text-xs text-[#6B7C85] italic">Waiting for incoming telemetry...</p>
                ) : (
                  pings
                    .slice()
                    .reverse()
                    .slice(0, 10)
                    .map((ping, idx) => (
                      <div
                        key={ping.id || idx}
                        className="p-2.5 rounded-xl bg-[#F4F5EE] border border-[#D1D8BE] flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              idx === 0 ? 'bg-red-600 animate-pulse' : 'bg-[#5A7863]'
                            }`}
                          />
                          <span className="font-bold text-[#3B4953]">
                            {Number(ping.latitude).toFixed(5)}, {Number(ping.longitude).toFixed(5)}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#6B7C85]">
                          {ping.recordedAt
                            ? new Date(ping.recordedAt).toLocaleTimeString()
                            : 'Just now'}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
