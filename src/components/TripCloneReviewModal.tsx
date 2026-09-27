'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Booking } from '@/lib/types';
import {
  X,
  Dna,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Hotel,
  Plane,
  Car,
  Utensils,
  Compass,
  ArrowRight,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TripCloneReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTrip: Trip | any;
  bookings: Booking[];
  currentUserId?: string;
  onTripCloned: (clonedTrip: any) => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  stay: Hotel,
  lodging: Hotel,
  flight: Plane,
  transport: Plane,
  train: Compass,
  rental: Car,
  activity: Compass,
  dining: Utensils,
  food: Utensils,
};

export const TripCloneReviewModal: React.FC<TripCloneReviewModalProps> = ({
  isOpen,
  onClose,
  sourceTrip,
  bookings,
  currentUserId,
  onTripCloned,
}) => {
  const [targetTitle, setTargetTitle] = useState('');
  const [targetStartDate, setTargetStartDate] = useState('');
  const [selectedBookingIds, setSelectedBookingIds] = useState<string[]>([]);
  const [isCloning, setIsCloning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceTrip) {
      setTargetTitle(`${sourceTrip.title} (Clone)`);
      const today = new Date().toISOString().split('T')[0];
      setTargetStartDate(today);
      setSelectedBookingIds((bookings || []).map((b) => b.id));
      setError(null);
    }
  }, [sourceTrip, bookings]);

  if (!isOpen || !sourceTrip) return null;

  const handleToggleBooking = (id: string) => {
    setSelectedBookingIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    if (selectedBookingIds.length === bookings.length) {
      setSelectedBookingIds([]);
    } else {
      setSelectedBookingIds(bookings.map((b) => b.id));
    }
  };

  const selectedBookings = bookings.filter((b) => selectedBookingIds.includes(b.id));
  const estimatedSkeletonCost = selectedBookings.reduce(
    (sum, b) => sum + (Number(b.estimatedCost) || 0),
    0
  );

  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) return;

    setIsCloning(true);
    setError(null);

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clone-itinerary',
          sourceTripId: sourceTrip.id,
          targetTitle: targetTitle.trim(),
          targetStartDate,
          selectedBookingIds,
          targetUserId: currentUserId,
        }),
      });

      const data = await res.json();
      if (data.success && data.newTrip) {
        onTripCloned(data.newTrip);
        onClose();
      } else {
        setError(data.error || 'Failed to clone trip itinerary');
      }
    } catch (err: any) {
      console.error('Clone error:', err);
      setError(err.message || 'Network error while cloning');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl shadow-2xl shadow-emerald-950/50 text-stone-100 flex flex-col overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
                <Dna className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold tracking-tight text-white">Trip DNA: Clone Skeleton</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                    Itinerary Fork
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Duplicate verified reservations & timeline from &ldquo;{sourceTrip.title}&rdquo; into a fresh workspace
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form and Scrollable List */}
          <form onSubmit={handleCloneSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300">
                  {error}
                </div>
              )}

              {/* Destination Pill & Basic Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Cloned Trip Title
                  </label>
                  <input
                    type="text"
                    required
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="e.g. Goa Reunion 2026"
                    className="w-full px-3.5 py-2.5 bg-[#121A12] border border-[#2D3F2C] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                    Target Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetStartDate}
                    onChange={(e) => setTargetStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#121A12] border border-[#2D3F2C] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Skeleton Summary Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#172418] to-[#121A12] border border-[#2D3F2C] flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 block">Baseline Skeleton Estimate</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    ₹{estimatedSkeletonCost.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-300 bg-[#233122] px-2.5 py-1 rounded-xl border border-[#374B35]">
                    {selectedBookingIds.length} of {bookings.length} Bookings Selected
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleAll}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    {selectedBookingIds.length === bookings.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Bookings Checklist */}
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider">
                  Select Bookings to Duplicate into New Itinerary
                </label>

                {bookings.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4 text-center">
                    No bookings logged in source trip. A blank clone will be generated.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((b) => {
                      const isChecked = selectedBookingIds.includes(b.id);
                      const IconComp = CATEGORY_ICONS[b.category] || Compass;

                      return (
                        <div
                          key={b.id}
                          onClick={() => handleToggleBooking(b.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isChecked
                              ? 'bg-[#142015] border-emerald-600/60 shadow-sm'
                              : 'bg-[#0E130E] border-[#222E21] opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                                isChecked
                                  ? 'bg-emerald-600 border-emerald-500 text-white'
                                  : 'border-stone-600 bg-transparent'
                              }`}
                            >
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>

                            <div className="p-1.5 rounded-lg bg-[#1D2B1C] border border-[#2D3E2C] text-emerald-400 shrink-0">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>

                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-xs text-white truncate">{b.title}</span>
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#1D2B1C] text-stone-400">
                                  {b.category}
                                </span>
                              </div>
                              <p className="text-[11px] text-stone-400 truncate">
                                Vendor: {b.vendor || 'Standard Operator'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-mono font-bold text-emerald-400">
                              ₹{(b.estimatedCost || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="block text-[10px] text-stone-500">Reset to Confirmed</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#232F22] bg-[#0E130E] shrink-0 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isCloning || selectedBookingIds.length === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold tracking-wide shadow-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/70 hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none transition-all"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Forking Trip DNA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Clone Itinerary Skeleton ({selectedBookingIds.length})</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
