'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  MapPin,
  Phone,
  AlertTriangle,
  Info,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { Trip, Participant } from '@/lib/types';
import { UserAvatar } from './UserAvatar';

interface DutyOfCareDashboardProps {
  orgName: string;
  trips: Trip[];
  participantsMap: Record<string, Participant[]>;
  className?: string;
}

export const DutyOfCareDashboard: React.FC<DutyOfCareDashboardProps> = ({
  orgName,
  trips = [],
  participantsMap = {},
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'safety_active' | 'sos'>('all');

  // Flatten travelers across all org trips
  const allTravelers: Array<{
    participant: Participant;
    trip: Trip;
    safetyActive: boolean;
    status: 'normal' | 'safety_active' | 'sos';
    lastPingLocation: string;
  }> = [];

  trips.forEach((t) => {
    const tripParts = participantsMap[t.id] || [];
    tripParts.forEach((p) => {
      const isSafety = Boolean(t.safetyModeEnabled);
      allTravelers.push({
        participant: p,
        trip: t,
        safetyActive: isSafety,
        status: isSafety ? 'safety_active' : 'normal',
        lastPingLocation: t.destination,
      });
    });
  });

  const filteredTravelers = allTravelers.filter((item) => {
    const matchesSearch =
      item.participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.trip.title.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === 'safety_active') return item.status === 'safety_active';
    if (filterMode === 'sos') return item.status === 'sos';
    return true;
  });

  const activeSafetyCount = allTravelers.filter((t) => t.safetyActive).length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Approved Compliance Disclaimer */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1b261b] via-[#121912] to-[#0A0D0A] border border-[#2B3E2A] space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#243523] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Corporate Duty-of-Care Portal</h3>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  FC.6 Safety Oversight
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-stone-900 text-stone-400 border border-stone-800">
                  Self-Reported / Opt-In Only
                </span>
              </div>
              <p className="text-xs text-stone-400">
                {orgName} • High-level status visibility for business travelers who enabled Safety Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold font-numeric text-emerald-400 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeSafetyCount} Safety Shields Active</span>
            </span>
          </div>
        </div>

        {/* Mandatory User-Approved Legal Compliance Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-stone-300">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Advisory Status Overview:</strong> Displays self-reported traveler Safety Mode and broadcasted SOS event pings for employees who explicitly opted into safety sharing. TULIS is a self-coordination platform and does not provide guaranteed emergency dispatch, 24/7 monitoring, or physical response services. In an emergency, contact local emergency services immediately.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee name, trip title, or destination..."
            className="w-full bg-[#131A13] border border-[#273726] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-stone-500 focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#131A13] border border-[#273726] text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterMode === 'all'
                ? 'bg-[#223221] text-emerald-400 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            All Personnel ({allTravelers.length})
          </button>
          <button
            onClick={() => setFilterMode('safety_active')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              filterMode === 'safety_active'
                ? 'bg-[#223221] text-emerald-400 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Safety Active ({activeSafetyCount})
          </button>
        </div>
      </div>

      {/* Personnel Duty-of-Care List */}
      <div className="space-y-3">
        {filteredTravelers.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-black/30 border border-stone-800 text-stone-500 text-xs">
            No employees match the selected filter.
          </div>
        ) : (
          filteredTravelers.map(({ participant: p, trip: t, safetyActive, status, lastPingLocation }, idx) => (
            <div
              key={`${t.id}-${p.id}-${idx}`}
              className="p-4 rounded-2xl bg-[#131B13] border border-[#263725] hover:border-[#384C36] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <UserAvatar name={p.name} id={p.id} avatarUrl={p.avatarUrl} size="md" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        safetyActive
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                          : 'bg-stone-900 text-stone-400 border-stone-800'
                      }`}
                    >
                      {safetyActive ? 'Safety Mode: Opted-In' : 'Standard Cohort'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-400">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span>{lastPingLocation}</span>
                    <span>•</span>
                    <span className="text-stone-300 font-medium">{t.title}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-[#222E21] pt-2 md:pt-0">
                <div className="text-right text-xs">
                  <span className="text-stone-400 block font-mono text-[11px]">
                    UPI: {p.upiId || 'On file'}
                  </span>
                  <span className="text-stone-400 text-[10px]">
                    Role: {p.isOrganizer ? 'Lead Organizer' : 'Delegate'}
                  </span>
                </div>

                <a
                  href={`mailto:${p.email}`}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Contact</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
