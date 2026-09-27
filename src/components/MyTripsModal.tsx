'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Calendar, MapPin, Key, ShieldCheck, ArrowRight, RefreshCw, Compass, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MyTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  currentTripId?: string;
  onSelectTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  onJoinTrip: () => void;
  onLogout: () => void;
  onOpenCloneTrip?: (trip: any) => void;
}

export const MyTripsModal: React.FC<MyTripsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentTripId,
  onSelectTrip,
  onCreateNewTrip,
  onJoinTrip,
  onLogout,
  onOpenCloneTrip,
}) => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchUserTrips();
    }
  }, [isOpen, currentUser]);

  const fetchUserTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trips?myTrips=true');
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips || []);
      } else {
        setError(data.error || 'Failed to fetch user trips');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#F4F5EE] dark:bg-[#151D18] border border-[#5A7863]/20 dark:border-[#2B3E2F] p-6 rounded-3xl max-w-xl w-full shadow-2xl relative overflow-hidden text-[#3B4953] dark:text-[#F4F2E6]"
      >
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#5A7863]/15 dark:border-[#2B3E2F] pb-4 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5A7863]/15 border border-[#5A7863]/30 text-[#5A7863] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#3B4953] dark:text-[#F4F2E6]">My Trips Dashboard</h3>
              <p className="text-xs text-[#5A7863] dark:text-[#8B9A8C]">
                Trips tied to <span className="text-[#3B4953] dark:text-[#D9EE86] font-semibold">{currentUser?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#5A7863] hover:text-[#3B4953] dark:text-[#8B9A8C] dark:hover:text-[#F4F2E6] hover:bg-[#E8EEDC] dark:hover:bg-[#2A322A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Capsule */}
        <div className="p-3.5 bg-[#E8EEDC] dark:bg-[#101712] rounded-2xl border border-[#5A7863]/15 dark:border-[#2A322A] flex items-center justify-between mb-5 relative z-10">
          <div className="flex items-center gap-3">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border border-[#5A7863] object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#5A7863] text-[#EBF4DD] font-bold flex items-center justify-center text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#3B4953] dark:text-[#F4F2E6]">{currentUser?.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5A7863]/15 text-[#5A7863] dark:text-[#D9EE86] flex items-center gap-1 border border-[#5A7863]/25">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <span className="text-[11px] text-[#78887B] dark:text-[#8B9A8C]">{currentUser?.email}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-rose-500/15 hover:text-rose-600 dark:hover:text-rose-400 border border-surface-hairline text-[11px] font-semibold text-[#5A7863] transition-colors cursor-pointer"
          >
            Log Out
          </button>
        </div>

        {/* Action Buttons: Create or Join */}
        <div className="grid grid-cols-2 gap-3 mb-5 relative z-10">
          <button
            onClick={() => {
              onClose();
              onCreateNewTrip();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onJoinTrip();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#E8EEDC] hover:bg-[#DDE5D0] dark:bg-[#101712] dark:hover:bg-[#1F2B22] border border-[#5A7863]/20 dark:border-[#2A322A] text-[#3B4953] dark:text-[#F4F2E6] font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Key className="w-4 h-4 text-[#5A7863]" />
            <span>Join via Invite Code</span>
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 relative z-10">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#78887B]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#5A7863]" />
              <span>Loading your accessible trips...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#5A7863]/25 rounded-2xl p-4">
              <Compass className="w-8 h-8 text-[#78887B]/50 mx-auto mb-2" />
              <p className="text-xs text-[#3B4953] dark:text-[#F4F2E6] font-semibold">No trips associated yet</p>
              <p className="text-[11px] text-[#78887B] dark:text-[#8B9A8C] mt-1">
                Create a new trip or ask your squad organizer for their 6-character Trip Invite Code.
              </p>
            </div>
          ) : (
            trips.map((t) => {
              const isCurrent = t.id === currentTripId;
              const isOrganizer = t.userRole === 'organizer' || t.organizerId === currentUser?.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    onSelectTrip(t.id);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isCurrent
                      ? 'bg-[#5A7863]/10 border-[#5A7863] shadow-sm'
                      : 'bg-[#FFFFFF] hover:bg-[#E8EEDC]/60 dark:bg-[#101712] dark:hover:bg-[#1F2B22] border-[#5A7863]/15 dark:border-[#2A322A]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-[#3B4953] dark:text-[#F4F2E6] group-hover:text-[#5A7863] transition-colors">
                        {t.title}
                      </h4>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded tracking-wider ${
                          isOrganizer
                            ? 'bg-[#5A7863]/15 text-[#5A7863] border border-[#5A7863]/30 font-bold'
                            : 'bg-[#E8EEDC] text-[#5A7863] dark:bg-[#2A322A] dark:text-[#8B9A8C]'
                        }`}
                      >
                        {isOrganizer ? 'Organizer' : 'Member'}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-[#713F12] bg-[#FEF9C3] border border-[#FDE047] px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#78887B] dark:text-[#8B9A8C]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5A7863]" />
                        {t.destination}
                      </span>
                      {t.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.startDate}
                        </span>
                      )}
                      {t.inviteCode && (
                        <span className="font-mono text-[10px] bg-[#FEF9C3] text-[#713F12] px-1.5 py-0.5 rounded border border-[#FDE047]/60">
                          Code: {t.inviteCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenCloneTrip && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onOpenCloneTrip(t);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#E8EEDC] hover:bg-[#DDE5D0] dark:bg-[#182418] dark:hover:bg-[#233522] border border-[#5A7863]/20 dark:border-[#2D3E2C] text-[#5A7863] dark:text-emerald-400 transition-colors text-[11px] font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Clone itinerary skeleton (Trip DNA)"
                      >
                        <Dna className="w-3 h-3 text-[#5A7863]" />
                        <span>Clone</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1 text-xs font-semibold text-[#5A7863] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Switch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
