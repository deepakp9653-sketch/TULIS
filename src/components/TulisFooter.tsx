'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChromaKeyVideo } from './ChromaKeyVideo';

interface TulisFooterProps {
  onEnterApp?: () => void;
  onOpenCreateTrip?: () => void;
  onOpenJoinTrip?: () => void;
  onOpenMyTrips?: () => void;
  currentUser?: any;
}

export const TulisFooter: React.FC<TulisFooterProps> = ({
  onEnterApp,
  onOpenCreateTrip,
  onOpenJoinTrip,
  onOpenMyTrips,
  currentUser,
}) => {
  const footerRef = useRef<HTMLElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Track scroll-driven entrance as user reaches the final footer
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ['start end', 'start 0.45'],
  });

  // Content scroll transforms: opacity 0 -> 1, y +30px -> 0
  const contentOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.42],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const contentY = useTransform(
    scrollYProgress,
    [0.05, 0.45],
    prefersReducedMotion ? [0, 0] : [30, 0]
  );

  // QR block subtle entrance
  const qrBlockY = useTransform(
    scrollYProgress,
    [0.10, 0.48],
    prefersReducedMotion ? [0, 0] : [20, 0]
  );

  // Footer illustration scroll transforms: opacity 0 -> 1, scale 0.94 -> 1, y +30px -> 0
  const illustOpacity = useTransform(
    scrollYProgress,
    [0.12, 0.50],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const illustScale = useTransform(
    scrollYProgress,
    [0.12, 0.50],
    prefersReducedMotion ? [1, 1] : [0.94, 1]
  );
  const illustY = useTransform(
    scrollYProgress,
    [0.12, 0.50],
    prefersReducedMotion ? [0, 0] : [30, 0]
  );

  // Giant TULIS wordmark: reveals smoothly from bottom into subtle tonal opacity
  const wordmarkOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.45],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const wordmarkY = useTransform(
    scrollYProgress,
    [0.05, 0.50],
    prefersReducedMotion ? [0, 0] : [50, 0]
  );

  return (
    <footer
      ref={footerRef}
      id="tulis-final-footer"
      className="relative w-full overflow-hidden bg-[#12382E] text-[#F4F5EE] pt-24 sm:pt-32 pb-10 sm:pb-14 select-none"
    >
      {/* =========================================================================
          BACKGROUND DEPTH: Layered dark architectural tones (#0D2B23, #1F5A45)
          Creates subtle atmospheric depth behind the giant wordmark
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep base vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D2B23]/70 via-[#12382E] to-[#0D2B23]" />

        {/* Soft architectural curvature */}
        <div className="absolute -bottom-32 -left-40 w-[600px] h-[400px] rounded-full bg-[#1F5A45]/15 blur-[120px]" />
        <div className="absolute top-12 right-0 w-[500px] h-[350px] rounded-full bg-[#0D2B23]/80 blur-[100px]" />

        {/* Hairline subtle top boundary line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#1F5A45]/60 to-transparent" />
      </div>

      {/* =========================================================================
          FOOTER CONTENT: ASYMMETRICAL 40 / 60 DESKTOP COMPOSITION
          Left: ~40% (Brand anchor, editorial tone)
          Right: ~60% (Install block, navigation columns, illustration)
          ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          style={{
            opacity: contentOpacity,
            y: contentY,
          }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 will-change-transform"
        >
          {/* =====================================================================
              LEFT SIDE: ~40% (Col 1-5 on desktop)
              Primary visual anchor with brand mark and architectural calm
              ===================================================================== */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6 sm:space-y-8 pr-0 lg:pr-8">
            <div className="space-y-6">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl bg-[#0D2B23] border border-[#1F5A45] flex items-center justify-center shadow-inner">
                  <Image
                    src="/tulis/logo/tulis-logo.png"
                    alt="TULIS"
                    width={22}
                    height={22}
                    className="object-contain brightness-150 contrast-125"
                  />
                </div>
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#D9EE86] font-bold block">
                    TULIS
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#F4F5EE]/50 block">
                    Group Ledger Engine
                  </span>
                </div>
              </div>

              {/* Editorial Statement */}
              <p className="text-sm sm:text-base text-[#F4F5EE]/75 leading-relaxed font-normal max-w-md">
                Trip-first workspace for collaborative itinerary planning, shared group accounting, mathematical fairness, and instant UPI settlement.
              </p>
            </div>

            {/* Architecture Ledger Specs */}
            <div className="pt-6 border-t border-[#1F5A45]/40 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#D9EE86]/80 font-bold block">
                System Specifications
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Double-Entry Math', 'Zero-Sum Netting', 'Append-Only Audit', 'Offline CRDT'].map((spec, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-mono text-[#F4F5EE]/60 bg-[#0D2B23]/80 border border-[#1F5A45]/50 px-2.5 py-1 rounded-md"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* =====================================================================
              RIGHT SIDE: ~60% (Col 6-12 on desktop)
              Functional content: Install Tulis App block, Navigation, Illustration
              ===================================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-12">
            
            {/* 1. INSTALL TULIS BLOCK */}
            <motion.div
              style={{ y: qrBlockY }}
              className="p-6 sm:p-8 rounded-3xl bg-[#0D2B23]/90 border border-[#1F5A45] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              {/* Copy */}
              <div className="space-y-3 max-w-sm">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#D9EE86] font-bold block">
                  INSTALL TULIS
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#FFF9E8] tracking-tight leading-snug">
                  PLAN TOGETHER.<br />
                  SPLIT FAIRLY.<br />
                  SETTLE WITH CONFIDENCE.
                </h3>
              </div>

              {/* Clean Empty QR Code Placeholder Container */}
              <div className="flex flex-col items-center gap-2 self-center sm:self-auto shrink-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#12382E] border-2 border-[#1F5A45] p-3 flex flex-col items-center justify-center text-center shadow-inner group">
                  {/* Subtle Corner Bracket Accents */}
                  <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-[#D9EE86]/60" />
                  <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-[#D9EE86]/60" />
                  <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-[#D9EE86]/60" />
                  <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-[#D9EE86]/60" />

                  {/* Empty QR Scanner Area */}
                  <div className="w-full h-full border border-dashed border-[#1F5A45] rounded-xl flex flex-col items-center justify-center gap-1.5 p-2">
                    <span className="font-mono text-[10px] font-bold tracking-widest text-[#D9EE86] uppercase">
                      QR CODE
                    </span>
                    <span className="text-[8px] font-mono text-[#F4F5EE]/40 uppercase tracking-wider">
                      Placeholder
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#F4F5EE]/65 tracking-wide">
                  Scan to install TULIS
                </span>
              </div>
            </motion.div>

            {/* 2. NAVIGATION COLUMNS & FOOTER ILLUSTRATION */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-8 pt-2">
              
              {/* Compact Navigation Columns */}
              <div className="grid grid-cols-3 gap-6 sm:gap-10 w-full md:w-auto">
                {/* Column 1: PRODUCT */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#D9EE86] uppercase block">
                    PRODUCT
                  </span>
                  <ul className="space-y-2 text-xs font-normal text-[#F4F5EE]/75">
                    {['Plan Trips', 'Shared Expenses', 'Fair Splits', 'Settlement'].map((item) => (
                      <li key={item}>
                        <a
                          href="#split-fairly"
                          className="hover:text-[#D9EE86] transition-colors inline-block hover:translate-x-0.5 duration-200"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: WORKSPACE */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#D9EE86] uppercase block">
                    WORKSPACE
                  </span>
                  <ul className="space-y-2 text-xs font-normal text-[#F4F5EE]/75">
                    {currentUser && onOpenMyTrips && (
                      <li>
                        <button
                          onClick={onOpenMyTrips}
                          className="hover:text-[#D9EE86] transition-colors text-left cursor-pointer bg-transparent border-none p-0 inline-block hover:translate-x-0.5 duration-200"
                        >
                          My Trips
                        </button>
                      </li>
                    )}
                    {onOpenCreateTrip && (
                      <li>
                        <button
                          onClick={onOpenCreateTrip}
                          className="hover:text-[#D9EE86] transition-colors text-left cursor-pointer bg-transparent border-none p-0 inline-block hover:translate-x-0.5 duration-200"
                        >
                          Create Trip
                        </button>
                      </li>
                    )}
                    {onOpenJoinTrip && (
                      <li>
                        <button
                          onClick={onOpenJoinTrip}
                          className="hover:text-[#D9EE86] transition-colors text-left cursor-pointer bg-transparent border-none p-0 inline-block hover:translate-x-0.5 duration-200"
                        >
                          Join Trip
                        </button>
                      </li>
                    )}
                    {onEnterApp && (
                      <li>
                        <button
                          onClick={onEnterApp}
                          className="hover:text-[#D9EE86] transition-colors text-left cursor-pointer bg-transparent border-none p-0 inline-block hover:translate-x-0.5 duration-200"
                        >
                          Dashboard
                        </button>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Column 3: SUPPORT */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-[#D9EE86] uppercase block">
                    SUPPORT
                  </span>
                  <ul className="space-y-2 text-xs font-normal text-[#F4F5EE]/75">
                    {['Help', 'Contact', 'Privacy', 'Terms'].map((item) => (
                      <li key={item}>
                        <a
                          href="#"
                          className="hover:text-[#D9EE86] transition-colors inline-block hover:translate-x-0.5 duration-200"
                        >
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 3. FOOTER ILLUSTRATION
                  Positioned toward lower-right of functional section.
                  Keyed out cleanly with ChromaKeyVideo removing #00FF00 green.
              */}
              <motion.div
                style={{
                  opacity: illustOpacity,
                  scale: illustScale,
                  y: illustY,
                }}
                className="w-full md:w-auto flex justify-center md:justify-end self-center md:self-end will-change-transform shrink-0"
              >
                <div className="relative w-44 sm:w-52 md:w-56 aspect-[16/9] flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
                  <ChromaKeyVideo
                    src="/tulis/landing/footer/footer-illustration.mp4"
                    threshold={0.24}
                    smoothing={0.06}
                    spillThreshold={0.18}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    playsInline={true}
                    ariaLabel="TULIS Travel Companions"
                    className="w-full h-full object-contain"
                  />
                </div>
              </motion.div>

            </div>
          </div>
        </motion.div>

        {/* =========================================================================
            MASSIVE ARCHITECTURAL TULIS WORDMARK
            Positioned cleanly below all footer text content so there is zero overlap.
            ========================================================================= */}
        <motion.div
          style={{
            opacity: wordmarkOpacity,
            y: wordmarkY,
          }}
          className="mt-10 sm:mt-14 -mb-3 sm:-mb-5 pointer-events-none select-none will-change-transform overflow-hidden"
          aria-hidden="true"
        >
          <span className="block font-black text-[clamp(4.5rem,16vw,14rem)] tracking-tighter leading-none text-[#F4F5EE]/[0.08] whitespace-nowrap">
            TULIS
          </span>
        </motion.div>

        {/* =========================================================================
            BOTTOM BRAND SIGNATURE & COPYRIGHT
            TULIS — PLAN TOGETHER. SPLIT FAIRLY. SETTLE WITH CONFIDENCE.
            ========================================================================= */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-[#1F5A45]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F4F5EE]/60">
          <span className="font-bold tracking-wider text-[#F4F5EE]/80 text-center sm:text-left">
            TULIS — PLAN TOGETHER. SPLIT FAIRLY. SETTLE WITH CONFIDENCE.
          </span>
          <span className="text-[11px] text-[#F4F5EE]/50 text-center sm:text-right">
            © 2026 TULIS • Zero-Sum Double-Entry Group Ledger Engine
          </span>
        </div>
      </div>
    </footer>
  );
};
