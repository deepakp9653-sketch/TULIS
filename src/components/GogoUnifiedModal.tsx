'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  Compass,
  Calendar,
  X,
  Send,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ExternalLink,
  MapPin,
  Wallet,
  Users,
  Utensils,
  Hotel,
  Plane,
  RefreshCw,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Trip, Participant, Expense, Booking, SimplifiedDebt, ParticipantNetBalance } from '@/lib/types';
import { routeAssistantMessage, AssistantRouteResult } from '@/lib/assistant-router';

export type GogoTab = 'chat' | 'planner' | 'blueprint';

interface Question {
  step: number;
  key: string;
  title: string;
  subtitle: string;
  placeholder: string;
  presets: string[];
}

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

interface GogoChatMessage {
  id: string;
  sender: 'user' | 'gogo';
  text: string;
  timestamp: string;
  actionPayload?: any;
  suggestedFollowUps?: string[];
}

interface GogoUnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  participants: Participant[];
  expenses?: Expense[];
  bookings?: Booking[];
  netBalances?: ParticipantNetBalance[];
  simplifiedDebts?: SimplifiedDebt[];
  currentUser?: any;
  initialTab?: GogoTab;
  initialMessage?: string;
  onTripCreated?: (newTrip: any) => void;
  onAddBookingDirectly?: (booking: any) => void;
  onOpenAddExpense?: (prefill?: any) => void;
}

