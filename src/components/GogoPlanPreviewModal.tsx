'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Wallet,
  MapPin,
  CheckCircle2,
  X,
  Hotel,
  Plane,
  Car,
  Utensils,
  Compass,
  ArrowRight,
  Loader2,
  PartyPopper,
  Phone,
  Globe,
  Star,
  ExternalLink,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface BookingDraft {
  title: string;
  category: 'stay' | 'flight' | 'train' | 'rental' | 'activity' | 'dining';
  vendor: string;
  estimatedCost: number;
  dayNumber: number;
  description: string;
  phone?: string;
  website?: string;
  googleMapsUrl?: string;
  address?: string;
  rating?: number;
  userRatingsTotal?: number;
  highlights?: string[];
  bestTimeToVisit?: string;
  isGoogleVerified?: boolean;
}

interface GeneratedPlan {
  title: string;
  destination: string;
  estimatedBudget: number;
  daysCount: number;
  summary: string;
  bookings: BookingDraft[];
}

interface GogoPlanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: GeneratedPlan | null;
  onTripCreated: (createdTrip: any) => void;
  currentUserId?: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  stay: Hotel,
  flight: Plane,
  train: Compass,
  rental: Car,
  activity: Compass,
  dining: Utensils,
};

const CATEGORY_COLORS: Record<string, string> = {
  stay: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
  flight: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
  train: 'text-purple-400 bg-purple-950/40 border-purple-800/40',
  rental: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
  activity: 'text-teal-400 bg-teal-950/40 border-teal-800/40',
  dining: 'text-rose-400 bg-rose-950/40 border-rose-800/40',
};

