'use client';

import React, { useState, useEffect } from 'react';
import { Participant } from '@/lib/types';
import { X, QrCode, Upload, CheckCircle2, ArrowRight, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAvatar } from './UserAvatar';

interface UpiSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: Participant | null;
  onSaveUpiDetails: (participantId: string, upiId: string, qrCodeUrl?: string) => void;
}

export const UpiSetupModal: React.FC<UpiSetupModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUpiDetails,
}) => {
  const [upiId, setUpiId] = useState<string>(
    currentUser?.upiId || (currentUser?.name ? `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@okicici` : '')
  );
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(currentUser?.qrCodeUrl || null);

  useEffect(() => {
    if (currentUser) {
      setUpiId(currentUser.upiId || `${currentUser.name.toLowerCase().replace(/\s+/g, '')}@okicici`);
      setQrPreview(currentUser.qrCodeUrl || null);
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setQrPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !upiId.trim()) return;

    onSaveUpiDetails(currentUser.id, upiId, qrPreview || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-md w-full space-y-5 shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-emerald">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-display font-bold text-lg text-ink-primary">
                Post-Login UPI Setup
              </h3>
              <p className="text-xs text-ink-secondary">
                Configure your UPI VPA & QR code image for peer settlements.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-ink-muted hover:text-ink-primary hover:bg-surface-overlay">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* User Profile Summary */}
          <div className="p-3 rounded-2xl bg-surface-base border border-surface-hairline flex items-center gap-3">
            <UserAvatar
              name={currentUser.name}
              id={currentUser.id}
              avatarUrl={currentUser.avatarUrl}
              size="md"
            />
            <div>
              <p className="font-serif-display font-bold text-sm text-ink-primary">{currentUser.name}</p>
              <p className="text-[11px] text-ink-muted">{currentUser.email}</p>
            </div>
          </div>

          {/* UPI ID VPA Input */}
          <div>
            <label className="block text-ink-muted mb-1 font-semibold uppercase tracking-wider text-[11px]">
              Your UPI VPA (ID)
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. srushti.sharma@okicici or 9876543210@paytm"
              className="w-full bg-surface-base border border-surface-hairline rounded-xl px-3 py-2.5 font-numeric font-bold text-ink-primary focus:border-emerald-500 outline-none text-sm"
            />
          </div>

          {/* UPI QR Code Image Dropzone */}
          <div className="space-y-2">
            <label className="block text-ink-muted mb-1 font-semibold uppercase tracking-wider text-[11px]">
              Upload Payment UPI QR Code Image
            </label>

            <div className="p-4 border-2 border-dashed border-surface-hairline hover:border-emerald-500/60 rounded-2xl bg-surface-base text-center space-y-2 cursor-pointer relative transition-all">
              <input
                type="file"
                accept="image/*"
                onChange={handleQrUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {qrPreview ? (
                <div className="space-y-2">
                  <img src={qrPreview} alt="UPI QR Preview" className="w-28 h-28 mx-auto object-contain rounded-xl border border-surface-hairline shadow-sm" />
                  <span className="text-[11px] font-bold text-emerald-400 block">Custom QR Code Loaded ✓</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-ink-muted mx-auto" />
                  <p className="text-xs text-ink-secondary">
                    Upload GPay / PhonePe / Paytm QR Code image, or <span className="text-emerald-400 font-semibold">browse file</span>
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-ink-primary text-surface-base hover:opacity-90 font-semibold text-xs shadow-subtle flex items-center justify-center gap-2 transition-all mt-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save UPI Details & Enable Instant Settle</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
