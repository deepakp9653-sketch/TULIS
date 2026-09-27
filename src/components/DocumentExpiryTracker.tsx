'use client';

import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Plus,
  Trash2,
  Info,
  Clock,
  ShieldCheck,
  Globe,
} from 'lucide-react';

interface TravelDocument {
  id: string;
  type: 'passport' | 'visa' | 'insurance' | 'corporate_id' | 'driver_license';
  documentNumber: string;
  holderName: string;
  country: string;
  expiryDate: string;
}

const DEFAULT_DOCUMENTS: TravelDocument[] = [
  {
    id: 'doc-1',
    type: 'passport',
    documentNumber: 'Z5892144',
    holderName: 'Aditya Verma',
    country: 'India',
    expiryDate: new Date(Date.now() + 240 * 86400000).toISOString().slice(0, 10),
  },
  {
    id: 'doc-2',
    type: 'visa',
    documentNumber: 'V-B2-88912',
    holderName: 'Aditya Verma',
    country: 'United States',
    expiryDate: new Date(Date.now() + 25 * 86400000).toISOString().slice(0, 10),
  },
  {
    id: 'doc-3',
    type: 'insurance',
    documentNumber: 'POL-TATA-7712',
    holderName: 'Aditya Verma',
    country: 'Global Overseas',
    expiryDate: new Date(Date.now() + 65 * 86400000).toISOString().slice(0, 10),
  },
];

export const DocumentExpiryTracker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [documents, setDocuments] = useState<TravelDocument[]>(DEFAULT_DOCUMENTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [docType, setDocType] = useState<TravelDocument['type']>('passport');
  const [docNum, setDocNum] = useState('');
  const [holderName, setHolderName] = useState('');
  const [country, setCountry] = useState('India');
  const [expiryDate, setExpiryDate] = useState('');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNum || !expiryDate) return;

    const newDoc: TravelDocument = {
      id: 'doc-' + Date.now(),
      type: docType,
      documentNumber: docNum,
      holderName: holderName || 'Employee',
      country,
      expiryDate,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setDocNum('');
    setExpiryDate('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const getDaysRemaining = (expDate: string) => {
    const diffMs = new Date(expDate).getTime() - Date.now();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#253624] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Compliance &amp; Document Expiry Tracking</h3>
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                FC.7 Date-Math Alerts
              </span>
            </div>
            <p className="text-xs text-stone-400">
              Proactive expiry warnings for employee Passports, Visas, and Corporate Travel Insurance
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/50 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Travel Document</span>
        </button>
      </div>

      {/* Compliance Disclaimer */}
      <div className="p-3 rounded-xl bg-black/40 border border-stone-800/80 flex items-start gap-2.5 text-xs text-stone-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Document tracking relies entirely on self-reported calendar dates for scheduling reminders. TULIS does not verify immigration legality, consulate authenticity, or visa validity.
        </p>
      </div>

      {/* Add Document Form Drawer */}
      {showAddForm && (
        <form onSubmit={handleAddDocument} className="p-5 rounded-2xl bg-[#131B13] border border-[#263725] space-y-4 text-xs">
          <h4 className="font-bold text-white text-sm">Register Travel Document</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-stone-400 block mb-1">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full bg-[#0D120D] border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="passport">Passport</option>
                <option value="visa">Entry Visa</option>
                <option value="insurance">Travel Insurance</option>
                <option value="corporate_id">Corporate Badge / ID</option>
                <option value="driver_license">Driver License</option>
              </select>
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Document / Policy ID</label>
              <input
                type="text"
                placeholder="e.g. Z5892144"
                value={docNum}
                onChange={(e) => setDocNum(e.target.value)}
                className="w-full bg-[#0D120D] border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Country / Jurisdiction</label>
              <input
                type="text"
                placeholder="e.g. India, USA, Schengen"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0D120D] border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-stone-400 block mb-1">Expiration Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-[#0D120D] border border-stone-800 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Document
            </button>
          </div>
        </form>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const daysLeft = getDaysRemaining(doc.expiryDate);
          const isExpired = daysLeft <= 0;
          const isCritical = daysLeft > 0 && daysLeft <= 30;
          const isWarning = daysLeft > 30 && daysLeft <= 90;

          return (
            <div
              key={doc.id}
              className="p-4 rounded-2xl bg-[#131A13] border border-[#253524] hover:border-[#384C36] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isExpired || isCritical
                      ? 'bg-rose-500/15 text-rose-400'
                      : isWarning
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'bg-emerald-500/15 text-emerald-400'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize">{doc.type.replace('_', ' ')}</span>
                    <span className="font-mono text-stone-400 text-[11px]">#{doc.documentNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                    <span>{doc.holderName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-stone-500" />
                      <span>{doc.country}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-[#222E21] pt-2 sm:pt-0">
                <div className="text-right">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                      isExpired
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : isCritical
                        ? 'bg-rose-950/80 text-rose-300 border-rose-800/60'
                        : isWarning
                        ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60'
                    }`}
                  >
                    {isExpired
                      ? 'Expired'
                      : isCritical
                      ? `Expires in ${daysLeft} days`
                      : isWarning
                      ? `${daysLeft} days remaining`
                      : 'Valid (>90 days)'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                    Expiry: {doc.expiryDate}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                  title="Remove document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
