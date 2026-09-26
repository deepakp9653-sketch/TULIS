'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Mail,
  Lock,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Building,
  KeyRound,
  FileSpreadsheet,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CorporateAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCorporateSuccess: (user: any, organization: any) => void;
  onSwitchToNormalLogin?: () => void;
}

export const CorporateAuthModal: React.FC<CorporateAuthModalProps> = ({
  isOpen,
  onClose,
  onCorporateSuccess,
  onSwitchToNormalLogin,
}) => {
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyDomain, setCompanyDomain] = useState('');
  const [costCenter, setCostCenter] = useState('CC-TECH-01');
  const [role, setRole] = useState<'manager' | 'employee'>('manager');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleCorporateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workEmail.trim() || !workEmail.includes('@')) {
      setErrorMessage('Please enter a valid corporate work email.');
      return;
    }

    setLoading(true);
    resetMessages();

    try {
      const derivedDomain =
        companyDomain.trim() || workEmail.split('@')[1].toLowerCase();

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'corporate-login',
          email: workEmail.trim(),
          password: password.trim() || 'corporate123',
          companyDomain: derivedDomain,
          costCenter: costCenter.trim() || 'CC-CORP-01',
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Corporate authentication failed.');
      }

      setSuccessMessage(data.message || 'Corporate workspace verified successfully!');
      setTimeout(() => {
        onCorporateSuccess(data.user, data.organization);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to authenticate with corporate directory');
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-Click Evaluation Corporate Profiles
  const handleQuickCorporateLogin = async (preset: {
    email: string;
    domain: string;
    companyName: string;
    costCenter: string;
    role: 'manager' | 'employee';
  }) => {
    setWorkEmail(preset.email);
    setCompanyDomain(preset.domain);
    setCostCenter(preset.costCenter);
    setRole(preset.role);
    setLoading(true);
    resetMessages();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'corporate-login',
          email: preset.email,
          password: 'corporate123',
          companyDomain: preset.domain,
          companyName: preset.companyName,
          costCenter: preset.costCenter,
          role: preset.role,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Corporate demo login failed.');
      }

      setSuccessMessage(`Logged into ${preset.companyName} as ${preset.role.toUpperCase()}!`);
      setTimeout(() => {
        onCorporateSuccess(data.user, data.organization);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Corporate login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        className="bg-[#121915] border border-[#2D3E33] p-6 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden"
      >
        {/* Ambient Corporate Accent Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#243328] pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-sans font-bold text-lg text-white">
                  Corporate Enterprise Portal
                </h3>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
                  B2B Governance
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Dedicated workspace for enterprise policy audits, department budgets & approvals.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#1D2B21] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Evaluation Enterprise Profiles */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#0E1510] border border-[#202E24]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-emerald-400/90 font-semibold tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> 1-Click Enterprise Test Profiles
            </span>
            <span className="text-[10px] text-stone-500 font-mono">Instant Auth</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                companyName: 'Deloitte Global',
                domain: 'deloitte.com',
                email: 'alex.chen@deloitte.com',
                costCenter: 'CC-GLOBAL-801',
                role: 'manager' as const,
                title: 'Travel Director',
              },
              {
                companyName: 'Acme Corp',
                domain: 'acmecorp.com',
                email: 'rachel.adams@acmecorp.com',
                costCenter: 'CC-SALES-102',
                role: 'manager' as const,
                title: 'VP Sales Ops',
              },
              {
                companyName: 'TechNova',
                domain: 'technova.io',
                email: 'priya.sharma@technova.io',
                costCenter: 'CC-ENG-402',
                role: 'employee' as const,
                title: 'Staff Eng (Traveler)',
              },
            ].map((p, idx) => (
              <button
                key={idx}
                type="button"
                disabled={loading}
                onClick={() => handleQuickCorporateLogin(p)}
                className="p-2.5 rounded-xl bg-[#141F17] hover:bg-[#1A291E] border border-[#2B3E2F] hover:border-emerald-500/50 text-left transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                    {p.companyName}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase font-mono">
                    {p.role}
                  </span>
                </div>
                <p className="text-[10px] text-stone-400 truncate">{p.title}</p>
                <p className="text-[9px] text-stone-500 font-mono truncate">{p.email}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Corporate Login Form */}
        <form onSubmit={handleCorporateLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="text-stone-300 font-semibold mb-1 block">
              Corporate Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-[#0E1510] border border-[#243328] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-stone-500 focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-300 font-semibold mb-1 block">
                Company Domain / Code
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyDomain}
                  onChange={(e) => setCompanyDomain(e.target.value)}
                  placeholder="company.com"
                  className="w-full bg-[#0E1510] border border-[#243328] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-stone-500 focus:border-emerald-500 outline-none font-medium text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-stone-300 font-semibold mb-1 block">
                Cost Center / Dept
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  placeholder="CC-FIN-01"
                  className="w-full bg-[#0E1510] border border-[#243328] rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-stone-500 focus:border-emerald-500 outline-none font-medium text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-stone-300 font-semibold mb-1.5 block">Corporate Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'manager'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-[#0E1510] text-stone-400 border-[#243328] hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Approver / Manager</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  role === 'employee'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                    : 'bg-[#0E1510] text-stone-400 border-[#243328] hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Business Traveler</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>
              {loading
                ? 'Validating Corporate Directory...'
                : 'Enter Corporate Travel Command Center'}
            </span>
          </button>
        </form>

        {/* Footer switch to normal consumer login */}
        <div className="mt-5 pt-4 border-t border-[#243328] flex items-center justify-between text-[11px]">
          <span className="text-stone-400">Casual vacation or squad trip?</span>
          {onSwitchToNormalLogin && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToNormalLogin();
              }}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Switch to Squad Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
