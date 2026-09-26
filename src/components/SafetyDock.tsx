'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Phone,
  Radio,
  MapPin,
  CheckCircle2,
  Share2,
  Copy,
  AlertTriangle,
  X,
  Volume2,
  Users,
  ExternalLink,
} from 'lucide-react';
import { NearestPoliceModal } from './NearestPoliceModal';
import { AudioShieldModal } from './AudioShieldModal';

interface SafetyDockProps {
  isActive: boolean;
  userId: string;
  tripId?: string;
  userName?: string;
  userPhone?: string;
  onOpenContacts: () => void;
}

export const SafetyDock: React.FC<SafetyDockProps> = ({
  isActive,
  userId,
  tripId,
  userName = 'Traveler',
  userPhone,
  onOpenContacts,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);
  const [sosEventId, setSosEventId] = useState<string | null>(null);
  const [sosLoading, setSosLoading] = useState(false);
  const [isPoliceModalOpen, setIsPoliceModalOpen] = useState(false);
  const [isAudioShieldOpen, setIsAudioShieldOpen] = useState(false);
  const [audioShieldDelay, setAudioShieldDelay] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 15.2993, lng: 74.1240 });

  const watchIdRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<any>(null);

  // Monitor geolocation if active
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation read warning:', err),
        { enableHighAccuracy: true }
      );
    }
  }, [isActive]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    };
  }, []);

  if (!isActive) return null;

  // Trigger Emergency Live SOS Beacon
  const handleTriggerSos = async () => {
    setSosLoading(true);
    try {
      let currentLat = coords.lat;
      let currentLng = coords.lng;

      // Try reading fresh position
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        try {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                currentLat = pos.coords.latitude;
                currentLng = pos.coords.longitude;
                setCoords({ lat: currentLat, lng: currentLng });
                resolve();
              },
              () => resolve(),
              { timeout: 3000 }
            );
          });
        } catch (e) {}
      }

      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sos-trigger',
          userId,
          tripId,
          latitude: currentLat,
          longitude: currentLng,
        }),
      });

      const data = await res.json();
      if (data.success && data.sosEventId) {
        setSosEventId(data.sosEventId);
        setIsSosActive(true);

        // Start high-accuracy location tracking pings every 15s
        if (typeof window !== 'undefined' && 'geolocation' in navigator) {
          pingIntervalRef.current = setInterval(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
              fetch('/api/safety', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'sos-update',
                  sosEventId: data.sosEventId,
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  accuracyMeters: pos.coords.accuracy,
                }),
              }).catch(() => {});
            });
          }, 15000);
        }

        // Auto-open WhatsApp deep link to primary contact
        const liveUrl = `${window.location.origin}/live/${data.sosEventId}`;
        const emergencyMsg = `🚨 EMERGENCY ALERT from ${userName}! I need immediate assistance. Track my real-time GPS location here: ${liveUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(emergencyMsg)}`, '_blank');
      }
    } catch (err) {
      console.warn('SOS trigger error:', err);
    } finally {
      setSosLoading(false);
    }
  };

  // Resolve SOS
  const handleResolveSos = async () => {
    if (!sosEventId) return;
    try {
      await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sos-resolve',
          sosEventId,
          tripId,
        }),
      });
      setIsSosActive(false);
      setSosEventId(null);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    } catch (err) {
      console.warn('SOS resolve error:', err);
    }
  };

  const trackingUrl = sosEventId
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/live/${sosEventId}`
    : '';

  const handleCopyLink = () => {
    if (trackingUrl) {
      navigator.clipboard.writeText(trackingUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    }
  };

  return (
    <>
      {/* Floating Safety Dock Pill */}
      <aside aria-label="Safety controls" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-[#1B2119]/95 border border-[#2A322A] p-3 rounded-2xl shadow-2xl backdrop-blur-xl flex flex-col gap-2 min-w-[210px]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#2A322A] px-1">
                <span className="text-[11px] font-mono font-bold text-[#5FA97D] uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Safety Suite
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-[#8B9A8C] hover:text-[#F4F2E6] p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action 1: Call 112 */}
              <a
                href="tel:112"
                className="px-3 py-2 rounded-xl bg-[#B5484C]/20 hover:bg-[#B5484C]/30 border border-[#B5484C]/40 text-[#F4F2E6] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4 text-[#B5484C]" />
                <span>Call Emergency 112</span>
              </a>

              {/* Action 2: Nearest Police Stations */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setIsPoliceModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#12160F] hover:bg-[#252E23] border border-[#2A322A] text-[#F4F2E6] text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#5FA97D]" />
                <span>Nearest Police & Help</span>
              </button>

              {/* Action 3: Audio Shield (Fake Call Exit Strategy) */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setAudioShieldDelay(0);
                  setIsAudioShieldOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#12160F] hover:bg-[#252E23] border border-[#2A322A] text-[#F4F2E6] text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#5FA97D]" />
                  <span>Audio Shield (Exit)</span>
                </div>
                <span className="text-[9px] bg-[#5FA97D]/15 text-[#5FA97D] px-1.5 py-0.5 rounded font-mono">
                  Fake Call
                </span>
              </button>

              {/* Action 4: Manage Contacts */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenContacts();
                }}
                className="px-3 py-2 rounded-xl bg-[#12160F] hover:bg-[#252E23] border border-[#2A322A] text-[#8B9A8C] hover:text-[#F4F2E6] text-xs flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Emergency Contacts</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Primary Dock Pill / SOS Button */}
        <div className="flex items-center gap-2">
          {!isSosActive ? (
            <button
              type="button"
              onClick={handleTriggerSos}
              disabled={sosLoading}
              title="Tap to broadcast emergency location"
              className="h-12 px-4 rounded-full bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] font-bold text-xs shadow-2xl flex items-center gap-2 border-2 border-red-400/50 animate-pulse transition-transform active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>{sosLoading ? 'Arming SOS...' : 'EMERGENCY SOS'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSosActive(true)}
              className="h-12 px-4 rounded-full bg-[#B5484C] text-[#F4F2E6] font-bold text-xs shadow-2xl flex items-center gap-2 ring-4 ring-[#B5484C]/50 animate-bounce cursor-pointer"
            >
              <Radio className="w-4 h-4 animate-spin" />
              <span>BEACON ACTIVE (TAP)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title="Open safety tools"
            className="w-12 h-12 rounded-full bg-[#1B2119] border border-[#2A322A] hover:border-[#5FA97D] text-[#5FA97D] flex items-center justify-center shadow-xl transition-all hover:scale-105 cursor-pointer"
          >
            <ShieldAlert className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* Active SOS Modal Dashboard */}
      {isSosActive && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1B2119] border border-[#B5484C]/60 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-left"
          >
            <div className="flex items-center gap-3 border-b border-[#2A322A] pb-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#B5484C]/20 border border-[#B5484C]/50 text-[#B5484C] flex items-center justify-center font-bold shrink-0">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">
                  Live SOS Beacon Active
                </h3>
                <p className="text-xs text-[#8B9A8C]">
                  Your real-time GPS coordinates are being recorded and broadcast.
                </p>
              </div>
            </div>

            {/* Tracking Link Capsule */}
            <div className="p-3.5 bg-[#12160F] rounded-2xl border border-[#2A322A] space-y-2 mb-5">
              <span className="text-[11px] font-mono text-[#8B9A8C] uppercase font-semibold block">
                Public Live Tracking Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={trackingUrl}
                  className="flex-1 bg-[#1B2119] border border-[#2A322A] rounded-xl px-3 py-2 text-xs font-mono text-[#5FA97D] truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-[#2A322A] hover:bg-[#343F34] text-[#F4F2E6] text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#8B9A8C]">
                Anyone with this link can view your live position without needing an account.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 mb-6">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🚨 EMERGENCY ALERT from ${userName}! Track my live GPS location: ${trackingUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-[#12160F] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Dispatch Live Link via WhatsApp</span>
              </a>

              <a
                href="tel:112"
                className="w-full py-3 rounded-xl bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Dial National Emergency 112</span>
              </a>
            </div>

            {/* Resolve / I'm Safe Button */}
            <button
              type="button"
              onClick={handleResolveSos}
              className="w-full py-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Am Safe — Deactivate SOS Beacon</span>
            </button>
          </motion.div>
        </div>
      )}

      {/* Nearest Police Stations Modal */}
      <NearestPoliceModal
        isOpen={isPoliceModalOpen}
        onClose={() => setIsPoliceModalOpen(false)}
        userLat={coords.lat}
        userLng={coords.lng}
      />

      {/* Audio Shield Modal */}
      <AudioShieldModal
        isOpen={isAudioShieldOpen}
        onClose={() => setIsAudioShieldOpen(false)}
        callerName="Mom"
        delaySeconds={audioShieldDelay}
      />
    </>
  );
};
