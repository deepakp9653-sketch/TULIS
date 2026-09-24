'use client';

import React, { useState } from 'react';
import { OfflineCommand } from '@/lib/types';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineQueueIndicatorProps {
  isOffline: boolean;
  onToggleOffline: () => void;
  queue: OfflineCommand[];
  onSyncQueue: () => void;
  isSyncing: boolean;
}

export const OfflineQueueIndicator: React.FC<OfflineQueueIndicatorProps> = ({
  isOffline,
  onToggleOffline,
  queue,
  onSyncQueue,
  isSyncing,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingCount = queue.filter((c) => c.status === 'queued' || c.status === 'syncing').length;

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Toggle simulation pill */}
        <button
          type="button"
          onClick={onToggleOffline}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
            isOffline
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}
          title="Click to toggle simulated offline/mountain trek mode"
        >
          {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          <span>{isOffline ? 'Simulated Offline' : 'Online'}</span>
        </button>

        {/* Queue badge button */}
        {(pendingCount > 0 || isOffline) && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-base border border-surface-hairline hover:border-emerald-500/40 text-ink-primary shadow-sm transition-all"
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pendingCount} Queued</span>
            {isExpanded ? <ChevronUp className="w-3 h-3 text-ink-muted" /> : <ChevronDown className="w-3 h-3 text-ink-muted" />}
          </button>
        )}

        {/* Sync now button if pending items exist and online */}
        {pendingCount > 0 && !isOffline && (
          <button
            type="button"
            onClick={onSyncQueue}
            disabled={isSyncing}
            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        )}
      </div>

      {/* Expanded queue drawer dropdown */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            className="absolute right-0 top-full mt-2 w-80 bg-surface-raised border border-surface-hairline rounded-2xl shadow-xl p-4 z-40 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-surface-hairline pb-2">
              <span className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> Local Outbox Queue (F19)
              </span>
              <span className="text-[10px] text-ink-muted font-mono">{pendingCount} pending</span>
            </div>

            {queue.length === 0 ? (
              <p className="text-xs text-ink-secondary text-center py-2">
                No offline commands queued.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {queue.map((cmd) => (
                  <div
                    key={cmd.id}
                    className="p-2.5 rounded-xl bg-surface-base border border-surface-hairline text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-primary">{cmd.type}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          cmd.status === 'synced'
                            ? 'bg-emerald-500/20 text-emerald-600'
                            : 'bg-amber-500/20 text-amber-600'
                        }`}
                      >
                        {cmd.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted line-clamp-1">
                      {cmd.payload?.title ? `${cmd.payload.title} (₹${cmd.payload.totalAmount})` : JSON.stringify(cmd.payload)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {pendingCount > 0 && !isOffline && (
              <button
                type="button"
                onClick={() => {
                  onSyncQueue();
                  setIsExpanded(false);
                }}
                disabled={isSyncing}
                className="w-full py-2 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-subtle active:scale-95 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Replay & Commit to Ledger</span>
              </button>
            )}

            {isOffline && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center">
                Currently offline. Commands are safely cached in IndexedDB/Local storage.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
