'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Hospital,
  PhoneCall,
  AlertTriangle,
  Info,
  MapPin,
  ExternalLink,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SafetyBrief {
  destination: string;
  emergencyNumbers: {
    police: string;
    ambulance: string;
    nationalEmergency: string;
    touristHelpline: string;
  };
  medicalFacilities: Array<{
    name: string;
    type: 'hospital' | 'clinic' | 'trauma';
    address: string;
    phone: string;
    distance: string;
  }>;
  advisories: Array<{
    title: string;
    level: 'advisory' | 'warning' | 'info';
    details: string;
  }>;
  lastUpdated: string;
}

interface SafetyBriefPanelProps {
  destination: string;
  className?: string;
}

export const SafetyBriefPanel: React.FC<SafetyBriefPanelProps> = ({
  destination,
  className = '',
}) => {
  const [brief, setBrief] = useState<SafetyBrief | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSafetyBrief();
  }, [destination]);

  const fetchSafetyBrief = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/safety?action=destination-safety-brief&destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      if (data.success && data.brief) {
        setBrief(data.brief);
      }
    } catch (e) {
      console.warn('Failed to load destination safety brief:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#182318] via-[#121812] to-[#0A0D0A] border border-[#3A4E39]/70 text-stone-100 shadow-xl space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#253624] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Destination Safety & Health Brief</h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                F5.2 AI Brief
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Verified emergency contacts, nearest trauma facilities, and safety guidelines for {destination}
            </p>
          </div>
        </div>

        <button
          onClick={fetchSafetyBrief}
          disabled={isLoading}
          className="p-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh safety brief"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {isLoading && !brief ? (
        <div className="p-8 text-center space-y-2 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs">Analyzing regional medical & emergency logistics for {destination}...</p>
        </div>
      ) : brief ? (
        <div className="space-y-4">
          {/* Emergency Hotlines Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href={`tel:${brief.emergencyNumbers.nationalEmergency}`}
              className="p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all text-center group cursor-pointer"
            >
              <span className="text-[10px] uppercase font-bold text-rose-300 block">Unified Emergency</span>
              <span className="text-lg font-bold font-numeric text-white group-hover:text-rose-200">
                {brief.emergencyNumbers.nationalEmergency}
              </span>
            </a>

            <a
              href={`tel:${brief.emergencyNumbers.ambulance}`}
              className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-center group cursor-pointer"
            >
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Ambulance</span>
              <span className="text-lg font-bold font-numeric text-white group-hover:text-emerald-200">
                {brief.emergencyNumbers.ambulance}
              </span>
            </a>

            <a
              href={`tel:${brief.emergencyNumbers.police}`}
              className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all text-center group cursor-pointer"
            >
              <span className="text-[10px] uppercase font-bold text-blue-300 block">Police Dispatch</span>
              <span className="text-lg font-bold font-numeric text-white group-hover:text-blue-200">
                {brief.emergencyNumbers.police}
              </span>
            </a>

            <a
              href={`tel:${brief.emergencyNumbers.touristHelpline}`}
              className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-center group cursor-pointer"
            >
              <span className="text-[10px] uppercase font-bold text-amber-300 block">Tourist Helpline</span>
              <span className="text-lg font-bold font-numeric text-white group-hover:text-amber-200">
                {brief.emergencyNumbers.touristHelpline}
              </span>
            </a>
          </div>

          {/* Medical Facilities */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nearest Healthcare & Trauma Centers</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {brief.medicalFacilities.map((fac, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-black/35 border border-stone-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{fac.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 uppercase font-semibold">
                      {fac.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-stone-500 shrink-0" />
                    <span>{fac.address} ({fac.distance})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-0.5">
                    <PhoneCall className="w-3 h-3 text-emerald-500 shrink-0" />
                    <a href={`tel:${fac.phone}`} className="hover:underline font-mono">
                      {fac.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Advisories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Regional Safety Guidelines</span>
            </h4>
            <div className="space-y-2">
              {brief.advisories.map((adv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/25 border border-stone-800/70 flex items-start gap-2.5 text-xs"
                >
                  <div className="mt-0.5">
                    {adv.level === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-stone-200 block">{adv.title}</span>
                    <span className="text-stone-400 text-[11px] leading-relaxed block mt-0.5">
                      {adv.details}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
