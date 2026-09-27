'use client';

import React from 'react';
import { interpolate, Easing } from './motion-config';
import { ArrowRight, Key, Plus, FolderHeart } from 'lucide-react';

interface TulisHeaderProps {
  progress: number;
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
  onOpenMyTrips?: () => void;
}

export const TulisHeader: React.FC<TulisHeaderProps> = ({
  progress,
  onEnterApp,
  onOpenCreateTrip,
  onOpenJoinTrip,
  currentUser,
  onOpenAuth,
  onOpenMyTrips,
}) => {
  // Emergence starts around 30%, finishes by 65%
  const opacity = interpolate(progress, [0.32, 0.65], [0, 1], Easing.easeOutQuad);
  const translateY = interpolate(progress, [0.32, 0.65], [-18, 0], Easing.easeOutCubic);
  const borderOpacity = interpolate(progress, [0.55, 0.95], [0, 1], Easing.easeOutQuad);

  // If progress is low, prevent blocking clicks to anything underneath
  const isInteractive = progress >= 0.5;

  return (
    <header
      className={`fixed top-0 inset-x-0 z-30 transition-all duration-150 ${
        isInteractive ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      style={{
        opacity,
        transform: `translate3d(0, ${translateY}px, 0)`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div
          className="px-4 sm:px-6 py-2.5 rounded-2xl flex items-center justify-between transition-all duration-300 backdrop-blur-md border border-[#3B4953]/15"
          style={{
            backgroundColor: `rgba(235, 244, 221, ${0.92 * borderOpacity})`,
            boxShadow:
              borderOpacity > 0.3
                ? '6px 6px 18px rgba(59, 73, 83, 0.08), -6px -6px 18px rgba(255, 255, 255, 0.85)'
                : 'none',
          }}
        >
          {/* Left slot reserved for the physically landing TULIS logo */}
          <div className="flex items-center gap-3">
            <div className="w-[110px] sm:w-[130px] h-[36px]" aria-label="TULIS" />
            <div className="hidden lg:block h-4 w-px bg-[#3B4953]/20" />
            <span className="hidden lg:inline text-[10px] font-mono tracking-widest text-[#5A7863] uppercase font-semibold">
              Trip Workspace
            </span>
          </div>

          {/* Minimal Editorial Navigation */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#3B4953]">
            <a
              href="#problem"
              className="hover:text-[#5A7863] transition-colors py-1 px-2 rounded-lg hover:bg-white/40"
            >
              The Problem
            </a>
            <a
              href="#split-fairly"
              className="hover:text-[#5A7863] transition-colors py-1 px-2 rounded-lg hover:bg-white/40"
            >
              Split Fairly
            </a>
            <a
              href="#changes"
              className="hover:text-[#5A7863] transition-colors py-1 px-2 rounded-lg hover:bg-white/40"
            >
              Changes
            </a>
            <a
              href="#balances"
              className="hover:text-[#5A7863] transition-colors py-1 px-2 rounded-lg hover:bg-white/40"
            >
              Balances
            </a>
            <a
              href="#audit"
              className="hover:text-[#5A7863] transition-colors py-1 px-2 rounded-lg hover:bg-white/40"
            >
              Audit
            </a>
          </nav>

          {/* Tactile Neumorphic Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {currentUser ? (
              <button
                onClick={onOpenMyTrips}
                className="px-3 py-1.5 rounded-xl neu-btn text-[#3B4953] hover:text-[#5A7863] transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
                title={`Logged in as ${currentUser.name}`}
              >
                <FolderHeart className="w-3.5 h-3.5 text-[#5A7863]" />
                <span className="max-w-[100px] truncate">
                  {currentUser.name?.split(' ')[0] || 'My Trips'}
                </span>
              </button>
            ) : onOpenAuth ? (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 rounded-xl neu-btn text-[#3B4953] hover:text-[#5A7863] transition-all text-xs font-semibold cursor-pointer"
              >
                Sign In
              </button>
            ) : null}

            <button
              onClick={onOpenJoinTrip}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl neu-btn text-[#3B4953] hover:text-[#5A7863] transition-all text-xs font-semibold cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#5A7863]" />
              <span>Join Trip</span>
            </button>

            <button
              onClick={onEnterApp}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl neu-btn-primary transition-all text-xs font-bold cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
