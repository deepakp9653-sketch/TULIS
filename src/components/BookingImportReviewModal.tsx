'use client';

import React, { useState } from 'react';
import {
  Mail,
  Plane,
  Hotel,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  Copy,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfidenceBadge } from './ui/ConfidenceBadge';
import { Booking, BookingCategory } from '@/lib/types';

interface BookingImportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  destination?: string;
  onBookingImported: (booking: Partial<Booking>) => void;
}

const SAMPLE_EMAILS = [
  {
    label: 'IndiGo Flight Email',
    text: `IndiGo Flight Confirmation
PNR: 6E-DEL924
Passenger: Alex Chen
Flight: 6E-502 from Delhi (DEL) to Goa (GOI)
Date: 2026-10-14, Departure: 08:35 AM, Arrival: 11:15 AM
Total Amount Paid: INR 6,850.00
Status: Confirmed`,
  },
  {
    label: 'Taj Hotel Booking Email',
    text: `Booking Confirmation - Taj Fort Aguada Resort & Spa
Confirmation Number: TAJ-GOA-7821
Guest Name: Alex Chen
Check-in: 2026-10-14 14:00
Check-out: 2026-10-18 11:00
Room Type: Deluxe Sea View Cottage
Total Lodging Cost: INR 34,500 (inclusive of taxes)
Payment Status: Completed`,
  },
];

export const BookingImportReviewModal: React.FC<BookingImportReviewModalProps> = ({
  isOpen,
  onClose,
  tripId,
  destination = 'Goa',
  onBookingImported,
}) => {
  const [emailText, setEmailText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields after extraction
  const [category, setCategory] = useState<BookingCategory>('general');
  const [title, setTitle] = useState('');
  const [vendor, setVendor] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [confirmationCode, setConfirmationCode] = useState('');

  if (!isOpen) return null;

  const handleExtract = async () => {
    if (!emailText.trim()) {
      setErrorMsg('Please paste the email content first.');
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extract-booking-email',
          emailText: emailText.trim(),
          destination,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to parse booking email');
      }

      const ext = data.extraction;
      setExtractedData(ext);

      // Populate editable fields
      setCategory(
        ext.category === 'flight' || ext.category === 'transport'
          ? 'transport'
          : ext.category === 'stay'
          ? 'lodging'
          : ext.category === 'activity'
          ? 'activity'
          : 'general'
      );
      setTitle(ext.title || 'Imported Travel Booking');
      setVendor(ext.vendor || 'Direct Vendor');
      setStartTime(ext.startTime ? ext.startTime.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setEndTime(ext.endTime ? ext.endTime.slice(0, 10) : '');
      setEstimatedCost(Number(ext.estimatedCost) || 0);
      setConfirmationCode(ext.confirmationCode || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error parsing email');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommit = () => {
    if (!title.trim()) {
      setErrorMsg('Booking title is required.');
      return;
    }

    const newBooking: Partial<Booking> = {
      id: 'bk-email-' + Date.now(),
      tripId,
      category,
      title: title.trim(),
      vendor: vendor.trim(),
      startTime: startTime || new Date().toISOString().slice(0, 10),
      endTime: endTime || undefined,
      estimatedCost,
      actualCost: estimatedCost,
      status: 'confirmed',
      confirmationCode: confirmationCode || undefined,
    };

    onBookingImported(newBooking);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setEmailText('');
    setExtractedData(null);
    setErrorMsg(null);
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Auto-Import Booking from Email
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-semibold">
                  F3.3
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Paste airline, hotel, or train confirmation text to extract verified fields
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-[#18251C] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!extractedData ? (
            /* Input View */
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-300">
                    Paste Forwarded Email Body
                  </label>
                  <div className="flex items-center gap-1.5">
                    {SAMPLE_EMAILS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setEmailText(s.text)}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#18251C] hover:bg-[#223528] text-emerald-400 border border-[#2B4333] transition-all cursor-pointer"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste e-ticket confirmation email, booking summary, PNR invoice text..."
                  className="w-full p-3.5 rounded-2xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs font-mono outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-stone-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  TULIS AI parses PNR codes, departure dates, hotel addresses, and payment totals automatically.
                </span>
              </div>
            </div>
          ) : (
            /* Review & Edit View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">Extracted Booking Attributes</span>
                  <ConfidenceBadge score={extractedData.confidenceScore || 0.9} />
                </div>
                <button
                  onClick={() => setExtractedData(null)}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer font-mono"
                >
                  Paste Different Email
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Booking Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] focus:border-emerald-500 text-stone-100 text-xs outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] text-stone-200 text-xs outline-none cursor-pointer"
                  >
                    <option value="transport">Flight / Train / Cab</option>
                    <option value="lodging">Hotel / Stay</option>
                    <option value="activity">Event / Tour</option>
                    <option value="food">Dining</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Vendor / Provider
                  </label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] text-stone-100 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Date / Start Time
                  </label>
                  <input
                    type="date"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] text-stone-100 text-xs outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Confirmation Code / PNR
                  </label>
                  <input
                    type="text"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] text-emerald-400 text-xs outline-none font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[10px] font-mono text-stone-400 block mb-1">
                    Estimated / Paid Amount (INR)
                  </label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#141E17] border border-[#26372B] text-emerald-300 text-xs font-mono font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#111A14] flex items-center justify-between">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          {!extractedData ? (
            <button
              onClick={handleExtract}
              disabled={isExtracting || !emailText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Booking...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Extract Booking</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCommit}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Commit to Itinerary</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
