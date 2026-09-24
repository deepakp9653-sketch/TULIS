'use client';

import React from 'react';
import { X, QrCode, CheckCircle2, ArrowRight, Smartphone, Copy, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface UpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromName: string;
  toName: string;
  amount: number;
  payeeUpiId: string;
  payeeQrCodeUrl?: string;
  onConfirmPayment: () => void;
}

export const UpiQrModal: React.FC<UpiQrModalProps> = ({
  isOpen,
  onClose,
  fromName,
  toName,
  amount,
  payeeUpiId,
  payeeQrCodeUrl,
  onConfirmPayment,
}) => {
  if (!isOpen) return null;

  const upiLink = `upi://pay?pa=${encodeURIComponent(payeeUpiId)}&pn=${encodeURIComponent(toName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('FareShare Settlement')}`;
  // Generated SVG QR code fallback
  const generatedQrImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&color=1C1B18&bgcolor=FBF8F3`;

  const activeQrImg = payeeQrCodeUrl || generatedQrImg;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(payeeUpiId);
    alert(`Copied UPI ID: ${payeeUpiId}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface-overlay border border-surface-hairline p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl text-center"
      >
        <div className="flex items-center justify-between border-b border-surface-hairline pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-primary">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Instant UPI Settle (₹ INR)</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-muted hover:text-ink-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <span className="text-xs text-ink-muted block">Transfer Amount</span>
          <span className="font-numeric font-bold text-3xl text-ink-primary">
            ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-ink-secondary mt-1">
            <span className="font-semibold text-rose-400">{fromName}</span> →{' '}
            <span className="font-semibold text-emerald-400">{toName}</span>
          </p>
        </div>

        {/* QR Code Container (Custom Uploaded or Generated) */}
        <div className="p-4 bg-surface-base rounded-2xl border border-surface-hairline inline-block shadow-inner space-y-2">
          <img src={activeQrImg} alt="UPI QR Code" className="w-44 h-44 mx-auto rounded-lg object-contain" />
          {payeeQrCodeUrl && (
            <span className="text-[10px] font-bold text-emerald-400 block">
              ✓ Verified Payee QR Image
            </span>
          )}
        </div>

        {/* UPI VPA Pill */}
        <div className="p-2.5 rounded-xl bg-surface-base border border-surface-hairline text-xs flex items-center justify-between">
          <span className="text-ink-muted">UPI VPA: <span className="font-semibold text-ink-primary">{payeeUpiId}</span></span>
          <button onClick={handleCopyUpi} className="p-1 rounded text-emerald-400 hover:bg-surface-overlay" title="Copy UPI ID">
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onConfirmPayment();
              onClose();
            }}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-emerald flex items-center justify-center gap-2 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark as Paid & Update Ledger
          </button>
        </div>
      </motion.div>
    </div>
  );
};
