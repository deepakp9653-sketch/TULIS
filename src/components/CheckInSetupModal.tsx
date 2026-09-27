'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Shield,
  ThumbsUp,
  Loader2,
  Calendar,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckInSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  participantId: string;
  participantName?: string;
}

export const CheckInSetupModal: React.FC<CheckInSetupModalProps> = ({
  isOpen,
  onClose,
  tripId,
  participantId,
  participantName = 'Traveler',
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [intervalHours, setIntervalHours] = useState<number>(12);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [nextDue, setNextDue] = useState<string | null>(null);
  const [isOverdue, setIsOverdue] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tripId && participantId) {
      fetchStatus();
    }
  }, [isOpen, tripId, participantId]);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/safety?action=get-checkin-status&tripId=${tripId}&participantId=${participantId}`);
      const data = await res.json();
      if (data.success) {
        setIsActive(Boolean(data.active));
        setIntervalHours(data.intervalHours || 12);
        setLastCheckIn(data.lastCheckIn);
        setNextDue(data.nextDue);
        setIsOverdue(Boolean(data.isOverdue));
      }
    } catch (e) {
      console.warn('Failed to load checkin status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async (newActiveState?: boolean) => {
    setIsLoading(true);
    const activeToSave = newActiveState !== undefined ? newActiveState : isActive;
    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setup-checkin',
          tripId,
          participantId,
          participantName,
          intervalHours,
          active: activeToSave,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsActive(activeToSave);
        setMessage(activeToSave ? `Passive check-in activated (every ${intervalHours}h)` : 'Check-in schedule paused');
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (e) {
      console.error('Failed to save checkin schedule:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInNow = async () => {
    setIsResponding(true);
    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'respond-checkin',
          tripId,
          participantId,
          status: 'safe',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastCheckIn(data.lastCheckIn);
        setIsOverdue(false);
        setMessage('Check-in confirmed: Status updated to Safe 👍');
        setTimeout(() => setMessage(null), 3500);
        fetchStatus();
      }
    } catch (e) {
      console.error('Failed to submit checkin:', e);
    } finally {
      setIsResponding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#182318] via-[#121812] to-[#0A0D0A] border border-[#3A4E39]/70 rounded-3xl shadow-2xl text-stone-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#263725] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Passive Check-In Schedule</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                    F5.3 Safety
                  </span>
                </div>
                <p className="text-xs text-stone-400">
                  Periodic peace-of-mind confirmation for solo activities & remote exploration
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Status Alert Pill */}
            {isOverdue && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>
                  <strong>Check-In Overdue:</strong> Your scheduled safety check-in was due over 2 hours ago. Tap below to confirm you are safe.
                </span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Quick Check-In CTA Button */}
            <div className="p-4 rounded-2xl bg-[#0e160e] border border-[#233321] text-center space-y-3">
              <span className="text-xs text-stone-300 block font-medium">
                Current Status: {isActive ? 'Schedule Active' : 'Schedule Inactive'}
              </span>

              <button
                onClick={handleCheckInNow}
                disabled={isResponding}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                {isResponding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                <span>I&apos;m Safe &amp; All Good (1-Tap Check-In)</span>
              </button>

              {lastCheckIn && (
                <span className="text-[11px] text-stone-400 font-mono block">
                  Last confirmed: {new Date(lastCheckIn).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
            </div>

            {/* Schedule Configuration Options */}
            <div className="space-y-3 pt-2 border-t border-[#233321]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-200">
                  Enable Scheduled Check-Ins
                </label>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setIsActive(next);
                    handleSaveSchedule(next);
                  }}
                  className="rounded border-stone-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-stone-400 font-medium block">
                  Prompt Interval
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 8, 12, 24].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => {
                        setIntervalHours(hrs);
                      }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        intervalHours === hrs
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      Every {hrs}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advisory Note */}
            <p className="text-[11px] text-stone-400 leading-relaxed bg-black/30 p-3 rounded-xl border border-stone-800/80">
              ℹ️ <strong>Advisory Note:</strong> Passive check-in is an opt-in squad safety reminder. If a scheduled check-in is overdue by &gt;2 hours, an alert will be flagged to your trip organizer. It is distinct from emergency services and does not broadcast an emergency SOS beacon.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#263725] bg-[#0c120c] flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 text-stone-300 hover:text-white text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={() => handleSaveSchedule()}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
