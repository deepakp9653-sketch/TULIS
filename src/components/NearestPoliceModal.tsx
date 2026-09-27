'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <div className="fixed inset-0 z-50 bg-[#1C261F]/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="bg-[#F4F5EE] border-2 border-[#D1D8BE] p-6 sm:p-7 rounded-3xl max-w-lg w-full shadow-2xl relative text-left text-[#3B4953]"
      >
        <div className="flex items-center justify-between border-b border-[#D1D8BE] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4DD] border border-[#D1D8BE] text-[#5A7863] flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#3B4953]">
                Nearest Police & Support
              </h3>
              <p className="text-xs text-[#6B7C85]">
                Verified official assistance units located closest to you.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B7C85] hover:text-[#3B4953] hover:bg-[#EBF4DD] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Universal 112 Banner */}
        <div className="p-3.5 rounded-2xl bg-[#FFE4E6] border border-red-300 flex items-center justify-between mb-4 shadow-xs">
          <div>
            <span className="text-[10px] font-mono uppercase text-red-600 font-bold block">
              National Emergency Number
            </span>
            <span className="text-sm font-bold text-red-800">Dial 112 for All Emergencies</span>
          </div>
          <a
            href="tel:112"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>
        </div>

        {/* Station List */}
        {loading ? (
          <div className="p-8 text-center text-xs text-[#6B7C85]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#5A7863]" />
            Scanning nearest verified response units...
          </div>
        ) : (
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {stations.map((st) => (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl bg-white border border-[#D1D8BE] flex items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-[#3B4953] truncate">{st.name}</span>
                    {st.badge && (
                      <span className="text-[9px] bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                        {st.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#6B7C85] truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#5A7863] shrink-0" />
                    {st.vicinity}
                  </p>
                  <p className="text-[10px] text-[#5A7863] font-mono font-bold mt-0.5">
                    {st.distanceKm ? `~${st.distanceKm} km away` : 'Within 5 km radius'}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 shrink-0">
                  <a
                    href={`tel:${st.altPhone || st.phone || '112'}`}
                    className="px-3 py-1.5 rounded-xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(st.name + ' ' + st.vicinity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 rounded-lg bg-[#F4F5EE] hover:bg-[#EBF4DD] text-[#3B4953] border border-[#D1D8BE] text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Route</span>
                    <ExternalLink className="w-2.5 h-2.5 text-[#5A7863]" />
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
