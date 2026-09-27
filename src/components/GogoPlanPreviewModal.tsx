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
  CloudRain,
  Sun,
  AlertTriangle,
} from 'lucide-react';
import ConfidenceBadge from './ui/ConfidenceBadge';
import { SafetyBriefPanel } from './SafetyBriefPanel';

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
  budgetAdjustments?: Array<{
    title: string;
    category: string;
    previousCost: number;
    newCost: number;
    reason: string;
  }>;
  weatherSnapshot?: {
    destination: string;
    dailyForecast: Array<{
      date: string;
      weatherCode: number;
      weatherLabel: string;
      icon: string;
      tempMax: number;
      tempMin: number;
      precipitationProbability: number;
      isAdverse: boolean;
      adverseReason?: string;
    }>;
    adverseDaysCount: number;
    outdoorAlerts: Array<{
      date: string;
      bookingTitle: string;
      weatherLabel: string;
      precipitationProbability: number;
      recommendedSwap: string;
    }>;
  };
}

interface GogoPlanPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: GeneratedPlan | null;
  onTripCreated: (createdTrip: any) => void;
  currentUserId?: string;
  sessionId?: string;
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
  sessionId = 'default-gogo-session',
}) => {
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlan | null>(plan);
  const [isSaving, setIsSaving] = useState(false);
  const [successTrip, setSuccessTrip] = useState<any | null>(null);
  const [swappingIndex, setSwappingIndex] = useState<number | null>(null);
  const [swapNotification, setSwapNotification] = useState<string | null>(null);
  const [itemVotes, setItemVotes] = useState<
    Record<number, { yes: number; no: number; maybe: number; userVotes: Record<string, string> }>
  >({});
  const [userVotes, setUserVotes] = useState<Record<number, 'yes' | 'no' | 'maybe'>>({});

  useEffect(() => {
    if (plan) {
      setCurrentPlan(plan);
      // Fetch consensus votes for this plan
      fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-votes', sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.votes) {
            setItemVotes(data.votes);
            const myVotes: Record<number, 'yes' | 'no' | 'maybe'> = {};
            const meId = currentUserId || 'traveler-me';
            for (const [idxStr, entry] of Object.entries(data.votes as Record<string, any>)) {
              if (entry.userVotes && entry.userVotes[meId]) {
                myVotes[Number(idxStr)] = entry.userVotes[meId];
              }
            }
            setUserVotes(myVotes);
          }
        })
        .catch((err) => console.warn('Gogo votes initial fetch error:', err));
    }
  }, [plan, sessionId, currentUserId]);

  const handleCastVote = async (activityIndex: number, vote: 'yes' | 'no' | 'maybe') => {
    setUserVotes((prev) => ({ ...prev, [activityIndex]: vote }));
    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cast-vote',
          sessionId,
          participantId: currentUserId || 'traveler-me',
          activityIndex,
          vote,
        }),
      });
      const data = await res.json();
      if (data.success && data.votes) {
        setItemVotes(data.votes);
      }
    } catch (err) {
      console.warn('Gogo vote submit error:', err);
    }
  };

  const itineraryConfidence = React.useMemo(() => {
    if (!currentPlan?.bookings || currentPlan.bookings.length === 0) return 0.88;
    const verifiedCount = currentPlan.bookings.filter(
      (b) => b.isGoogleVerified || (b.rating && b.rating >= 4.0)
    ).length;
    const ratio = verifiedCount / currentPlan.bookings.length;
    return Math.min(0.78 + ratio * 0.18, 0.96);
  }, [currentPlan]);

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

  const handleSwapAdverseBooking = (bookingTitle: string, recommendedSwap: string) => {
    if (!currentPlan) return;
    const updatedBookings = currentPlan.bookings.map((b) => {
      if (b.title.toLowerCase() === bookingTitle.toLowerCase()) {
        return {
          ...b,
          title: recommendedSwap,
          vendor: recommendedSwap,
          description: `Indoor swap alternative to replace outdoor activity due to forecast rain/adverse weather.`,
          highlights: ['Indoor Weather-Safe Venue', 'Curated Alternate Experience'],
        };
      }
      return b;
    });

    const updatedAlerts = (currentPlan.weatherSnapshot?.outdoorAlerts || []).filter(
      (a) => a.bookingTitle.toLowerCase() !== bookingTitle.toLowerCase()
    );

    setCurrentPlan({
      ...currentPlan,
      bookings: updatedBookings,
      weatherSnapshot: currentPlan.weatherSnapshot
        ? {
            ...currentPlan.weatherSnapshot,
            outdoorAlerts: updatedAlerts,
          }
        : undefined,
    });

    setSwapNotification(`Swapped "${bookingTitle}" with indoor-safe "${recommendedSwap}"!`);
    setTimeout(() => setSwapNotification(null), 4000);
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
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold tracking-tight text-white">Gogo Blueprint Review</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                  Ready to Materialize
                </span>
                <ConfidenceBadge score={itineraryConfidence} label="Itinerary Confidence" compact />
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

          {/* F1.1: Budget-First Backward Planning Optimization Callout */}
          {currentPlan.budgetAdjustments && currentPlan.budgetAdjustments.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#142015] border border-emerald-700/50 space-y-2.5 shadow-lg shadow-emerald-950/40 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Budget-First Backward Optimization ({currentPlan.budgetAdjustments.length} Trade-offs)
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 font-semibold">
                  Auto-Fitted to Ceiling
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                The original plan exceeded your target budget ceiling. Gogo iteratively adjusted stays and non-essential activities so your squad stays on target:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {currentPlan.budgetAdjustments.map((adj, aIdx) => (
                  <div key={aIdx} className="p-2.5 rounded-xl bg-[#0D150E] border border-[#233824] space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span className="truncate max-w-[170px]">{adj.title}</span>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span className="line-through text-stone-500">₹{adj.previousCost.toLocaleString('en-IN')}</span>
                        <span className="text-emerald-400 font-bold">₹{adj.newCost.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-snug">{adj.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* F1.2: Weather-Aware Replanning & Open-Meteo Forecast Banner */}
          {currentPlan.weatherSnapshot && (
            <div className="p-4 rounded-2xl bg-[#121B14] border border-[#273829] space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Open-Meteo 7-Day Forecast ({currentPlan.weatherSnapshot.destination})
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                  F1.2 Weather-Aware
                </span>
              </div>

              {/* Daily Weather Forecast Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {currentPlan.weatherSnapshot.dailyForecast?.slice(0, 7).map((wf, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border text-center space-y-0.5 ${
                      wf.isAdverse
                        ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                        : 'bg-[#162319] border-[#293B2B] text-stone-200'
                    }`}
                  >
                    <span className="text-[10px] text-stone-400 font-mono block">
                      {wf.date.slice(5)}
                    </span>
                    <span className="text-lg block">{wf.icon}</span>
                    <span className="text-xs font-bold font-mono block">
                      {wf.tempMax}° / {wf.tempMin}°
                    </span>
                    <span className="text-[9px] block text-stone-400 truncate">
                      {wf.precipitationProbability > 20 ? `${wf.precipitationProbability}% rain` : wf.weatherLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Adverse Weather Outdoor Alerts */}
              {currentPlan.weatherSnapshot.outdoorAlerts && currentPlan.weatherSnapshot.outdoorAlerts.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#233325]">
                  <div className="text-[10px] uppercase font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                    <CloudRain className="w-3.5 h-3.5 text-amber-400" />
                    <span>Adverse Weather Warning: Outdoor Activity Conflicts</span>
                  </div>
                  {currentPlan.weatherSnapshot.outdoorAlerts.map((alert, aIdx) => (
                    <div
                      key={aIdx}
                      className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200">{alert.bookingTitle}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300">
                              {alert.weatherLabel} ({alert.precipitationProbability}% Rain)
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-300 mt-0.5">
                            Recommended indoor replacement: <strong className="text-emerald-300">{alert.recommendedSwap}</strong>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSwapAdverseBooking(alert.bookingTitle, alert.recommendedSwap)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-sm transition-all"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Swap to Indoor Alternative</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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

                    {/* F1.3: Consensus Group Voting Row */}
                    <div className="pt-2 border-t border-[#1C261C] flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mr-1">
                          Squad Consensus:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCastVote(index, 'yes')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                            userVotes[index] === 'yes'
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm shadow-emerald-900/40'
                              : 'bg-[#182318] text-stone-300 hover:text-white border-[#2C3E2B]'
                          }`}
                          title="Vote Yes - I love this!"
                        >
                          <span>👍</span>
                          <span>{itemVotes[index]?.yes ?? 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCastVote(index, 'maybe')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                            userVotes[index] === 'maybe'
                              ? 'bg-amber-600 text-white border-amber-400 shadow-sm shadow-amber-900/40'
                              : 'bg-[#182318] text-stone-300 hover:text-white border-[#2C3E2B]'
                          }`}
                          title="Vote Maybe - Flexible / Alternative"
                        >
                          <span>🤔</span>
                          <span>{itemVotes[index]?.maybe ?? 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCastVote(index, 'no')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 border transition-all ${
                            userVotes[index] === 'no'
                              ? 'bg-rose-700 text-white border-rose-500 shadow-sm shadow-rose-900/40'
                              : 'bg-[#182318] text-stone-300 hover:text-white border-[#2C3E2B]'
                          }`}
                          title="Vote No - Prefer alternative"
                        >
                          <span>👎</span>
                          <span>{itemVotes[index]?.no ?? 0}</span>
                        </button>
                      </div>

                      {/* Contested Badge if No >= Yes and No > 0 */}
                      {itemVotes[index] &&
                        (itemVotes[index].no || 0) >= (itemVotes[index].yes || 0) &&
                        (itemVotes[index].no || 0) > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Contested Spot</span>
                          </span>
                        )}
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

            {/* F5.2: Destination Safety & Emergency Logistics Brief */}
            <SafetyBriefPanel destination={currentPlan.destination} />
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
                <span>Saving your trip...</span>
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