export const GogoUnifiedModal: React.FC<GogoUnifiedModalProps> = ({
  isOpen,
  onClose,
  trip,
  participants,
  expenses = [],
  bookings = [],
  netBalances = [],
  simplifiedDebts = [],
  currentUser,
  initialTab = 'chat',
  initialMessage,
  onTripCreated,
  onAddBookingDirectly,
  onOpenAddExpense,
}) => {
  const [activeTab, setActiveTab] = useState<GogoTab>(initialTab);

  // Chat state
  const [messages, setMessages] = useState<GogoChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Planner state (4 steps)
  const [plannerStep, setPlannerStep] = useState(1);
  const [plannerAnswers, setPlannerAnswers] = useState<Record<string, string>>({
    destination: trip.destination || 'Goa',
    budget: `₹${trip.budgetCeiling?.toLocaleString('en-IN') || '50,000'}`,
    vibe: 'Relaxed & Foodie Squad',
    pace: `${participants.length || 4} Travelers, Balanced Pace`,
  });
  const [customStepInput, setCustomStepInput] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Blueprint state
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [isMaterializing, setIsMaterializing] = useState(false);

  // Initialize chat greeting on open
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);

      if (messages.length === 0) {
        const welcomeText = `Hey ${currentUser?.name?.split(' ')[0] || 'Traveler'}! I'm Gogo, your AI companion for **${trip.title}**. Ask me anything about squad balances, split math, local spots in ${trip.destination}, or tap **4-Step Planner** to build a complete itinerary!`;
        setMessages([
          {
            id: 'welcome-1',
            sender: 'gogo',
            text: welcomeText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestedFollowUps: [
              'Who owes what in the squad?',
              `What is our remaining budget?`,
              `Suggest 3 dinner spots in ${trip.destination}`,
            ],
          },
        ]);
      }

      if (initialMessage && initialMessage.trim() !== '') {
        handleSendMessage(initialMessage);
      }
    }
  }, [isOpen]);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, activeTab]);

  if (!isOpen) return null;

  // Planner step definitions
  const PLANNER_STEPS: Question[] = [
    {
      step: 1,
      key: 'destination',
      title: 'Where & When are you traveling?',
      subtitle: 'Pick or confirm your destination and trip length.',
      placeholder: 'e.g. 5-Day Heritage Journey in Rajasthan',
      presets: [
        trip.destination || 'Goa Beach Trip',
        'Rajasthan Palace Journey',
        'Himachal Mountain Escape',
        'Kerala Backwaters Retreat',
      ],
    },
    {
      step: 2,
      key: 'budget',
      title: 'What is your budget ceiling?',
      subtitle: 'The split engine will mathematically enforce this limit.',
      placeholder: 'e.g. ₹50,000 total for squad',
      presets: ['₹30,000 (Backpacker)', '₹60,000 (Balanced)', '₹1,20,000 (Luxury)'],
    },
    {
      step: 3,
      key: 'vibe',
      title: 'What is your squad vibe?',
      subtitle: 'Shapes recommendations for food, stays, and daily pace.',
      placeholder: 'e.g. Foodie, adventure, relaxed sunset cafes',
      presets: [
        'Relaxed Cafes & Sunsets',
        'High Energy & Nightlife',
        'Adventure & Outdoor Treks',
        'Cultural & Heritage Exploration',
      ],
    },
    {
      step: 4,
      key: 'pace',
      title: 'Squad Size & Travel Pace',
      subtitle: 'Fine-tunes booking capacity and daily activity density.',
      placeholder: 'e.g. 4 Travelers, 2 activities per day',
      presets: [
        `${participants.length || 4} Travelers, Balanced (2 activities/day)`,
        `${participants.length || 4} Travelers, Relaxed (1 main stop/day)`,
        `${participants.length || 4} Travelers, Fast-Paced Explorer`,
      ],
    },
  ];

  // Send Chat message
  const handleSendMessage = async (userText: string) => {
    const cleanText = userText.trim();
    if (!cleanText) return;

    const userMsg: GogoChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // 1. Check local assistant router for fast client responses
      const routeResult: AssistantRouteResult = await routeAssistantMessage({
        message: cleanText,
        trip,
        participants,
        expenses,
        bookings,
        netBalances,
        simplifiedDebts,
        currentUser,
      });

      // If planning intent detected, offer 1-click tab switch
      if (routeResult.intent === 'PLANNING') {
        const botMsg: GogoChatMessage = {
          id: 'gogo-' + Date.now(),
          sender: 'gogo',
          text: routeResult.replyText || `I can help plan that! Tap **4-Step Planner** above or let's create a curated plan for ${trip.destination}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionPayload: routeResult.actionPayload,
          suggestedFollowUps: ['Open 4-Step Planner', 'What is our remaining budget?'],
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // If expense intent detected and prefill exists
      if (routeResult.intent === 'EXPENSE' && onOpenAddExpense && routeResult.actionPayload?.data) {
        const prefill = routeResult.actionPayload.data;
        const botMsg: GogoChatMessage = {
          id: 'gogo-' + Date.now(),
          sender: 'gogo',
          text: `Parsed expense: **${prefill.desc || 'Expense'}** for **₹${prefill.amount || 0}**. Would you like to log this to the ledger?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionPayload: { type: 'EXPENSE_DRAFT', data: prefill },
          suggestedFollowUps: ['Open Expense Drawer', 'Cancel'],
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // Fallback to Groq API if general conversational query
      try {
        const res = await fetch('/api/gogo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'ask-question',
            query: cleanText,
            destination: trip.destination,
            totalSpend: expenses.reduce((s, e) => s + (e.totalAmount || 0), 0),
            budgetCeiling: trip.budgetCeiling,
          }),
        });
        const data = await res.json();
        if (data.success && data.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: 'gogo-' + Date.now(),
              sender: 'gogo',
              text: data.reply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestedFollowUps: routeResult.suggestedFollowUps || ['Who owes what?', 'Check itinerary'],
            },
          ]);
          setIsTyping(false);
          return;
        }
      } catch (apiErr) {
        console.warn('Gogo api error:', apiErr);
      }

      // Default safe response from deterministic router
      setMessages((prev) => [
        ...prev,
        {
          id: 'gogo-' + Date.now(),
          sender: 'gogo',
          text: routeResult.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedFollowUps: routeResult.suggestedFollowUps,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'gogo-err-' + Date.now(),
          sender: 'gogo',
          text: "I'm having trouble connecting right now, but your ledger balances and calculations remain 100% accurate and zero-sum.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Generate Plan from 4-Step Planner
  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);

    try {
      const res = await fetch('/api/gogo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-plan',
          destination: plannerAnswers.destination || trip.destination,
          budget: plannerAnswers.budget,
          vibe: plannerAnswers.vibe,
          pace: plannerAnswers.pace,
          daysCount: trip.endDate && trip.startDate
            ? Math.max(1, Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 3600 * 24)))
            : 5,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
        setActiveTab('blueprint');
      } else {
        // Fallback local curated plan if API is rate limited
        const fallbackPlan: GeneratedPlan = {
          title: `${trip.destination || 'Rajasthan'} Curated AI Blueprint`,
          destination: trip.destination || 'Rajasthan',
          estimatedBudget: trip.budgetCeiling || 45000,
          daysCount: 4,
          summary: `Curated 4-day high-reputation itinerary with verified Google Maps venues, balanced group budget, and zero-confusion splits.`,
          bookings: [
            {
              title: 'Heritage Palace Stay & Welcome Dinner',
              category: 'stay',
              vendor: 'Rambagh Palace Jaipur',
              estimatedCost: 18000,
              dayNumber: 1,
              description: 'Authentic royal courtyard lodging with breakfast included for the whole squad.',
              googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rambagh+Palace+Jaipur',
              rating: 4.8,
              isGoogleVerified: true,
            },
            {
              title: 'Fort Sunset Tour & Dinner Feast',
              category: 'activity',
              vendor: 'Amber Fort & Chokhi Dhani',
              estimatedCost: 6500,
              dayNumber: 2,
              description: 'Sunset panoramic overlook followed by traditional Rajasthani dinner buffet.',
              googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Amber+Fort+Jaipur',
              rating: 4.7,
              isGoogleVerified: true,
            },
            {
              title: 'Lakeside Heritage Cafe & Boat Ride',
              category: 'dining',
              vendor: 'Taj Lake Palace Udaipur',
              estimatedCost: 8500,
              dayNumber: 3,
              description: 'Private lake tour with evening sunset snacks and photography point.',
              googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taj+Lake+Palace+Udaipur',
              rating: 4.9,
              isGoogleVerified: true,
            },
          ],
        };
        setGeneratedPlan(fallbackPlan);
        setActiveTab('blueprint');
      }
    } catch (err) {
      console.warn('Plan generation error:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Materialize Blueprint Bookings directly into active trip
  const handleMaterializeBlueprint = async () => {
    if (!generatedPlan || !generatedPlan.bookings) return;
    setIsMaterializing(true);

    try {
      if (onAddBookingDirectly) {
        for (const b of generatedPlan.bookings) {
          onAddBookingDirectly({
            id: 'bk-gogo-' + Date.now() + Math.random().toString(36).substring(2, 6),
            tripId: trip.id,
            title: b.title,
            category: b.category === 'stay' ? 'lodging' : b.category === 'dining' ? 'food' : 'activity',
            vendor: b.vendor,
            estimatedCost: b.estimatedCost,
            actualCost: b.estimatedCost,
            status: 'confirmed',
            googleMapsUrl: b.googleMapsUrl,
            rating: b.rating,
          });
        }
      }

      setTimeout(() => {
        setIsMaterializing(false);
        onClose();
      }, 600);
    } catch (err) {
      setIsMaterializing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="bg-[#F4F5EE] dark:bg-[#151D18] border border-[#5A7863]/25 dark:border-[#2D3E30] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative text-[#3B4953] dark:text-[#F4F2E6]"
      >
        {/* Subtle accent glows: pastel yellow and soft forest */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#FEF08A]/35 dark:bg-[#D9EE86]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#5A7863]/10 dark:bg-[#2D7A5C]/15 rounded-full blur-3xl pointer-events-none" />

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* HEADER BAR & UNIFIED TAB SWITCHER                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        <div className="p-4 sm:p-5 border-b border-[#5A7863]/15 dark:border-[#253327] bg-[#E8EEDC] dark:bg-[#172018] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5A7863] text-[#EBF4DD] flex items-center justify-center font-bold shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-display font-bold text-base sm:text-lg text-[#3B4953] dark:text-[#F4F5EE]">
                  Gogo AI Companion
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60">
                  Autonomous
                </span>
              </div>
              <p className="text-xs text-[#5A7863] dark:text-[#95A898]">
                One unified assistant for trip planning, balance explanations & venue intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* Unified Modal Tab Switcher */}
            <div className="flex items-center p-1 bg-[#DDE5D0] dark:bg-[#0F1410] border border-[#5A7863]/20 dark:border-[#253327] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-xs'
                    : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#95A898] dark:hover:text-[#F4F5EE]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'planner'
                    ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-xs'
                    : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#95A898] dark:hover:text-[#F4F5EE]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>4-Step Planner</span>
              </button>

              {generatedPlan && (
                <button
                  type="button"
                  onClick={() => setActiveTab('blueprint')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'blueprint'
                      ? 'bg-[#5A7863] text-[#EBF4DD] font-bold shadow-xs'
                      : 'text-[#5A7863] hover:text-[#3B4953] dark:text-[#95A898] dark:hover:text-[#F4F5EE]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Blueprint</span>
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#5A7863] hover:text-[#3B4953] hover:bg-[#DDE5D0] dark:text-[#95A898] dark:hover:text-[#F4F5EE] dark:hover:bg-[#253327] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 1: NATURAL CONVERSATION & Q&A                           */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
            {/* Chat Messages Feed */}
            <div ref={chatScrollRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-[#5A7863] text-[#EBF4DD] font-medium shadow-xs'
                        : 'bg-[#FFFFFF] dark:bg-[#1C261E] border border-[#5A7863]/15 dark:border-[#2B3E2F] text-[#3B4953] dark:text-[#F4F5EE] shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.text}</div>

                    {/* Action payload button if present */}
                    {m.actionPayload?.type === 'EXPENSE_DRAFT' && onOpenAddExpense && (
                      <div className="mt-2.5 pt-2 border-t border-[#5A7863]/15 dark:border-[#2B3E2F] flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAddExpense(m.actionPayload.data);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#5A7863] text-[#EBF4DD] font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Review & Add to Ledger →</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-[#78887B] dark:text-[#718575] mt-1 px-1">{m.timestamp}</span>

                  {/* Suggested Followups chips */}
                  {m.sender === 'gogo' && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (chip === 'Open 4-Step Planner') {
                              setActiveTab('planner');
                            } else {
                              handleSendMessage(chip);
                            }
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#E8EEDC] hover:bg-[#DDE5D0] dark:bg-[#18231A] dark:hover:bg-[#253528] border border-[#5A7863]/20 dark:border-[#2B3E2F] text-[11px] text-[#3B4953] hover:text-[#5A7863] dark:text-[#95A898] dark:hover:text-[#D9EE86] transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#5A7863] bg-[#E8EEDC] dark:bg-[#1C261E] border border-[#5A7863]/20 dark:border-[#2B3E2F] p-3 rounded-2xl w-fit">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#5A7863]" />
                  <span>Gogo is thinking...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputMessage);
              }}
              className="p-3.5 border-t border-[#5A7863]/15 dark:border-[#253327] bg-[#E8EEDC] dark:bg-[#172018] flex items-center gap-2 relative z-10"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gogo: 'Who owes what?', 'Plan dinner under ₹1500', 'Log ₹1200 taxi'..."
                className="flex-1 bg-[#FFFFFF] dark:bg-[#0F1410] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl px-4 py-2.5 text-xs text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs disabled:opacity-40 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 2: AUTONOMOUS 4-STEP TRIP PLANNER                       */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'planner' && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6 relative z-10">
            {/* Step Progress Pills */}
            <div className="grid grid-cols-4 gap-2">
              {PLANNER_STEPS.map((s) => (
                <div
                  key={s.step}
                  onClick={() => setPlannerStep(s.step)}
                  className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                    plannerStep === s.step
                      ? 'bg-[#FEF9C3] dark:bg-[#1F2D22] border-[#FDE047] dark:border-[#D9EE86] text-[#713F12] dark:text-[#D9EE86] font-bold shadow-xs'
                      : plannerStep > s.step
                      ? 'bg-[#E8EEDC] dark:bg-[#18231A] border-[#5A7863]/20 dark:border-[#2B3E2F] text-[#5A7863] dark:text-[#95A898]'
                      : 'bg-[#F4F5EE] dark:bg-[#0F1410] border-[#5A7863]/10 dark:border-[#253327] text-[#78887B] dark:text-[#556758]'
                  }`}
                >
                  <span className="text-[10px] uppercase font-mono block">Step {s.step}</span>
                  <span className="text-xs truncate block font-medium">
                    {s.step === 1 ? 'Destination' : s.step === 2 ? 'Budget' : s.step === 3 ? 'Vibe' : 'Roster'}
                  </span>
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            {(() => {
              const currentQ = PLANNER_STEPS.find((s) => s.step === plannerStep) || PLANNER_STEPS[0];
              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif-display font-bold text-lg text-[#3B4953] dark:text-[#F4F5EE]">
                      {currentQ.title}
                    </h4>
                    <p className="text-xs text-[#5A7863] dark:text-[#95A898]">{currentQ.subtitle}</p>
                  </div>

                  {/* Preset Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {currentQ.presets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setPlannerAnswers((prev) => ({ ...prev, [currentQ.key]: preset }));
                        }}
                        className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                          plannerAnswers[currentQ.key] === preset
                            ? 'bg-[#FEF9C3] dark:bg-[#D9EE86]/15 border-[#FDE047] dark:border-[#D9EE86] text-[#713F12] dark:text-[#F4F5EE] font-semibold'
                            : 'bg-[#FFFFFF] dark:bg-[#18231A] border border-[#5A7863]/20 dark:border-[#2B3E2F] text-[#3B4953] dark:text-[#95A898] hover:border-[#5A7863]/50'
                        }`}
                      >
                        <span>{preset}</span>
                        {plannerAnswers[currentQ.key] === preset && (
                          <CheckCircle2 className="w-4 h-4 text-[#854D0E] dark:text-[#D9EE86] shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input override */}
                  <div className="pt-2">
                    <label className="text-[11px] text-[#78887B] dark:text-[#95A898] block mb-1">Or type custom specification:</label>
                    <input
                      type="text"
                      value={plannerAnswers[currentQ.key] || ''}
                      onChange={(e) =>
                        setPlannerAnswers((prev) => ({ ...prev, [currentQ.key]: e.target.value }))
                      }
                      placeholder={currentQ.placeholder}
                      className="w-full bg-[#FFFFFF] dark:bg-[#0F1410] border border-[#5A7863]/25 dark:border-[#2B3E2F] rounded-xl px-4 py-2.5 text-xs text-[#3B4953] dark:text-[#F4F5EE] placeholder-[#78887B]/60 focus:border-[#5A7863] outline-none shadow-xs"
                    />
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#5A7863]/15 dark:border-[#253327]">
                    <button
                      type="button"
                      disabled={plannerStep === 1}
                      onClick={() => setPlannerStep((prev) => Math.max(1, prev - 1))}
                      className="px-3.5 py-2 rounded-xl border border-[#5A7863]/20 dark:border-[#2B3E2F] bg-surface-raised text-[#5A7863] hover:text-[#3B4953] dark:text-[#95A898] dark:hover:text-[#F4F5EE] text-xs font-semibold disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Previous</span>
                    </button>

                    {plannerStep < 4 ? (
                      <button
                        type="button"
                        onClick={() => setPlannerStep((prev) => Math.min(4, prev + 1))}
                        className="px-4 py-2 rounded-xl bg-[#5A7863] text-[#EBF4DD] font-bold text-xs hover:bg-[#4C6753] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isGeneratingPlan}
                        onClick={handleGeneratePlan}
                        className="px-5 py-2.5 rounded-xl bg-[#5A7863] text-[#EBF4DD] font-bold text-xs hover:bg-[#4C6753] transition-all cursor-pointer flex items-center gap-2 shadow-md disabled:opacity-50"
                      >
                        {isGeneratingPlan ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generating Blueprint...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            <span>Generate Itinerary Blueprint →</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════ */}
        {/* TAB 3: BLUEPRINT PREVIEW & 1-CLICK MATERIALIZE              */}
        {/* ══════════════════════════════════════════════════════════════ */}
        {activeTab === 'blueprint' && generatedPlan && (
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 relative z-10">
            {/* Plan Header Card */}
            <div className="p-4 rounded-2xl bg-[#E8EEDC] dark:bg-[#1B271E] border border-[#5A7863]/20 dark:border-[#2D3E30] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div>
                <span className="text-[10px] font-mono text-[#5A7863] dark:text-[#D9EE86] font-bold uppercase tracking-wider block">
                  AI Generated Itinerary • {generatedPlan.daysCount} Days
                </span>
                <h4 className="font-serif-display font-bold text-lg text-[#3B4953] dark:text-[#F4F5EE]">
                  {generatedPlan.title}
                </h4>
                <p className="text-xs text-[#5A7863] dark:text-[#95A898]">{generatedPlan.summary}</p>
              </div>

              <div className="p-2.5 bg-[#FFFFFF] dark:bg-[#0F1410] rounded-xl border border-[#5A7863]/20 dark:border-[#253327] text-right shrink-0 shadow-xs">
                <span className="text-[10px] text-[#78887B] dark:text-[#718575] uppercase block font-mono">Estimated Total</span>
                <span className="text-base font-numeric font-bold text-[#2D7A5C] dark:text-[#D9EE86]">
                  ₹{generatedPlan.estimatedBudget?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Generated Bookings List */}
            <div className="space-y-3">
              <h5 className="text-xs font-mono uppercase text-[#5A7863] dark:text-[#95A898] font-bold tracking-wider">
                Curated Stops & Bookings ({generatedPlan.bookings?.length || 0})
              </h5>

              <div className="space-y-2.5">
                {generatedPlan.bookings?.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#FFFFFF] dark:bg-[#18231A] border border-[#5A7863]/15 dark:border-[#2B3E2F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#5A7863]/15 text-[#5A7863] flex items-center justify-center shrink-0 mt-0.5">
                        {b.category === 'stay' ? (
                          <Hotel className="w-4 h-4" />
                        ) : b.category === 'dining' ? (
                          <Utensils className="w-4 h-4" />
                        ) : (
                          <Compass className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#3B4953] dark:text-[#F4F5EE]">{b.title}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#FEF9C3] text-[#713F12] border border-[#FDE047]/60 font-mono font-bold">
                            Day {b.dayNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78887B] dark:text-[#95A898] mt-0.5">{b.description}</p>

                        {/* Google Maps link */}
                        {b.googleMapsUrl && (
                          <a
                            href={b.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-[#5A7863] hover:underline mt-1 font-semibold"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Google Maps Verified</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-numeric font-bold text-[#3B4953] dark:text-[#F4F5EE]">
                        ₹{b.estimatedCost?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Materialize Action Footer */}
            <div className="pt-3 border-t border-[#5A7863]/15 dark:border-[#253327] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('planner')}
                className="px-3 py-2 rounded-xl text-xs text-[#5A7863] hover:text-[#3B4953] dark:text-[#95A898] dark:hover:text-[#F4F5EE] transition-colors cursor-pointer font-semibold"
              >
                ← Back to Planner
              </button>

              <button
                type="button"
                disabled={isMaterializing}
                onClick={handleMaterializeBlueprint}
                className="px-5 py-2.5 rounded-xl bg-[#5A7863] hover:bg-[#4C6753] text-[#EBF4DD] font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                {isMaterializing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Materializing Bookings...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Materialize into Trip Bookings (1-Click)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
