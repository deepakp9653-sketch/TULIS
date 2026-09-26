'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Phone,
  MapPin,
  ExternalLink,
  X,
  RefreshCw,
  Navigation,
  ShieldCheck,
} from 'lucide-react';

interface NearestPoliceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLat?: number;
  userLng?: number;
}

export const NearestPoliceModal: React.FC<NearestPoliceModalProps> = ({
  isOpen,
  onClose,
  userLat = 15.2993,
  userLng = 74.1240,
}) => {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/safety?action=nearby-police&lat=${userLat}&lng=${userLng}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.stations)) {
            setStations(data.stations);
          }
        })
        .catch((err) => console.warn('Police lookup error:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userLat, userLng]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#1B2119] border border-[#2A322A] p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl relative text-left"
      >
        <div className="flex items-center justify-between border-b border-[#2A322A] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">
                Nearest Police & Support
              </h3>
              <p className="text-xs text-[#8B9A8C]">
                Verified official assistance units located closest to you.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B9A8C] hover:text-[#F4F2E6] hover:bg-[#2A322A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Universal 112 Banner */}
        <div className="p-3.5 rounded-2xl bg-[#B5484C]/15 border border-[#B5484C]/30 flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#B5484C] font-bold block">
              National Emergency Number
            </span>
            <span className="text-sm font-bold text-[#F4F2E6]">Dial 112 for All Emergencies</span>
          </div>
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>
        </div>

        {/* Station List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8B9A8C]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#5FA97D]" />
            Scanning nearest verified response units...
          </div>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {stations.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl bg-[#12160F] border border-[#2A322A] flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#F4F2E6] truncate">{st.name}</span>
                    {st.badge && (
                      <span className="text-[9px] bg-[#5FA97D]/20 text-[#5FA97D] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                        {st.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#8B9A8C] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#5FA97D] shrink-0" />
                    {st.vicinity}
                  </p>
                  <p className="text-[10px] text-[#5FA97D] font-mono mt-0.5">
                    {st.distanceKm ? `~${st.distanceKm} km away` : 'Within 5 km radius'}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <a
                    href={`tel:${st.altPhone || st.phone || '112'}`}
                    className="px-3 py-1.5 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(st.name + ' ' + st.vicinity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-[#2A322A] text-[#8B9A8C] hover:text-[#F4F2E6] text-[10px] flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
