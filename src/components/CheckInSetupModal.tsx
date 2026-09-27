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
      console.warn('Failed to fetch check-in status:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSchedule = async (newActiveState?: boolean) => {
    setIsLoading(true);
    const targetActive = newActiveState !== undefined ? newActiveState : isActive;
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
          active: targetActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(targetActive ? `Check-in scheduled every ${intervalHours} hours` : 'Passive check-in deactivated');
        setIsActive(targetActive);
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      console.warn('Failed to save checkin:', e);
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
        setLastCheckIn(data.lastCheckIn || new Date().toISOString());
        setIsOverdue(false);
        setMessage('Check-in confirmed: traveler is safe 👍');
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (e) {
      console.warn('Failed to record checkin:', e);
    } finally {
      setIsResponding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C261F]/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-[#F4F5EE] border-2 border-[#D1D8BE] rounded-3xl shadow-2xl text-[#3B4953] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#D1D8BE] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF4DD] border border-[#D1D8BE] flex items-center justify-center text-[#5A7863] shadow-xs">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#3B4953] tracking-tight">Passive Check-In Schedule</h3>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#EBF4DD] text-[#5A7863] border border-[#D1D8BE]">
                    F5.3 Safety
                  </span>
                </div>
                <p className="text-xs text-[#6B7C85]">
                  Periodic peace-of-mind confirmation for solo activities & remote exploration
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#6B7C85] hover:text-[#3B4953] hover:bg-[#EBF4DD] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* Status Alert Pill */}
            {isOverdue && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 flex items-center gap-3 text-xs text-rose-800 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Check-In Overdue:</strong> Your scheduled safety check-in was due over 2 hours ago. Tap below to confirm you are safe.
                </span>
              </div>
            )}

            {message && (
              <div className="p-3 rounded-2xl bg-[#EBF4DD] border border-[#5A7863]/30 flex items-center gap-2 text-xs text-[#5A7863] font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-[#5A7863] shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Quick Check-In CTA Button */}
            <div className="p-4 rounded-2xl bg-white border border-[#D1D8BE] text-center space-y-3 shadow-xs">
              <span className="text-xs text-[#6B7C85] block font-medium">
                Current Status: <strong className="text-[#3B4953]">{isActive ? 'Schedule Active' : 'Schedule Inactive'}</strong>
              </span>

              <button
                onClick={handleCheckInNow}
                disabled={isResponding}
                className="w-full py-3.5 rounded-2xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {isResponding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ThumbsUp className="w-4 h-4" />
                )}
                <span>I&apos;m Safe &amp; All Good (1-Tap Check-In)</span>
              </button>

              {lastCheckIn && (
                <span className="text-[11px] text-[#6B7C85] font-mono block">
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
            <div className="space-y-3 pt-2 border-t border-[#D1D8BE]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#3B4953]">
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
                  className="rounded border-[#D1D8BE] text-[#5A7863] focus:ring-0 w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[#6B7C85] font-medium block">
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
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        intervalHours === hrs
                          ? 'bg-[#EBF4DD] border-[#5A7863] text-[#5A7863]'
                          : 'bg-white border-[#D1D8BE] text-[#6B7C85] hover:text-[#3B4953] hover:bg-[#F4F5EE]'
                      }`}
                    >
                      Every {hrs}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advisory Note */}
            <p className="text-[11px] text-[#6B7C85] leading-relaxed bg-white p-3 rounded-2xl border border-[#D1D8BE]">
              ℹ️ <strong>Advisory Note:</strong> Passive check-in is an opt-in squad safety reminder. If a scheduled check-in is overdue by &gt;2 hours, an alert will be flagged to your trip organizer. It is distinct from emergency services and does not broadcast an emergency SOS beacon.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#D1D8BE] bg-white flex items-center justify-end gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#F4F5EE] hover:bg-[#EBF4DD] text-[#6B7C85] hover:text-[#3B4953] text-xs font-medium cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => handleSaveSchedule()}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#5A7863] hover:bg-[#486350] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
