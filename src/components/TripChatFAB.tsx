'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, X } from 'lucide-react';

interface TripChatFABProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

export const TripChatFAB: React.FC<TripChatFABProps> = ({
  isOpen,
  onToggle,
  unreadCount = 0,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? 'Close Trip Chat & AI' : 'Open Trip Chat & AI'}
      title={isOpen ? 'Close Trip Chat & AI' : 'Open Trip Chat & AI'}
      className={`fixed bottom-6 right-6 z-50 h-12 px-4 rounded-full shadow-2xl flex items-center gap-2.5 backdrop-blur-xl border transition-all cursor-pointer group select-none ${
        isOpen
          ? 'bg-ink-primary text-surface-base border-ink-primary shadow-emerald'
          : 'bg-surface-raised/95 hover:bg-surface-elevated text-ink-primary border-emerald-500/40 hover:border-emerald-500 neu-raised'
      }`}
    >
      {/* Icon Badge */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shrink-0 ${
          isOpen
            ? 'bg-surface-base/20 text-surface-base'
            : 'bg-emerald-500/15 text-emerald-500'
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
              <X className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative flex items-center justify-center"
            >
              <MessageSquare className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <span className="font-bold text-xs tracking-wide whitespace-nowrap">
        {isOpen ? 'Close Chat' : 'Trip Chat & AI'}
      </span>

      {/* Pulsing AI Indicator */}
      {!isOpen && (
        <span className="flex items-center gap-1 text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase border border-emerald-500/30">
          <Sparkles className="w-2.5 h-2.5 animate-pulse" />
          AI
        </span>
      )}

      {/* Unread Counter Badge */}
      {unreadCount > 0 && !isOpen && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-bounce">
          {unreadCount}
        </span>
      )}
    </motion.button>
  );
};
