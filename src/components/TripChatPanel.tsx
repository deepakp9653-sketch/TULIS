'use client';

import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { ChatSummaryCard } from './ChatSummaryCard';

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
                message_text: 'Welcome to your trip chat room! Plan itineraries, share bill receipts, and collaborate with your squad. 🎒✈️',
                message_type: 'text',
                created_at: new Date().toISOString(),
              },
            ];
          }
        }

        setMessages((prev) => {
          // Merge unique messages by id
          const idMap = new Map<string, Message>();
          prev.forEach((m) => idMap.set(m.id, m));
          serverMsgs.forEach((m) => idMap.set(m.id, m));
          const merged = Array.from(idMap.values()).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(merged));
            } catch (e) {}
          }
          return merged;
        });

        if (data.latestSummary) {
          setSummary(data.latestSummary.summary_markdown);
          setActionItems(data.latestSummary.action_items || []);
        }
      }
    } catch (err) {
      console.error('Failed to poll chat:', err);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const finalMsg = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!finalMsg || isSending) return;

    // Optimistic local update so it never disappears on refresh or network lag
    const tempId = 'msg-' + Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUserId,
      sender_name: currentUserName,
      message_text: finalMsg,
      message_type: 'text',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => {
      const updated = [...prev, optimisticMsg];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(cacheKey, JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
    setInputText('');

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
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#111711] border border-[#263525] rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-[#141C14] border-b border-[#253324] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">Trip Group Chat</h3>
            <span className="text-[10px] text-emerald-400 font-medium">Live Synchronized</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerateSummary}
            disabled={isSummarizing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800/40 text-[11px] font-semibold text-emerald-300 transition-all shadow"
          >
            {isSummarizing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>AI Catchup</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Optional AI Summary Section */}
      {showSummary && summary && (
        <div className="p-3 bg-[#0E140E] border-b border-[#212C20] shrink-0">
          <ChatSummaryCard
            summary={summary}
            actionItems={actionItems}
            onRefresh={handleGenerateSummary}
            isRefreshing={isSummarizing}
          />
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-[#172017] border border-[#273626] flex items-center justify-center mx-auto text-stone-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs text-stone-400">No chat messages yet.</p>
            <p className="text-[11px] text-stone-600">Start the conversation with your trip squad!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-stone-500 mb-1 px-1">{msg.sender_name}</span>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-none shadow-md shadow-emerald-950/40'
                      : 'bg-[#1A241A] border border-[#2A3929] text-stone-200 rounded-tl-none'
                  }`}
                >
                  {msg.message_text}
                </div>
                <span className="text-[9px] text-stone-600 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-3 pt-2 pb-1 bg-[#131B13] border-t border-[#202C1F] flex gap-1.5 overflow-x-auto custom-scrollbar shrink-0">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-[10px] px-2.5 py-1 rounded-lg bg-[#182318] hover:bg-[#202E1F] border border-[#2A3B29] text-stone-300 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-[#141C14] border-t border-[#233122] flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
          placeholder="Message trip squad..."
          className="flex-1 bg-[#0E130E] border border-[#283827] rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
          disabled={isSending}
        />
        <button
          type="button"
          onClick={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          className={`p-2.5 rounded-xl transition-all ${
            inputText.trim() && !isSending
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50'
              : 'bg-[#1C251B] text-stone-600 cursor-not-allowed'
          }`}
        >
          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  if (isFloating) {
    return (
      <div className="fixed bottom-20 right-6 z-40 w-80 sm:w-96 h-[500px] animate-in slide-in-from-bottom-5 duration-200">
        {content}
      </div>
    );
  }

  return content;
};
