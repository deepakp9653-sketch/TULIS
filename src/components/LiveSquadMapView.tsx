'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Compass,
  Clock,
  Battery,
  Send,
  Navigation,
  CheckCircle2,
  X,
  Sparkles,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant } from '@/lib/types';
import { UserAvatar } from './UserAvatar';

interface LiveSquadMapViewProps {
  isOpen: boolean;
  onClose: () => void;
  destination: string;
  participants: Participant[];
  currentUserId: string;
}

interface MemberStatus {
  participantId: string;
  locationName: string;
  statusText: string;
  lastUpdated: string;
  batteryLevel?: number;
}

const PRESET_STATUSES = [
  '🏨 Hotel Lobby / Rooms',
  '🏖️ At the Beach Shack',
  '🍽️ Exploring Local Dining',
  '🚕 In Transit / Cab',
  '✈️ En route to Airport',
  '🛍️ Night Market / Shopping',
];

export const LiveSquadMapView: React.FC<LiveSquadMapViewProps> = ({
  isOpen,
  onClose,
  destination,
  participants,
  currentUserId,
}) => {
  const [rendezvousPoint, setRendezvousPoint] = useState<string>('Hotel Lobby Lounge (Today at 8:00 PM)');
  const [isEditingRendezvous, setIsEditingRendezvous] = useState<boolean>(false);
  const [newRendezvousText, setNewRendezvousText] = useState<string>('');

  const [memberStatuses, setMemberStatuses] = useState<Record<string, MemberStatus>>(() => {
    const initial: Record<string, MemberStatus> = {};
    participants.forEach((p, idx) => {
      const sampleLocs = [
        'Curries & Cocktails Beachside',
        'Hotel Main Infinity Pool',
        'Anjuna Flea Market Stall #14',
        'Cab en route to Old Goa',
      ];
      initial[p.id] = {
        participantId: p.id,
        locationName: sampleLocs[idx % sampleLocs.length],
        statusText: idx === 0 ? 'Resting after lunch' : 'Grabbing coffee & sunset drinks',
        lastUpdated: `${(idx + 1) * 4} mins ago`,
        batteryLevel: 85 - idx * 12,
      };
    });
    return initial;
  });

  const [myCustomLocation, setMyCustomLocation] = useState('');

  if (!isOpen) return null;

  const handleUpdateStatus = (loc: string) => {
    setMemberStatuses((prev) => ({
      ...prev,
      [currentUserId]: {
        participantId: currentUserId,
        locationName: loc,
        statusText: 'Updated just now',
        lastUpdated: 'Just now',
        batteryLevel: 92,
      },
    }));
  };

  const handleSaveRendezvous = () => {
    if (newRendezvousText.trim()) {
      setRendezvousPoint(newRendezvousText.trim());
      setIsEditingRendezvous(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0C110E] border border-[#213025] rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col my-8"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#213025] flex items-center justify-between bg-[#111A14]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Squad Logistics & Rendezvous
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/40 font-semibold">
                  F3.4 Live Logistics
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Opt-in self-reported locations & rendezvous coordination across {destination}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#18251C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 flex-1">
          {/* Active Rendezvous Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#17251C] to-[#111B14] border border-[#2B3E2E] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span>Next Squad Rendezvous Point</span>
              </span>
              <button
                onClick={() => {
                  setNewRendezvousText(rendezvousPoint);
                  setIsEditingRendezvous(!isEditingRendezvous);
                }}
                className="text-[11px] font-mono text-emerald-400 hover:underline cursor-pointer"
              >
                {isEditingRendezvous ? 'Cancel' : 'Change'}
              </button>
            </div>

            {isEditingRendezvous ? (
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newRendezvousText}
                  onChange={(e) => setNewRendezvousText(e.target.value)}
                  placeholder="e.g. Thalassa Restaurant at 8:30 PM"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-[#0D150E] border border-[#2B3E2E] text-xs text-stone-200 outline-none"
                />
                <button
                  onClick={handleSaveRendezvous}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <p className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
                <span>{rendezvousPoint}</span>
              </p>
            )}
          </div>

          {/* Quick Status Update for Current User */}
          <div className="p-3.5 rounded-2xl bg-[#141E17] border border-[#26372B] space-y-2">
            <span className="text-xs font-bold text-white block">
              Update Your Current Spot
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_STATUSES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUpdateStatus(preset)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#0E1510] hover:bg-[#1A261D] text-stone-300 hover:text-white border border-[#26372B] transition cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Squad Member Positions */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Squad Member Check-ins ({participants.length})
            </span>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {participants.map((p) => {
                const stat = memberStatuses[p.id] || {
                  locationName: 'At Destination',
                  statusText: 'Active',
                  lastUpdated: 'Recently',
                  batteryLevel: 80,
                };
                const isMe = p.id === currentUserId;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-[#141E17] border border-[#26372B] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserAvatar name={p.name} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{p.name}</span>
                          {isMe && (
                            <span className="text-[10px] font-mono px-1 rounded bg-teal-950 text-teal-400 border border-teal-800/40">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-teal-300 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-teal-400" />
                          <span>{stat.locationName}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5">
                      <div className="flex items-center justify-end gap-1 text-[10px] text-stone-400 font-mono">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{stat.lastUpdated}</span>
                      </div>
                      {typeof stat.batteryLevel === 'number' && (
                        <div className="flex items-center justify-end gap-1 text-[10px] text-stone-400 font-mono">
                          <Battery className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{stat.batteryLevel}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
