'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Grid,
  User,
  Shield,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';

interface AudioShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName?: string;
  delaySeconds?: number;
}

export const AudioShieldModal: React.FC<AudioShieldModalProps> = ({
  isOpen,
  onClose,
  callerName = 'Mom',
  delaySeconds = 0,
}) => {
  const [callState, setCallState] = useState<'delayed' | 'ringing' | 'connected'>('ringing');
  const [callDuration, setCallDuration] = useState(0);
  const [countdown, setCountdown] = useState(delaySeconds);
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  // Synthesize realistic phone ringtone using Web Audio API (zero external asset dependency)
  const startRingtone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const playRingToneBurst = () => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // US/Standard Dual-tone multi-frequency ring cadence (440Hz + 480Hz)
        osc1.frequency.value = 440;
        osc2.frequency.value = 480;

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 1.8);
        osc2.stop(ctx.currentTime + 1.8);
      };

      playRingToneBurst();
      intervalRef.current = setInterval(playRingToneBurst, 3000);
    } catch (e) {
      console.warn('Ringtone audio synthesis note:', e);
    }
  };

  const stopRingtone = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
  };

  // Play realistic synthesized caller voice when answered
  const speakCallerPrompt = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const message = new SpeechSynthesisUtterance(
        "Hey! Where are you? We're waiting right outside for you in the car, please come out right now."
      );
      message.rate = 1.0;
      message.pitch = 1.1;
      window.speechSynthesis.speak(message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (delaySeconds > 0) {
        setCallState('delayed');
        setCountdown(delaySeconds);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              setCallState('ringing');
              startRingtone();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      } else {
        setCallState('ringing');
        startRingtone();
      }
    } else {
      stopRingtone();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setCallState('ringing');
      setCallDuration(0);
    }

    return () => {
      stopRingtone();
    };
  }, [isOpen, delaySeconds]);

  // Track active call duration
  useEffect(() => {
    let durTimer: any;
    if (callState === 'connected') {
      durTimer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(durTimer);
  }, [callState]);

  if (!isOpen) return null;

  const handleAnswer = () => {
    stopRingtone();
    setCallState('connected');
    speakCallerPrompt();
  };

  const handleDecline = () => {
    stopRingtone();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
      {callState === 'delayed' ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1B2119] border border-[#2A322A] p-7 rounded-3xl max-w-sm w-full text-center space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#5FA97D]/20 text-[#5FA97D] flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="font-serif-display font-bold text-lg text-[#F4F2E6]">
            Audio Shield Armed
          </h3>
          <p className="text-xs text-[#8B9A8C]">
            Incoming call from <span className="text-[#F4F2E6] font-semibold">{callerName}</span> will trigger in:
          </p>
          <div className="text-4xl font-mono font-bold text-[#5FA97D]">
            00:{countdown.toString().padStart(2, '0')}
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#2A322A] text-[#8B9A8C] text-xs font-semibold hover:text-[#F4F2E6]"
          >
            Cancel Shield
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-xs w-full bg-[#12160F] border border-[#2A322A] rounded-[42px] p-8 text-center shadow-2xl flex flex-col justify-between h-[560px] relative overflow-hidden"
        >
          {/* Subtle phone status bar */}
          <div className="flex items-center justify-between text-[11px] text-[#8B9A8C] font-mono px-2">
            <span>Tulis Secure</span>
            <Shield className="w-3.5 h-3.5 text-[#5FA97D]" />
          </div>

          {/* Caller Identity */}
          <div className="my-auto space-y-3">
            <div className="w-24 h-24 rounded-full bg-[#1B2119] border-2 border-[#5FA97D]/40 text-[#5FA97D] flex items-center justify-center mx-auto shadow-2xl relative">
              <User className="w-12 h-12" />
              {callState === 'ringing' && (
                <div className="absolute inset-0 rounded-full border-2 border-[#5FA97D] animate-ping opacity-30" />
              )}
            </div>

            <div>
              <h2 className="font-sans font-bold text-2xl text-[#F4F2E6]">{callerName}</h2>
              <p className="text-xs font-mono text-[#8B9A8C] mt-1">
                {callState === 'ringing' ? 'Incoming call...' : formatTimer(callDuration)}
              </p>
            </div>
          </div>

          {/* Connected Controls (Keypad, Mute, Speaker) */}
          {callState === 'connected' && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="flex flex-col items-center gap-1 text-[10px] text-[#8B9A8C]">
                <div className="w-11 h-11 rounded-full bg-[#1B2119] border border-[#2A322A] flex items-center justify-center text-[#F4F2E6]">
                  <Mic className="w-4 h-4" />
                </div>
                <span>Mute</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-[#8B9A8C]">
                <div className="w-11 h-11 rounded-full bg-[#1B2119] border border-[#2A322A] flex items-center justify-center text-[#F4F2E6]">
                  <Grid className="w-4 h-4" />
                </div>
                <span>Keypad</span>
              </div>
              <div className="flex flex-col items-center gap-1 text-[10px] text-[#8B9A8C]">
                <div className="w-11 h-11 rounded-full bg-[#1B2119] border border-[#2A322A] flex items-center justify-center text-[#5FA97D]">
                  <Volume2 className="w-4 h-4" />
                </div>
                <span>Speaker</span>
              </div>
            </div>
          )}

          {/* Action Call Buttons */}
          <div className="flex items-center justify-around pt-2">
            {callState === 'ringing' ? (
              <>
                <button
                  type="button"
                  onClick={handleDecline}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] flex items-center justify-center shadow-lg transition-transform active:scale-95">
                    <PhoneOff className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] text-[#8B9A8C]">Decline</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnswer}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-full bg-[#5FA97D] hover:bg-[#4E9A6E] text-[#12160F] flex items-center justify-center shadow-lg transition-transform active:scale-95 animate-bounce">
                    <Phone className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] text-[#5FA97D] font-bold">Answer</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleDecline}
                className="flex flex-col items-center gap-1.5 mx-auto cursor-pointer"
              >
                <div className="w-16 h-16 rounded-full bg-[#B5484C] hover:bg-[#9E3E41] text-[#F4F2E6] flex items-center justify-center shadow-xl transition-transform active:scale-95">
                  <PhoneOff className="w-7 h-7" />
                </div>
                <span className="text-xs text-[#8B9A8C] font-semibold">End Call</span>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
