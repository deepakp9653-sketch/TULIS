'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  X,
  Sparkles,
  Lock,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface HeadlessApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ApiAction = 'calculate-splits' | 'simplify-debts' | 'reconciliation-audit' | 'export-rfc4180' | 'pool-state';

const ACTION_CONFIGS: Record<
  ApiAction,
  {
    title: string;
    description: string;
    sampleBody: any;
  }
> = {
  'calculate-splits': {
    title: 'Calculate Splits (Zero-Drift Allocation)',
    description: 'Computes exact penny-accurate allocation shares with automatic rounding difference absorption.',
    sampleBody: {
      action: 'calculate-splits',
      amount: 14500,
      splitMethod: 'weighted',
      participants: [
        { id: 'p1', name: 'Alex Chen', weight: 1 },
        { id: 'p2', name: 'Maya Patel', weight: 1.5 },
        { id: 'p3', name: 'Sam Rivera', weight: 0.8 },
      ],
    },
  },
  'simplify-debts': {
    title: 'Simplify Debts (N-1 Optimal Settlement)',
    description: 'Reduces an arbitrary NxN debt matrix down to the mathematically minimal set of bilateral UPI transfers.',
    sampleBody: {
      action: 'simplify-debts',
      netBalances: [
        { participant: { id: 'p1', name: 'Alex Chen', upiId: 'alex@upi' }, netBalance: 4200 },
        { participant: { id: 'p2', name: 'Maya Patel', upiId: 'maya@upi' }, netBalance: -1800 },
        { participant: { id: 'p3', name: 'Sam Rivera', upiId: 'sam@upi' }, netBalance: -2400 },
      ],
    },
  },
  'reconciliation-audit': {
    title: 'Reconciliation Audit (Zero-Sum Invariant)',
    description: 'Cryptographically audits gross outlays against debt allocations and returns proof hash.',
    sampleBody: {
      action: 'reconciliation-audit',
      participants: [
        { id: 'p1', name: 'Alex Chen', isOrganizer: true },
        { id: 'p2', name: 'Maya Patel', isOrganizer: false },
      ],
      expenses: [
        { id: 'e1', title: 'Mountain Chalet', totalAmount: 18000, paidById: 'p1' },
      ],
      payments: [],
      refunds: [],
      bookings: [],
    },
  },
  'export-rfc4180': {
    title: 'RFC 4180 Accounting Export',
    description: 'Generates compliant CSV journal for ingestion into enterprise ERPs (SAP, NetSuite, Concur).',
    sampleBody: {
      action: 'export-rfc4180',
      trip: {
        id: 'trip-corp-101',
        title: 'Q3 Technology Delegation',
        destination: 'Bangalore',
        baseCurrency: 'INR',
      },
      participants: [{ id: 'p1', name: 'Alex Chen', email: 'alex@corp.com' }],
      expenses: [
        { id: 'e1', title: 'Airfare', totalAmount: 12500, paidById: 'p1', category: 'transport' },
      ],
      bookings: [],
    },
  },
  'pool-state': {
    title: 'Pool Contribution Kitty State',
    description: 'Calculates remaining pot funds and proportional refund distribution across contributors.',
    sampleBody: {
      action: 'pool-state',
      tripId: 'trip-squad-goa',
      contributions: [
        { id: 'c1', participantId: 'p1', amount: 3000 },
        { id: 'c2', participantId: 'p2', amount: 3000 },
      ],
      expenses: [
        { id: 'e1', title: 'Toll plaza & fuel', totalAmount: 1400, isPoolExpense: true },
      ],
    },
  },
};

