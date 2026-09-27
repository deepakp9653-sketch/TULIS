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
  Clock,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { NearestPoliceModal } from './NearestPoliceModal';
import { AudioShieldModal } from './AudioShieldModal';
import { CheckInSetupModal } from './CheckInSetupModal';

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
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
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
          action: 'trigger-sos',
          tripId,
          userId,
          userName,
          userPhone,
          lat: currentLat,
          lng: currentLng,
        }),
      });

      const data = await res.json();
      if (data.success && data.event) {
        setSosEventId(data.event.id);
        setIsSosActive(true);
        setIsExpanded(false);

        // Start high-frequency location ping watch ref
        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              fetch('/api/safety', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'update-location',
                  eventId: data.event.id,
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                }),
              }).catch(() => {});
            },
            (err) => console.warn('Watch position error:', err),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );
        }
      }
    } catch (err) {
      console.error('Trigger SOS error:', err);
    } finally {
      setSosLoading(false);
    }
  };

  // Resolve Emergency SOS
  const handleResolveSos = async () => {
    if (!sosEventId) return;
    try {
      await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve-sos',
          eventId: sosEventId,
        }),
      });

      if (watchIdRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      setIsSosActive(false);
      setSosEventId(null);
    } catch (err) {
      console.error('Resolve SOS error:', err);
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
      {/* Floating Safety Dock Pill in Right Corner at the Bottom */}
      <aside
        aria-label="Safety controls"
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2.5"
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="bg-[#F4F5EE] border-2 border-[#D1D8BE] p-3.5 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 min-w-[240px] text-[#3B4953]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#D1D8BE] px-1">
                <span className="text-[11px] font-mono font-bold text-[#854D0E] bg-[#FEF9C3] px-2 py-0.5 rounded-full border border-[#FDE047] uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Human Safety Suite
                </span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-[#6B7C85] hover:text-[#3B4953] p-1 rounded-lg hover:bg-[#EBF4DD] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Action 1: Call Emergency 112 */}
              <a
                href="tel:112"
                className="px-3 py-2.5 rounded-2xl bg-[#FFE4E6] hover:bg-[#FECDD3] border border-red-300 text-red-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  <span>Call Emergency 112</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-600 text-white font-bold">
                  DIAL
                </span>
              </a>

              {/* Action 2: Trigger Live GPS SOS Beacon */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  handleTriggerSos();
                }}
                disabled={sosLoading}
                className="px-3 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>{sosLoading ? 'Arming Beacon...' : 'Broadcast Live SOS'}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80">GPS</span>
              </button>

              {/* Action 3: Nearest Police & Medical Help */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setIsPoliceModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] text-xs font-semibold flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#5A7863]" />
                <span>Nearest Police & Hospitals</span>
              </button>

              {/* Action 4: Audio Shield (Fake Call Exit Strategy) */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setAudioShieldDelay(0);
                  setIsAudioShieldOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#5A7863]" />
                  <span>Audio Shield Deterrent</span>
                </div>
                <span className="text-[9px] bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] px-1.5 py-0.5 rounded font-mono font-bold">
                  Fake Call
                </span>
              </button>

              {/* Action 5: Safety Check-In Timer */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  setIsCheckInModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#3B4953] text-xs font-semibold flex items-center justify-between transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#5A7863]" />
                  <span>Safety Check-In Timer</span>
                </div>
                <span className="text-[9px] text-[#6B7C85] font-mono">Dead-Man</span>
              </button>

              {/* Action 6: Manage Emergency Contacts */}
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenContacts();
                }}
                className="px-3 py-2 rounded-xl bg-white hover:bg-[#EBF4DD] border border-[#D1D8BE] text-[#6B7C85] hover:text-[#3B4953] text-xs flex items-center gap-2 transition-colors text-left cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#5A7863]" />
                <span>Emergency Contacts</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Primary Dock Pill / SOS Button in Bottom Right Corner */}
        <div className="flex items-center gap-2 select-none">
          {!isSosActive ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                disabled={sosLoading}
                title="Tap for Emergency SOS Quick Features Suite"
                className="h-12 px-4.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 border-2 border-red-300 ring-4 ring-red-500/30 animate-pulse transition-all cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                <span>{sosLoading ? 'Arming SOS...' : '🚨 EMERGENCY SOS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title="Toggle safety options"
                className="w-12 h-12 rounded-full bg-[#F4F5EE] border-2 border-[#D1D8BE] hover:border-red-400 text-red-600 flex items-center justify-center shadow-xl transition-all cursor-pointer"
              >
                <ShieldAlert className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <button
                type="button"
                onClick={() => setIsSosActive(true)}
                className="h-12 px-4.5 rounded-full bg-red-600 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 ring-4 ring-red-500/50 animate-bounce cursor-pointer border-2 border-white"
              >
                <Radio className="w-4 h-4 animate-spin" />
                <span>🚨 LIVE SOS BEACON ACTIVE (TAP)</span>
              </button>
            </motion.div>
          )}
        </div>
      </aside>

      {/* Active SOS Modal Dashboard */}
      {isSosActive && (
        <div className="fixed inset-0 z-50 bg-[#1C261F]/80 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#F4F5EE] border-2 border-red-500/60 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-left text-[#3B4953]"
          >
            <div className="flex items-center gap-3 border-b border-[#D1D8BE] pb-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Radio className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-red-700">
                  Live SOS Beacon Active
                </h3>
                <p className="text-xs text-[#6B7C85]">
                  Your real-time GPS coordinates are being recorded and broadcast.
                </p>
              </div>
            </div>

            {/* Tracking Link Capsule */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#D1D8BE] space-y-2 mb-5 shadow-xs">
              <span className="text-[11px] font-mono text-[#6B7C85] uppercase font-semibold block">
                Public Live Tracking Link
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={trackingUrl}
                  className="flex-1 bg-[#F4F5EE] border border-[#D1D8BE] rounded-xl px-3 py-2 text-xs font-mono text-[#5A7863] font-bold truncate outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-[#5A7863] hover:bg-[#486350] text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#6B7C85]">
                Anyone with this link can view your live position without needing an account.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5 mb-6">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `🚨 EMERGENCY ALERT from ${userName}! Track my live GPS location: ${trackingUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Dispatch Live Link via WhatsApp</span>
              </a>

              <a
                href="tel:112"
                className="w-full py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Dial National Emergency 112</span>
              </a>
            </div>

            {/* Resolve / I'm Safe Button */}
            <button
              type="button"
              onClick={handleResolveSos}
              className="w-full py-3.5 rounded-2xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
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

      {/* Check-In Setup Modal */}
      <CheckInSetupModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        tripId={tripId || 'default'}
        participantId={userId}
        participantName={userName}
      />
    </>
  );
};