export const GogoPlanPreviewModal: React.FC<GogoPlanPreviewModalProps> = ({
  isOpen,
  onClose,
  plan,
  onTripCreated,
  currentUserId,
}) => {
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(plan);
  const [isSaving, setIsSaving] = useState(false);
  const [successTrip, setSuccessTrip] = useState<any | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [swapNotification, setSwapNotification] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setCurrentPlan(plan);
    }
  }, [plan]);

  if (!isOpen || !currentPlan) return null;

  const handleSwapSpot = async (index: number) => {
    if (swappingIndex !== null || !currentPlan) return;
    const targetBooking = currentPlan.bookings[index];
    if (!targetBooking) return;

    setSwappingIndex(index);
    setSwapNotification(null);

    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'swap-spot',
          destination: currentPlan.destination,
          category: targetBooking.category,
          currentTitle: targetBooking.title,
          currentVendor: targetBooking.vendor,
          dayNumber: targetBooking.dayNumber,
          budgetLimit: targetBooking.estimatedCost,
        }),
      });

      const data = await res.json();
      if (data.success && data.newBooking) {
        const updatedBookings = [...currentPlan.bookings];
        updatedBookings[index] = data.newBooking;
        const newTotal = updatedBookings.reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
        setCurrentPlan({
          ...currentPlan,
          bookings: updatedBookings,
          estimatedBudget: newTotal,
        });
        setSwapNotification(`✨ Swapped to "${data.newBooking.title}"!`);
        setTimeout(() => setSwapNotification(null), 4000);
      } else {
        alert(data.error || 'Failed to find alternative spot.');
      }
    } catch (err) {
      console.error('Swap spot error:', err);
      alert('Network error while swapping spot.');
    } finally {
      setSwappingIndex(null);
    }
  };

  const handleMaterializeTrip = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'convert-to-trip',
          plan: currentPlan,
          targetUserId: currentUserId,
        }),
      });

      const data = await res.json();
      if (data.success && data.trip) {
        setSuccessTrip(data.trip);
        setTimeout(() => {
          onTripCreated(data.trip);
          onClose();
          setSuccessTrip(null);
        }, 1400);
      } else {
        alert(data.error || 'Failed to save trip to Neon database.');
      }
    } catch (err) {
      console.error('Failed to convert plan to trip:', err);
      alert('Error saving trip. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl shadow-2xl shadow-emerald-950/50 text-stone-100 flex flex-col overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">Gogo Blueprint Review</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                  Ready to Materialize
                </span>
              </div>
              <p className="text-xs text-stone-400">Review AI-structured itinerary and booking reservations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Swap notification banner */}
          {swapNotification && (
            <div className="p-3.5 bg-emerald-950/70 border border-emerald-700/60 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-emerald-300 shadow-lg shadow-emerald-950/50 animate-in fade-in duration-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 animate-spin" />
              <span>{swapNotification}</span>
            </div>
          )}

          {/* Hero Trip Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#172418] to-[#121A12] border border-[#2D3F2C] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-white tracking-tight">{currentPlan.title}</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                  <MapPin className="w-3.5 h-3.5" />
                  {currentPlan.destination}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl bg-[#233122] text-stone-300 border border-[#374B35]">
                  <Calendar className="w-3.5 h-3.5" />
                  {currentPlan.daysCount} Days
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">{currentPlan.summary}</p>

            <div className="pt-2 border-t border-[#293A28] flex items-center justify-between">
              <span className="text-xs text-stone-400 font-medium">Estimated Total Budget</span>
              <span className="text-base font-bold text-emerald-400 font-mono">
                ₹{currentPlan.estimatedBudget?.toLocaleString('en-IN') || '0'}
              </span>
            </div>
          </div>

          {/* Bookings & Activities List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Generated Itinerary & Bookings ({currentPlan.bookings?.length || 0})
              </h4>
              <span className="text-[11px] text-stone-500">Auto-saved as draft reservations</span>
            </div>

            <div className="space-y-3">
              {currentPlan.bookings?.map((item, index) => {
                const IconComponent = CATEGORY_ICONS[item.category] || Compass;
                const colorClass =
                  CATEGORY_COLORS[item.category] || 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';

                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-[#131A13] border border-[#233022] hover:border-[#384C36] transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl border shrink-0 ${colorClass}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#1C261B] text-stone-400 border border-[#2C3B2B]">
                              Day {item.dayNumber}
                            </span>
                            {item.rating && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/40 text-[10px] font-bold text-amber-400">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                <span>{item.rating}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 font-medium">Vendor: {item.vendor}</div>
                          {item.address && (
                            <div className="text-[10px] text-stone-500 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-emerald-500/70" />
                              <span className="truncate max-w-[280px] sm:max-w-md">{item.address}</span>
                            </div>
                          )}
                          <div className="text-xs text-stone-300 leading-snug">{item.description}</div>

                          {/* Highlights pills */}
                          {item.highlights && item.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {item.highlights.map((h, hIdx) => (
                                <span
                                  key={hIdx}
                                  className="px-2 py-0.5 rounded-md bg-[#192419] border border-[#273727] text-[10px] text-emerald-300/90 font-medium"
                                >
                                  ✨ {h}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Best time to visit */}
                          {item.bestTimeToVisit && (
                            <div className="text-[10px] text-amber-300/80 flex items-center gap-1 pt-0.5">
                              <Clock className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>Best time: {item.bestTimeToVisit}</span>
                            </div>
                          )}

                          {/* Google Maps, Website & Direct Call Row */}
                          {(item.phone || item.website || item.googleMapsUrl) && (
                            <div className="pt-2 flex flex-wrap items-center gap-1.5">
                              {item.phone && (
                                <a
                                  href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/50 text-[11px] font-semibold text-emerald-300 transition-colors shadow-sm"
                                  title="Click to call vendor"
                                >
                                  <Phone className="w-3 h-3 text-emerald-400" />
                                  <span>{item.phone}</span>
                                </a>
                              )}

                              {item.website && (
                                <a
                                  href={item.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1D281D] hover:bg-[#263725] border border-[#354933] text-[11px] font-medium text-stone-200 transition-colors"
                                >
                                  <Globe className="w-3 h-3 text-teal-400" />
                                  <span>Official Site</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              )}

                              {item.googleMapsUrl && (
                                <a
                                  href={item.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-950/50 hover:bg-sky-900/60 border border-sky-800/40 text-[11px] font-medium text-sky-300 transition-colors"
                                >
                                  <MapPin className="w-3 h-3 text-sky-400" />
                                  <span>Google Maps</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-400 font-mono">
                          ₹{item.estimatedCost?.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] uppercase text-stone-500 font-medium">{item.category}</div>
                      </div>
                    </div>

                    {/* Don't like this spot? Swap Row */}
                    <div className="pt-2 border-t border-[#1C261C] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSwapSpot(index)}
                        disabled={swappingIndex !== null}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                          swappingIndex === index
                            ? 'bg-amber-950/50 border-amber-600/60 text-amber-300 animate-pulse'
                            : 'bg-[#182318] hover:bg-[#233322] border-[#2C3E2B] hover:border-emerald-500/50 text-stone-300 hover:text-white shadow-sm'
                        }`}
                        title="Don't like this spot? Click to get another real curated place"
                      >
                        <RefreshCw
                          className={`w-3.5 h-3.5 text-emerald-400 ${
                            swappingIndex === index ? 'animate-spin text-amber-400' : ''
                          }`}
                        />
                        <span>{swappingIndex === index ? 'AI Finding Alternative...' : "Don't like this spot? Swap"}</span>
                      </button>

                      <span className="text-[10px] text-stone-500 font-medium">
                        Live AI & Google Maps Verified
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#232F22] bg-[#0E130E] shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            Cancel Draft
          </button>

          <button
            type="button"
            onClick={handleMaterializeTrip}
            disabled={isSaving || !!successTrip}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold tracking-wide shadow-xl transition-all ${
              successTrip
                ? 'bg-emerald-500 text-stone-950 font-extrabold'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/70 hover:scale-[1.02]'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Writing to Neon PostgreSQL...</span>
              </>
            ) : successTrip ? (
              <>
                <PartyPopper className="w-4 h-4" />
                <span>Trip Live in Dashboard!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Materialize Trip in Tulis (1-Click)</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
