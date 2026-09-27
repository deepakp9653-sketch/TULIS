'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, MessageSquare, Compass, ShieldCheck } from 'lucide-react';

interface UnifiedAssistantFABProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
  activeIntent?: string;
}

export const UnifiedAssistantFAB: React.FC<UnifiedAssistantFABProps> = ({
  isOpen,
  onToggle,
  unreadCount = 0,
  activeIntent,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? 'Close Gogo Unified Companion' : 'Open Gogo Unified Companion'}
      title="Gogo, Everywhere — AI Companion for Planning, Expenses, Ledgers & Safety"
      className={`fixed bottom-6 right-6 z-50 h-13 px-4.5 rounded-full shadow-2xl flex items-center gap-2.5 backdrop-blur-2xl border transition-all cursor-pointer group select-none ${
        isOpen
          ? 'bg-[#16221A] text-white border-emerald-500/50 shadow-emerald-950/60 ring-2 ring-emerald-500/30'
          : 'bg-gradient-to-r from-[#121B15] via-[#16221A] to-[#0E1511] text-stone-100 border-emerald-500/40 hover:border-emerald-400 shadow-2xl shadow-emerald-950/50'
      }`}
    >
      {/* Iridescent Pulse Ring */}
      {!isOpen && (
        <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-20 group-hover:opacity-40 blur-sm transition-opacity" />
      )}

      {/* Icon Capsule */}
      <div
        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${
          isOpen
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-gradient-to-tr from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-4 h-4 text-emerald-300" />
            </motion.div>
          ) : (
            <motion.div
              key="sparkles"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label & Intent Capsule */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold tracking-tight text-white font-mono">
            {isOpen ? 'Close Gogo' : 'Gogo'}
          </span>
          {!isOpen && (
            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono font-bold uppercase tracking-wider">
              Everywhere
            </span>
          )}
        </div>
        {!isOpen && (
          <span className="text-[10px] text-stone-400 font-mono leading-none">
            Companion AI
          </span>
        )}
      </div>

      {/* Unread Alert Ping */}
      {unreadCount > 0 && !isOpen && (
        <span className="ml-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-[#0C110E] animate-ping" />
      )}
    </motion.button>
  );
};
