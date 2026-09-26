'use client';

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Calendar,
  Store,
  Upload,
  X,
  ArrowRight,
  Loader2,
  Receipt,
  Layers,
} from 'lucide-react';

export interface ExtractedReceipt {
  vendor: string;
  date: string;
  totalAmount: number;
  currency: string;
  category: string;
  lineItems: { name: string; qty: number; price: number }[];
  tax?: number;
  tip?: number;
  confidenceScore?: number;
  engineUsed?: string;
  rawOcrText?: string;
}

interface ReceiptExtractionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedReceipt | null;
  previewUrl: string | null;
  onProceedToSplit: (finalData: ExtractedReceipt) => void;
}

export const ReceiptExtractionReviewModal: React.FC<ReceiptExtractionReviewModalProps> = ({
  isOpen,
  onClose,
  extractedData,
  previewUrl,
  onProceedToSplit,
}) => {
  if (!isOpen || !extractedData) return null;

  const [vendor, setVendor] = useState(extractedData.vendor || '');
  const [totalAmount, setTotalAmount] = useState(extractedData.totalAmount || 0);
  const [date, setDate] = useState(extractedData.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(extractedData.category || 'Food & Dining');
  const [showRawText, setShowRawText] = useState(false);

  const handleConfirm = () => {
    onProceedToSplit({
      ...extractedData,
      vendor,
      totalAmount: Number(totalAmount),
      date,
      category,
    });
  };

  const confidencePct = Math.round((extractedData.confidenceScore || 0.94) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl shadow-2xl shadow-emerald-950/50 text-stone-100 flex flex-col overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-28 -right-28 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#283526] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">OpenCV Computer Vision OCR</h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-400 border border-emerald-700/40">
                  {extractedData.engineUsed || 'OpenCV + Tesseract (Deterministic)'}
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Deterministic text binarization & line-item extraction (Zero hallucination)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Top Row: Preview & Highlighted Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Receipt Thumbnail */}
            <div className="relative rounded-2xl bg-[#0F140F] border border-[#263425] p-3 flex flex-col items-center justify-center min-h-[160px] overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Receipt Preview"
                  className="max-h-48 w-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-500">
                  <FileText className="w-8 h-8 text-stone-600" />
                  <span className="text-xs">Receipt Snapshot Attached</span>
                </div>
              )}
            </div>

            {/* Total Paid & Status Banner */}
            <div className="flex flex-col justify-between p-4 rounded-2xl bg-[#141C14] border border-[#2B3B29] space-y-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Grand Total Detected
                </span>
                <div className="flex items-baseline gap-1 text-2xl font-black text-emerald-400 font-mono">
                  <span>₹</span>
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full bg-transparent border-b border-emerald-500/40 text-emerald-400 font-mono text-2xl font-black focus:outline-none focus:border-emerald-400 pb-0.5"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#243123] text-xs text-stone-300">
                <div className="flex justify-between">
                  <span className="text-stone-400">Currency</span>
                  <span className="font-semibold text-white">{extractedData.currency || 'INR'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Tax / VAT</span>
                  <span className="font-mono text-stone-300">₹{extractedData.tax || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Gratuity / Tip</span>
                  <span className="font-mono text-stone-300">₹{extractedData.tip || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                Merchant / Vendor
              </label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-[#111711] border border-[#273626] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Fisherman's Wharf"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Receipt Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111711] border border-[#273626] rounded-xl px-3.5 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Detected Line Items */}
          {extractedData.lineItems && extractedData.lineItems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  Itemized Line Breakdown ({extractedData.lineItems.length})
                </span>
                <span className="text-[11px] text-stone-500">Auto-parsed from bill</span>
              </div>

              <div className="rounded-2xl border border-[#233022] bg-[#121812] divide-y divide-[#1D261C] overflow-hidden">
                {extractedData.lineItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-[#1C251B] border border-[#2A3729] flex items-center justify-center font-mono text-[10px] text-emerald-400">
                        {item.qty || 1}x
                      </span>
                      <span className="text-stone-200 font-medium">{item.name}</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-semibold">
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw OpenCV Extracted Text Viewer */}
          {extractedData.rawOcrText && (
            <div className="space-y-2 pt-2 border-t border-[#233022]">
              <button
                type="button"
                onClick={() => setShowRawText(!showRawText)}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
              >
                <span>{showRawText ? 'Hide' : 'View'} Raw OCR Text Lines ({extractedData.engineUsed || 'OpenCV Engine'})</span>
              </button>
              {showRawText && (
                <div className="p-3 bg-[#0c100c] border border-[#223022] rounded-xl font-mono text-[11px] text-stone-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {extractedData.rawOcrText}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#232F22] bg-[#0E130E] shrink-0 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold tracking-wide shadow-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/70 hover:scale-[1.02] transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Pre-fill & Split Expense</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
