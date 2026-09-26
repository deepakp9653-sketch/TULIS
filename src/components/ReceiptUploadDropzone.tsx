'use client';

import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Sparkles, Loader2, X, AlertCircle } from 'lucide-react';
import { ExtractedReceipt } from './ReceiptExtractionReviewModal';

interface ReceiptUploadDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onExtractionSuccess: (extracted: ExtractedReceipt, previewUrl: string) => void;
}

export const ReceiptUploadDropzone: React.FC<ReceiptUploadDropzoneProps> = ({
  isOpen,
  onClose,
  tripId,
  onExtractionSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid receipt image (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              tripId,
            }),
          });

          const data = await res.json();
          if (data.success && data.extracted) {
            onExtractionSuccess(data.extracted, base64Data);
            onClose();
          } else {
            setErrorMessage(data.error || 'Failed to extract bill data. Please try again.');
          }
        } catch (err: any) {
          setErrorMessage(err.message || 'Network error analyzing receipt.');
        } finally {
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setErrorMessage('Failed to read image file.');
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 text-stone-100 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#283526]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Scan Physical Bill</h3>
              <p className="text-xs text-stone-400">OpenCV & Computer Vision OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dropzone Box */}
        <div className="mt-5 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragging
                ? 'border-emerald-400 bg-emerald-950/40 scale-[1.01]'
                : 'border-[#2F402D] hover:border-emerald-600/60 bg-[#121912]/80 hover:bg-[#152015]'
            }`}
          >
            {isProcessing ? (
              <div className="space-y-3 py-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Extracting with OpenCV OCR...</h4>
                  <p className="text-xs text-stone-400">Deterministic vision preprocessing & parsing</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Drag & drop your receipt here</p>
                  <p className="text-xs text-stone-400">or click to browse from device</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30">
                  Supports JPG, PNG, WebP up to 10MB
                </span>
              </div>
            )}
          </div>

          {/* Mobile Camera Option Button */}
          <button
            type="button"
            onClick={() => !isProcessing && cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-2xl bg-[#1B251B] hover:bg-[#223022] border border-[#2B3A2A] text-xs font-semibold text-stone-200 flex items-center justify-center gap-2 transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Snap Live Photo with Camera</span>
          </button>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