export const HeadlessApiDocsModal: React.FC<HeadlessApiDocsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeAction, setActiveAction] = useState<ApiAction>('calculate-splits');
  const [requestJson, setRequestJson] = useState<string>(
    JSON.stringify(ACTION_CONFIGS['calculate-splits'].sampleBody, null, 2)
  );
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const handleActionSelect = (action: ApiAction) => {
    setActiveAction(action);
    setRequestJson(JSON.stringify(ACTION_CONFIGS[action].sampleBody, null, 2));
    setResponseJson(null);
    setResponseStatus(null);
    setLatencyMs(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseJson(null);
    const start = performance.now();
    try {
      const parsed = JSON.parse(requestJson);
      const res = await fetch(`/api/v1/ledger?action=${activeAction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'tulis_live_sk_test',
        },
        body: JSON.stringify(parsed),
      });

      const end = performance.now();
      setLatencyMs(Math.round(end - start));
      setResponseStatus(res.status);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseStatus(500);
      setResponseJson(JSON.stringify({ error: err.message || 'Execution error' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const curlCommand = `curl -X POST "https://tulis.app/api/v1/ledger?action=${activeAction}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: tulis_live_sk_test" \\
  -d '${requestJson.replace(/\n\s*/g, '')}'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#0E1511] border border-[#213025] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-stone-100"
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-[#213025] bg-[#121B15] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-mono">
                  Headless Travel Ledger API (v1)
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono font-bold uppercase">
                  F-M3
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">
                Programmatic zero-drift accounting & settlement engine for external platforms
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

        {/* Action Selectors Strip */}
        <div className="px-5 py-3 bg-[#0A0F0C] border-b border-[#213025] flex items-center gap-2 overflow-x-auto text-xs font-mono no-scrollbar">
          {(Object.keys(ACTION_CONFIGS) as ApiAction[]).map((act) => (
            <button
              key={act}
              onClick={() => handleActionSelect(act)}
              className={`px-3 py-1.5 rounded-xl shrink-0 transition-all cursor-pointer font-semibold ${
                activeAction === act
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-[#16221A] border border-transparent'
              }`}
            >
              {act}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Overview Meta */}
          <div className="p-4 rounded-2xl bg-[#121B15] border border-[#213025] space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-white font-mono">
                {ACTION_CONFIGS[activeAction].title}
              </h4>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16221A] text-emerald-400 border border-[#26372B]">
                POST /api/v1/ledger?action={activeAction}
              </span>
            </div>
            <p className="text-xs text-stone-400">
              {ACTION_CONFIGS[activeAction].description}
            </p>
          </div>

          {/* Sandbox Split Panes (Request / Response) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Request Pane */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>Request Payload (JSON):</span>
                <button
                  onClick={handleCopyCurl}
                  className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'cURL Copied' : 'Copy cURL'}</span>
                </button>
              </div>

              <textarea
                value={requestJson}
                onChange={(e) => setRequestJson(e.target.value)}
                rows={12}
                className="w-full bg-[#080C09] border border-[#213025] focus:border-emerald-500/50 rounded-2xl p-3.5 text-xs font-mono text-stone-200 focus:outline-none resize-none"
              />

              <button
                type="button"
                onClick={handleExecute}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Request...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Send Request to Ledger Engine</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Pane */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                <span>API Engine Response:</span>
                {responseStatus !== null && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        responseStatus === 200
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800'
                      }`}
                    >
                      Status: {responseStatus}
                    </span>
                    {latencyMs !== null && (
                      <span className="text-[10px] text-stone-500">{latencyMs}ms</span>
                    )}
                  </div>
                )}
              </div>

              <div className="h-[285px] bg-[#080C09] border border-[#213025] rounded-2xl p-3.5 text-xs font-mono text-emerald-300 overflow-y-auto whitespace-pre-wrap">
                {responseJson ? (
                  responseJson
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-1">
                    <Code2 className="w-6 h-6 stroke-[1.5]" />
                    <span>Press &ldquo;Send Request&rdquo; to test live execution</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#213025] bg-[#121B15] flex items-center justify-between text-xs font-mono text-stone-400">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auth: Supply Header &ldquo;X-API-Key: tulis_live_sk_test&rdquo;</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#16221A] hover:bg-[#203025] text-white font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
