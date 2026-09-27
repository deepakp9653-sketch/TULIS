'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  X,
  Compass,
  CheckCircle2,
  Calendar,
  Layers,
  Check,
  Plus,
  ArrowRight,
  Download,
  Upload,
  Globe,
  Tag,
} from 'lucide-react';
import { Trip, Booking } from '@/lib/types';
import {
  parseUniversalItinerary,
  CURATED_ITINERARY_TEMPLATES,
  MappedItineraryResult,
} from '@/lib/itinerary-dna-mapper';

interface UniversalItineraryImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onImportBookings: (newBookings: Booking[]) => void;
}

export const UniversalItineraryImporterModal: React.FC<UniversalItineraryImporterModalProps> = ({
  isOpen,
  onClose,
  trip,
  onImportBookings,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'templates' | 'json'>('templates');
  const [rawText, setRawText] = useState<string>(
    `Day 1: Airport Private Cab to Old Manali Chalet (₹2500)
Day 1: Boutique River Cottage Check-in (₹6000)
Day 2: 4x4 High-Altitude Drive to Atal Tunnel & Sissu Falls (₹4500)
Day 2: Trout Fish & Local Siddu Dinner at Johnson's Cafe (₹2200)
Day 3: Solang Valley Paragliding & Adventure Pass (₹3500)`
  );
  const [startDate, setStartDate] = useState<string>(trip.startDate || '2026-10-01');
  const [parsedResult, setParsedResult] = useState<MappedItineraryResult | null>(null);

  const handleParse = (textToParse?: string) => {
    const input = textToParse || rawText;
    const result = parseUniversalItinerary(input, trip.id, startDate);
    setParsedResult(result);
  };

  const handleSelectTemplate = (templateMarkdown: string) => {
    setRawText(templateMarkdown);
    const result = parseUniversalItinerary(templateMarkdown, trip.id, startDate);
    setParsedResult(result);
    setActiveTab('text');
  };

  const toggleBookingSelection = (tempId: string) => {
    if (!parsedResult) return;
    setParsedResult({
      ...parsedResult,
      bookings: parsedResult.bookings.map((b) =>
        b.tempId === tempId ? { ...b, selected: !b.selected } : b
      ),
    });
  };

  const handleCommitImport = () => {
    if (!parsedResult) return;
    const selectedBookings = parsedResult.bookings.filter((b) => b.selected);
    if (selectedBookings.length === 0) return;

    const committedBookings: Booking[] = selectedBookings.map((b, idx) => ({
      id: `bk-dna-${Date.now()}-${idx}`,
      tripId: trip.id,
      category: b.category,
      title: b.title,
      vendor: b.vendor,
      startTime: b.startTime,
      endTime: b.endTime,
      estimatedCost: b.estimatedCost,
      actualCost: b.actualCost,
      status: 'confirmed',
      participantIds: [],
      confirmationCode: b.confirmationCode,
    }));

    onImportBookings(committedBookings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-[#0E1511] border border-[#213025] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#213025] bg-[#121B15] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500/20 to-emerald-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-inner">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono">
                  Universal Itinerary DNA Importer
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-teal-950 text-teal-300 border border-teal-800/60 font-mono font-bold uppercase">
                  F-M4
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Map TripIt, Wanderlog, ChatGPT itineraries or curated templates into {trip.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1A261E] text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="px-5 py-2.5 bg-[#0A0F0C] border-b border-[#213025] flex items-center gap-2 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
              activeTab === 'templates'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            ✨ Curated DNA Templates
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
              activeTab === 'text'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            📝 Paste Text / Notes
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer font-medium ${
              activeTab === 'json'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            📦 TripIt / Wanderlog JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Curated Templates */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-stone-400 block">
                  Select a Pre-Built Expedition Skeleton
                </span>
                <span className="text-[11px] font-mono text-emerald-400">1-Click Load</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CURATED_ITINERARY_TEMPLATES.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl.markdown)}
                    className="p-4 rounded-2xl bg-[#111A14] hover:bg-[#16221A] border border-[#213025] hover:border-emerald-500/40 transition-all cursor-pointer group space-y-2.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                        {tpl.durationDays} Days
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-stone-400 mt-0.5">{tpl.destination}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tpl.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#16221A] text-stone-400 border border-[#233527]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2 & 3: Paste Text or JSON */}
          {(activeTab === 'text' || activeTab === 'json') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase text-stone-400 block">
                  {activeTab === 'json' ? 'Paste TripIt / Wanderlog JSON' : 'Paste Day-by-Day Itinerary Text'}
                </span>
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400">
                  <span>Start Date:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-[#16221A] border border-[#26372B] rounded-lg px-2 py-1 text-white text-xs focus:outline-none"
                  />
                </div>
              </div>

              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={7}
                placeholder={
                  activeTab === 'json'
                    ? 'Paste { "places": [...], "days": [...] } or TripIt export JSON...'
                    : 'Paste: Day 1: Flight to Goa (₹4000)\nDay 1: Check-in Villa (₹12000)\nDay 2: Scuba diving...'
                }
                className="w-full bg-[#080C09] border border-[#213025] focus:border-emerald-500/50 rounded-2xl p-3.5 text-xs font-mono text-stone-200 focus:outline-none resize-none leading-relaxed"
              />

              <button
                type="button"
                onClick={() => handleParse()}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-teal-950/40"
              >
                <Sparkles className="w-4 h-4" />
                <span>Parse & Extract Itinerary DNA</span>
              </button>
            </div>
          )}

          {/* Review Parsed Bookings Stage */}
          {parsedResult && (
            <div className="space-y-3 pt-3 border-t border-[#213025]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white font-mono">
                    Extracted {parsedResult.bookings.length} Bookings (Confidence: {(parsedResult.confidence * 100).toFixed(0)}%)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-stone-400">
                  {parsedResult.bookings.filter((b) => b.selected).length} selected for import
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {parsedResult.bookings.map((b) => (
                  <div
                    key={b.tempId}
                    onClick={() => toggleBookingSelection(b.tempId)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                      b.selected
                        ? 'bg-[#142018] border-emerald-500/40 text-stone-200'
                        : 'bg-[#0E1511] border-[#213025] opacity-50 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                          b.selected
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'border-[#26372B]'
                        }`}
                      >
                        {b.selected && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="font-semibold text-white">{b.title}</div>
                        <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2 mt-0.5">
                          <span className="uppercase text-emerald-400 font-bold">{b.category}</span>
                          <span>•</span>
                          <span>{b.startTime.split('T')[0]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-emerald-300">
                      ₹{b.estimatedCost.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={parsedResult.bookings.filter((b) => b.selected).length === 0}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Commit & Import {parsedResult.bookings.filter((b) => b.selected).length} Bookings into {trip.title}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#121B15] flex items-center justify-between text-xs font-mono text-stone-400">
          <span>Seamless Universal DNA Ingestion</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#16221A] hover:bg-[#203025] text-white font-bold transition cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
