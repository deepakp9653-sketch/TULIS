'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  X,
  Compass,
  DollarSign,
  ShieldAlert,
  Scale,
  MessageSquare,
  Bot,
  User,
  ArrowRight,
  Check,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Plus,
  Mic,
  MicOff,
  CornerDownLeft,
} from 'lucide-react';
import { ConfidenceBadge } from './ui/ConfidenceBadge';
import { routeAssistantMessage, AssistantIntent, AssistantRouteResult } from '@/lib/assistant-router';
import { Trip, Participant, Expense, Booking, SimplifiedDebt, ParticipantNetBalance } from '@/lib/types';

interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  intent?: AssistantIntent;
  confidence?: number;
  actionPayload?: any;
  timestamp: string;
}

interface UnifiedAssistantPanelProps {
  trip: Trip;
  participants: Participant[];
  expenses?: Expense[];
  bookings?: Booking[];
  netBalances?: ParticipantNetBalance[];
  simplifiedDebts?: SimplifiedDebt[];
  currentUser?: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenGogoPlanner?: () => void;
  onOpenAddExpense?: (prefill?: any) => void;
  onOpenSettlementReport?: () => void;
  onOpenSafetyMode?: () => void;
  initialMessage?: string;
}

export const UnifiedAssistantPanel: React.FC<UnifiedAssistantPanelProps> = ({
  trip,
  participants,
  expenses = [],
  bookings = [],
  netBalances = [],
  simplifiedDebts = [],
  currentUser,
  isOpen,
  onClose,
  onOpenGogoPlanner,
  onOpenAddExpense,
  onOpenSettlementReport,
  onOpenSafetyMode,
  initialMessage,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | AssistantIntent>('ALL');
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cacheKey = `tulis_assistant_${trip.id}`;

  // Load message history or initial greeting
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(cacheKey);
        if (saved) {
          setMessages(JSON.parse(saved));
          return;
        }
      } catch {
        // Fallthrough to initial greeting
      }
    }

    const greeting: AssistantMessage = {
      id: 'msg-init-1',
      sender: 'assistant',
      text: `Hello ${currentUser?.name ? currentUser.name.split(' ')[0] : 'there'}! I'm **Gogo**, your unified travel companion for **${trip.title}**.\n\nYou can ask me to plan day itineraries, log shared expenses, explain your net balance, or check local emergency safety protocols.`,
      intent: 'GENERAL',
      confidence: 1.0,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([greeting]);
  }, [trip.id, currentUser]);

  // Handle incoming initialMessage from GogoBar or quick triggers
  const initialProcessedRef = useRef<string | null>(null);
  useEffect(() => {
    if (isOpen && initialMessage && initialMessage !== initialProcessedRef.current) {
      initialProcessedRef.current = initialMessage;
      handleSendMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(messages.slice(-50)));
      } catch {
        // Storage quota
      }
    }
  }, [messages, cacheKey]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText.trim();
    if (!textToSend || isProcessing) return;

    const userMsg: AssistantMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response: AssistantRouteResult = await routeAssistantMessage({
        message: textToSend,
        trip,
        participants,
        expenses,
        bookings,
        netBalances,
        simplifiedDebts,
        currentUser,
      });

      const assistantMsg: AssistantMessage = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        text: response.replyText,
        intent: response.intent,
        confidence: response.confidence,
        actionPayload: response.actionPayload,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AssistantMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: "I encountered a minor glitch communicating with the routing engine. Let's try again in a moment.",
        intent: 'GENERAL',
        confidence: 0.5,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = (action: any) => {
    if (!action) return;
    if (action.type === 'PLAN_PREVIEW' && onOpenGogoPlanner) {
      onOpenGogoPlanner();
    } else if (action.type === 'EXPENSE_DRAFT' && onOpenAddExpense) {
      onOpenAddExpense(action.data);
    } else if (action.type === 'SETTLEMENT_EXPLANATION' && onOpenSettlementReport) {
      onOpenSettlementReport();
    } else if (action.type === 'SAFETY_ALERT' && onOpenSafetyMode) {
      onOpenSafetyMode();
    }
  };

  // Mock voice input
  const toggleListening = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputText('Log an expense of ₹1,800 for Spiti dinner');
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === 'ALL') return true;
    return m.intent === activeFilter || m.sender === 'user';
  });

  const promptSuggestions = [
    'How much do I owe right now?',
    'Log ₹1,200 lunch paid by me',
    'Recommend top dinner spots tonight',
    'Show nearest hospital & emergency contact',
  ];

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed bottom-22 right-6 z-50 w-full sm:w-[460px] h-[640px] max-h-[85vh] bg-[#0E1511]/98 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden text-stone-100"
    >
      {/* Top Header Bar */}
      <div className="p-4 border-b border-[#213025] bg-[#121B15] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white font-mono">Gogo, Everywhere</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-bold uppercase">
                F-M1
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Unified Companion for {trip.destination || 'Squad'}
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

      {/* Filter / Intent Modes Strip */}
      <div className="px-3 py-2 bg-[#0C110E] border-b border-[#213025] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
        {[
          { key: 'ALL', label: 'All Modes' },
          { key: 'PLANNING', label: '🗺️ Itinerary' },
          { key: 'EXPENSE', label: '🧾 Log Expense' },
          { key: 'EXPLAIN', label: '⚖️ Balances' },
          { key: 'SAFETY', label: '🛡️ Safety' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as any)}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer font-medium ${
              activeFilter === f.key
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#16221A]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                  : 'bg-[#16221A] text-stone-200 border border-[#26372B] rounded-bl-xs'
              }`}
            >
              {msg.text}

              {/* Action Cards */}
              {msg.actionPayload && (
                <div className="mt-3 pt-3 border-t border-[#26372B] space-y-2">
                  {msg.actionPayload.type === 'PLAN_PREVIEW' && (
                    <button
                      onClick={() => handleActionClick(msg.actionPayload)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Launch Gogo Itinerary Blueprint</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {msg.actionPayload.type === 'EXPENSE_DRAFT' && (
                    <button
                      onClick={() => handleActionClick(msg.actionPayload)}
                      className="w-full py-2 px-3 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                        <span>Confirm & Add ₹{msg.actionPayload.data.amount} to Ledger</span>
                      </div>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {msg.actionPayload.type === 'SETTLEMENT_EXPLANATION' && (
                    <button
                      onClick={() => handleActionClick(msg.actionPayload)}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 text-emerald-400" />
                        <span>View Official Settlement Audit & Debts</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {msg.actionPayload.type === 'SAFETY_ALERT' && (
                    <button
                      onClick={() => handleActionClick(msg.actionPayload)}
                      className="w-full py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        <span>Open Emergency Safety Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Sub-meta badge */}
            <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-stone-500">
              <span>{msg.timestamp}</span>
              {msg.confidence !== undefined && msg.sender === 'assistant' && (
                <>
                  <span>•</span>
                  <ConfidenceBadge score={msg.confidence} compact={true} />
                </>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-stone-400 text-xs font-mono p-2">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Gogo is thinking across planning, ledger, and safety models...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 bg-[#0C110E] border-t border-[#213025] flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-[#16221A] hover:bg-[#203025] border border-[#26372B] text-stone-300 hover:text-white shrink-0 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-3 bg-[#121B15] border-t border-[#213025] flex items-center gap-2">
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
            isListening
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              : 'bg-[#16221A] text-stone-400 hover:text-white border-[#26372B]'
          }`}
          title="Voice query (Audio input)"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask Gogo anything — plan, log ₹ bill, balance, safety..."
          className="flex-1 bg-[#16221A] border border-[#26372B] focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none transition"
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isProcessing}
          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition cursor-pointer shrink-0 shadow-md shadow-emerald-950/40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.aside>
  );
};
