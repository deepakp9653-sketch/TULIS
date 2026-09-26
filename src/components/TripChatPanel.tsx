'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Sparkles,
  User,
  Clock,
  Loader2,
  X,
  ChevronDown,
  RefreshCw,
  Layers,
  CheckCircle2,
  Bot,
  Zap,
} from 'lucide-react';
import { ChatSummaryCard } from './ChatSummaryCard';
import { UserAvatar } from './UserAvatar';

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  message_type: string;
  created_at: string;
}

interface TripChatPanelProps {
  tripId: string;
  currentUserId?: string;
  currentUserName?: string;
  onClose?: () => void;
  isFloating?: boolean;
}

export const TripChatPanel: React.FC<TripChatPanelProps> = ({
  tripId,
  currentUserId = 'traveler',
  currentUserName = 'Traveler',
  onClose,
  isFloating = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cacheKey = `tulis_chat_${tripId}`;

  // Restore from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (e) {
        console.warn('Error reading chat cache:', e);
      }
    }
  }, [tripId, cacheKey]);

  // Poll messages every 4s and sync with Neon DB
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [tripId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat?tripId=${tripId}`);
      const data = await res.json();
      if (data.success) {
        let serverMsgs: Message[] = data.messages || [];

        // If trip has zero messages anywhere, seed default squad welcome message
        if (serverMsgs.length === 0) {
          const cached = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null;
          if (cached) {
            try {
              serverMsgs = JSON.parse(cached);
            } catch (e) {}
          }

          if (serverMsgs.length === 0) {
            serverMsgs = [
              {
                id: 'welcome-' + tripId,
                sender_id: 'system',
                sender_name: 'Tulis Squad Concierge',
                message_text:
                  'Welcome to your trip chat room! Plan itineraries, share bill receipts, and collaborate with your squad in real-time. 🎒✈️',
                message_type: 'system',
                created_at: new Date().toISOString(),
              },
            ];
          }
        }

        setMessages(serverMsgs);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(serverMsgs));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Chat fetch fallback to cache:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showSummary]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isSending) return;

    const finalMsg = textToSend.trim();
    if (!textOverride) setInputText('');

    const tempId = 'temp-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      message_text: finalMsg,
      message_type: 'user',
      created_at: new Date().toISOString(),
    };

    // Update local state immediately
    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          tripId,
          text: finalMsg,
          senderName: currentUserName,
          senderId: currentUserId,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        // Replace optimistic message with confirmed server record
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== tempId);
          const updated = [...filtered, data.message];
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    setShowSummary(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'summarize',
          tripId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setActionItems(data.actionItems || []);
      }
    } catch (err) {
      console.error('Summary error:', err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const QUICK_PROMPTS = [
    'Uploaded the dinner receipt 🧾',
    'Cab booking confirmed 🚕',
    'Who has the villa keys? 🔑',
    'Meeting in hotel lobby at 8 PM 📍',
    '@gogo check restaurant recommendations 🍽️',
  ];

  const content = (
    <div className="flex flex-col h-full bg-surface-raised border border-surface-hairline rounded-3xl neu-raised shadow-paper overflow-hidden">
      {/* 1. Synced Header */}
      <div className="p-4 bg-surface-raised/95 border-b border-surface-hairline flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shadow-subtle">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink-primary font-serif-display">
                Trip Squad Live Chat
              </h3>
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            </div>
            <span className="text-[10px] text-ink-muted font-mono block">
              Live Sync Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isSummarizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-inset hover:bg-surface-elevated border border-surface-hairline text-[11px] font-semibold text-brand-emerald transition-all shadow-subtle cursor-pointer"
          >
            {isSummarizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-emerald" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
            )}
            <span>AI Catchup</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-elevated transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Optional AI Summary Card */}
      {showSummary && summary && (
        <div className="p-3.5 bg-surface-inset/60 border-b border-surface-hairline shrink-0">
          <ChatSummaryCard
            summary={summary}
            actionItems={actionItems}
            onRefresh={handleGenerateSummary}
            isRefreshing={isSummarizing}
          />
        </div>
      )}

      {/* 3. Messages Stream */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-surface-inset border border-surface-hairline flex items-center justify-center mx-auto text-ink-muted">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-ink-primary">No chat messages yet.</p>
            <p className="text-[11px] text-ink-muted">
              Say hello or attach a receipt to start the squad conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isSystem = msg.sender_id === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-3">
                  <div className="max-w-md p-3 rounded-2xl bg-surface-inset/80 border border-surface-hairline text-center text-xs space-y-1 shadow-subtle">
                    <div className="flex items-center justify-center gap-1.5 text-brand-emerald font-bold text-[11px]">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{msg.sender_name}</span>
                    </div>
                    <p className="text-ink-secondary text-[11px] leading-relaxed">
                      {msg.message_text}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="shrink-0 mb-4">
                    <UserAvatar name={msg.sender_name} id={msg.sender_id} size="sm" />
                  </div>
                )}

                <div className={`flex flex-col max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && (
                    <span className="text-[10px] font-semibold text-ink-muted mb-1 px-1">
                      {msg.sender_name}
                    </span>
                  )}

                  <div
                    className={`px-4 py-2.5 text-xs leading-relaxed transition-all ${
                      isMe
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-none shadow-sm'
                        : 'bg-surface-base border border-surface-hairline text-ink-primary rounded-2xl rounded-tl-none shadow-subtle'
                    }`}
                  >
                    {msg.message_text}
                  </div>

                  <span className="text-[9px] font-mono text-ink-muted mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompts Bar */}
      <div className="px-3.5 py-2 bg-surface-inset/70 border-t border-surface-hairline flex gap-2 overflow-x-auto scrollbar-none shrink-0">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1.5 rounded-xl bg-surface-raised hover:bg-surface-elevated border border-surface-hairline text-ink-secondary hover:text-ink-primary whitespace-nowrap transition-colors cursor-pointer shadow-subtle"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* 5. Input Field with Glassmorphic Send Button */}
      <div className="p-3.5 bg-surface-raised/95 border-t border-surface-hairline flex items-center gap-2.5 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Message trip squad or ask AI..."
          className="flex-1 bg-surface-inset border border-surface-hairline rounded-2xl px-4 py-2.5 text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/30 transition-all"
          disabled={isSending}
        />

        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className={`p-2.5 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            inputText.trim() && !isSending
              ? 'bg-ink-primary text-surface-base hover:opacity-90 shadow-subtle active:scale-95'
              : 'bg-surface-inset text-ink-muted cursor-not-allowed opacity-60'
          }`}
          title="Send message"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.95 }}
        transition={{ type: 'spring', damping: 26, stiffness: 320 }}
        className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-6.5rem)] shadow-2xl rounded-3xl overflow-hidden"
      >
        {content}
      </motion.div>
    );
  }

  return content;
};
