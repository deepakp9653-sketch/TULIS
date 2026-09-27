'use client';

import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Sparkles, Loader2, X, AlertCircle, Coffee, Hotel, Car } from 'lucide-react';
import { ExtractedReceipt } from './ReceiptExtractionReviewModal';

interface ReceiptUploadDropzoneProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onExtractionSuccess: (extracted: ExtractedReceipt, previewUrl: string) => void;
}

/**
 * Preprocesses an image using an HTML5 Canvas:
 * - Downscales large phone camera photos (max 1600px dimension)
 * - Enhances contrast for crisp OCR character recognition
 * - Compresses to JPEG ~150-250KB to prevent 413 Payload Too Large
 */
async function preprocessImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to high-contrast grayscale for sharper OCR
        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            // Slight contrast stretch
            const contrast = (gray - 128) * 1.25 + 128;
            const clamped = Math.min(255, Math.max(0, contrast));
            data[i] = clamped;
            data[i + 1] = clamped;
            data[i + 2] = clamped;
          }
          ctx.putImageData(imgData, 0, 0);
        } catch (e) {
          // If security or canvas error, proceed with original draw
        }

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Generates an authentic physical receipt graphic on a canvas for instant 1-click test OCR
 */
function createSampleReceiptDataUrl(type: 'cafe' | 'hotel' | 'taxi'): { dataUrl: string; rawText: string } {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: '', rawText: '' };

  // Aged thermal paper background
  ctx.fillStyle = '#F8F9F3';
  ctx.fillRect(0, 0, 600, 800);

  // Border & receipt texture
  ctx.strokeStyle = '#D5D8C8';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, 580, 780);

  ctx.fillStyle = '#1A1E1A';
  ctx.textAlign = 'center';

  let rawText = '';

  if (type === 'cafe') {
    ctx.font = 'bold 26px monospace';
    ctx.fillText('CAFE COFFEE DAY', 300, 70);
    ctx.font = '16px monospace';
    ctx.fillText('Mall Road, Manali, HP', 300, 105);
    ctx.fillText('GSTIN: 02AABCC1234F1Z9', 300, 130);
    ctx.fillText('Date: 26/09/2026   Time: 16:45', 300, 160);

    ctx.fillText('------------------------------------------', 300, 190);
    ctx.textAlign = 'left';
    ctx.fillText('ITEM                 QTY    PRICE', 50, 220);
    ctx.fillText('------------------------------------------', 50, 240);
    ctx.fillText('Hot Cappuccino        2     320.00', 50, 275);
    ctx.fillText('Blueberry Muffin      1     180.00', 50, 310);
    ctx.fillText('Mineral Water 1L      1      25.00', 50, 345);
    ctx.fillText('------------------------------------------', 50, 380);
    ctx.fillText('Sub Total:                  525.00', 50, 420);
    ctx.fillText('CGST 2.5%:                   13.12', 50, 450);
    ctx.fillText('SGST 2.5%:                   13.12', 50, 480);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('GRAND TOTAL:          INR 551.24', 50, 530);
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('*** THANK YOU VISIT AGAIN ***', 300, 620);
    ctx.fillText('Paid via UPI: Approved', 300, 650);

    rawText = `CAFE COFFEE DAY
Mall Road, Manali, HP
GSTIN: 02AABCC1234F1Z9
Date: 26/09/2026 Time: 16:45
Hot Cappuccino 2 320.00
Blueberry Muffin 1 180.00
Mineral Water 1L 1 25.00
Sub Total: 525.00
CGST 2.5%: 13.12
SGST 2.5%: 13.12
GRAND TOTAL: INR 551.24
Paid via UPI: Approved`;
  } else if (type === 'hotel') {
    ctx.font = 'bold 26px monospace';
    ctx.fillText('HIGHLAND RESORT & SPA', 300, 70);
    ctx.font = '16px monospace';
    ctx.fillText('Log Huts Area, Old Manali', 300, 105);
    ctx.fillText('GSTIN: 02HJKLM5678Q1Z2', 300, 130);
    ctx.fillText('Date: 25/09/2026', 300, 160);

    ctx.fillText('------------------------------------------', 300, 190);
    ctx.textAlign = 'left';
    ctx.fillText('ITEM                 QTY    PRICE', 50, 220);
    ctx.fillText('------------------------------------------', 50, 240);
    ctx.fillText('Deluxe Pine Room      1    4200.00', 50, 275);
    ctx.fillText('Buffet Breakfast      2     600.00', 50, 310);
    ctx.fillText('------------------------------------------', 50, 380);
    ctx.fillText('Sub Total:                 4800.00', 50, 420);
    ctx.fillText('Luxury Tax 12%:             576.00', 50, 460);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('NET PAYABLE:          INR 5376.00', 50, 520);
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Thank you for staying with us!', 300, 620);

    rawText = `HIGHLAND RESORT & SPA
Log Huts Area, Old Manali
GSTIN: 02HJKLM5678Q1Z2
Date: 25/09/2026
Deluxe Pine Room 1 4200.00
Buffet Breakfast 2 600.00
Sub Total: 4800.00
Luxury Tax 12%: 576.00
NET PAYABLE: INR 5376.00`;
  } else {
    ctx.font = 'bold 26px monospace';
    ctx.fillText('ROHTANG PASS TAXI UNION', 300, 70);
    ctx.font = '16px monospace';
    ctx.fillText('Cab Service Voucher #TX-902', 300, 105);
    ctx.fillText('Date: 26/09/2026', 300, 135);

    ctx.fillText('------------------------------------------', 300, 180);
    ctx.textAlign = 'left';
    ctx.fillText('TRIP DETAILS                 PRICE', 50, 220);
    ctx.fillText('------------------------------------------', 50, 240);
    ctx.fillText('Manali to Solang Valley    1250.00', 50, 280);
    ctx.fillText('Driver Allowance            200.00', 50, 320);
    ctx.fillText('------------------------------------------', 50, 380);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('TOTAL AMOUNT:         INR 1450.00', 50, 430);
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Authorized Tourist Transport', 300, 580);

    rawText = `ROHTANG PASS TAXI UNION
Cab Service Voucher #TX-902
Date: 26/09/2026
Manali to Solang Valley 1250.00
Driver Allowance 200.00
TOTAL AMOUNT: INR 1450.00
Authorized Tourist Transport`;
  }

  return { dataUrl: canvas.toDataURL('image/jpeg', 0.9), rawText };
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

  const processPayload = async (base64Data: string, rawTextOverride?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          rawTextOverride,
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

  const handleFileProcess = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid receipt image (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Preprocess image on canvas: scale down to 1600px & boost contrast
      const processedBase64 = await preprocessImageFile(file);
      await processPayload(processedBase64);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process receipt image.');
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = async (preset: 'cafe' | 'hotel' | 'taxi') => {
    const { dataUrl, rawText } = createSampleReceiptDataUrl(preset);
    await processPayload(dataUrl, rawText);
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
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#182218] via-[#121712] to-[#0A0D0A] border border-[#3A4E39]/60 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 text-stone-100 overflow-hidden">
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
              <p className="text-xs text-stone-400">OpenCV & Computer Vision OCR Engine</p>
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
            className={`cursor-pointer border-2 border-dashed rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center transition-all ${
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
                  <p className="text-xs text-stone-400">Contrast binarization & line-item analysis</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950/40">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Drag & drop receipt photo here</p>
                  <p className="text-xs text-stone-400">or click to browse from device</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/30">
                  Auto-downscaled & contrast-boosted for instant OCR
                </span>
              </div>
            )}
          </div>

          {/* Mobile Camera Option Button */}
          <button
            type="button"
            onClick={() => !isProcessing && cameraInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 rounded-2xl bg-[#1B251B] hover:bg-[#223022] border border-[#2B3A2A] text-xs font-semibold text-stone-200 flex items-center justify-center gap-2 transition-all"
          >
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Snap Live Photo with Camera</span>
          </button>

          {/* Quick 1-Click Sample Receipts */}
          <div className="pt-2 border-t border-[#253224]">
            <p className="text-[11px] uppercase font-bold tracking-wider text-stone-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Or Test Instant 1-Click Sample Bill:</span>
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSelectPreset('cafe')}
                className="p-2.5 rounded-xl bg-[#162016] hover:bg-[#1E2C1E] border border-[#2A3B29] text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Cafe Bill</span>
                </div>
                <p className="text-[11px] text-stone-300 font-mono mt-1 font-bold">₹551.24</p>
                <p className="text-[9px] text-stone-400 truncate">Coffee & Bakery</p>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSelectPreset('hotel')}
                className="p-2.5 rounded-xl bg-[#162016] hover:bg-[#1E2C1E] border border-[#2A3B29] text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Hotel className="w-3.5 h-3.5" />
                  <span>Resort Stay</span>
                </div>
                <p className="text-[11px] text-stone-300 font-mono mt-1 font-bold">₹5,376.00</p>
                <p className="text-[9px] text-stone-400 truncate">Room & Breakfast</p>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSelectPreset('taxi')}
                className="p-2.5 rounded-xl bg-[#162016] hover:bg-[#1E2C1E] border border-[#2A3B29] text-left transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <Car className="w-3.5 h-3.5" />
                  <span>Taxi Cab</span>
                </div>
                <p className="text-[11px] text-stone-300 font-mono mt-1 font-bold">₹1,450.00</p>
                <p className="text-[9px] text-stone-400 truncate">Solang Valley Cab</p>
              </button>
            </div>
          </div>

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
