'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Users, Calendar, MapPin, Key, ShieldCheck, ArrowRight, RefreshCw, Compass } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-[#1B2119] border border-[#2A322A] p-6 rounded-3xl max-w-xl w-full shadow-2xl relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5FA97D]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2A322A] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5FA97D]/20 border border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">My Trips Dashboard</h3>
              <p className="text-xs text-[#8B9A8C]">
                Trips tied to <span className="text-[#5FA97D] font-semibold">{currentUser?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8B9A8C] hover:text-[#F4F2E6] hover:bg-[#2A322A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Capsule */}
        <div className="p-3.5 bg-[#12160F] rounded-2xl border border-[#2A322A] flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full border border-[#5FA97D] object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#5FA97D] text-[#12160F] font-bold flex items-center justify-center text-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#F4F2E6]">{currentUser?.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#5FA97D]/20 text-[#5FA97D] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <span className="text-[11px] text-[#8B9A8C]">{currentUser?.email}</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-[#2A322A] hover:bg-[#B5484C]/20 hover:text-[#B5484C] text-[11px] font-semibold text-[#8B9A8C] transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* Action Buttons: Create or Join */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => {
              onClose();
              onCreateNewTrip();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Trip</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onJoinTrip();
            }}
            className="py-2.5 px-3 rounded-xl bg-[#12160F] hover:bg-[#2A322A] border border-[#2A322A] text-[#F4F2E6] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Key className="w-4 h-4 text-[#5FA97D]" />
            <span>Join via Invite Code</span>
          </button>
        </div>

        {/* Trips List */}
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-[#8B9A8C]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#5FA97D]" />
              <span>Loading your accessible trips...</span>
            </div>
          ) : trips.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-[#2A322A] rounded-2xl p-4">
              <Compass className="w-8 h-8 text-[#8B9A8C]/50 mx-auto mb-2" />
              <p className="text-xs text-[#F4F2E6] font-semibold">No trips associated yet</p>
              <p className="text-[11px] text-[#8B9A8C] mt-1">
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
                      ? 'bg-[#5FA97D]/10 border-[#5FA97D] shadow-md'
                      : 'bg-[#12160F] hover:bg-[#2A322A]/70 border-[#2A322A]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-[#F4F2E6] group-hover:text-[#5FA97D] transition-colors">
                        {t.title}
                      </h4>
                      <span
                        className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded tracking-wider ${
                          isOrganizer
                            ? 'bg-[#3E7D5A]/40 text-[#5FA97D] border border-[#3E7D5A]'
                            : 'bg-[#2A322A] text-[#8B9A8C]'
                        }`}
                      >
                        {isOrganizer ? 'Organizer' : 'Member'}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-bold text-[#5FA97D] bg-[#5FA97D]/20 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-[#8B9A8C]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5FA97D]" />
                        {t.destination}
                      </span>
                      {t.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {t.startDate}
                        </span>
                      )}
                      {t.inviteCode && (
                        <span className="font-mono text-[10px] bg-[#1B2119] px-1.5 py-0.5 rounded border border-[#2A322A]">
                          Code: {t.inviteCode}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#5FA97D] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Switch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
