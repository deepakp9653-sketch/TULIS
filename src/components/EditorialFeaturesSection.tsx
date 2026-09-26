'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChromaKeyVideo } from './ChromaKeyVideo';

export const EditorialFeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Track scroll position through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Card 1 — FROM LEFT:
  // Initial: opacity: 0, x: -100px, scale: 0.94 -> As scroll progresses: opacity: 1, x: 0, scale: 1
  const card1X = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [0, 0] : [-100, 0]
  );
  const card1Opacity = useTransform(
    scrollYProgress,
    [0.06, 0.48],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const card1Scale = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.94, 1]
  );

  // Card 1 illustration: scale: 0.92 -> 1, opacity: 0.5 -> 1
  const card1IllustScale = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.92, 1]
  );
  const card1IllustOpacity = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.5, 1]
  );

  // Card 2 — FROM RIGHT:
  // Initial: opacity: 0, x: 100px, scale: 0.94 -> As scroll progresses: opacity: 1, x: 0, scale: 1
  const card2X = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [0, 0] : [100, 0]
  );
  const card2Opacity = useTransform(
    scrollYProgress,
    [0.06, 0.48],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const card2Scale = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.94, 1]
  );

  // Card 2 illustration: scale: 0.92 -> 1, opacity: 0.5 -> 1
  const card2IllustScale = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.92, 1]
  );
  const card2IllustOpacity = useTransform(
    scrollYProgress,
    [0.06, 0.52],
    prefersReducedMotion ? [1, 1] : [0.5, 1]
  );

  // Card 3 — FROM BOTTOM:
  // After upper cards begin entering: opacity: 0, y: 120px, scale: 0.94 -> Then: opacity: 1, y: 0, scale: 1
  const card3Y = useTransform(
    scrollYProgress,
    [0.30, 0.78],
    prefersReducedMotion ? [0, 0] : [120, 0]
  );
  const card3Opacity = useTransform(
    scrollYProgress,
    [0.30, 0.72],
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const card3Scale = useTransform(
    scrollYProgress,
    [0.30, 0.78],
    prefersReducedMotion ? [1, 1] : [0.94, 1]
  );

  // Card 3 illustration: scale: 0.92 -> 1, opacity: 0.5 -> 1
  const card3IllustScale = useTransform(
    scrollYProgress,
    [0.30, 0.78],
    prefersReducedMotion ? [1, 1] : [0.92, 1]
  );
  const card3IllustOpacity = useTransform(
    scrollYProgress,
    [0.30, 0.78],
    prefersReducedMotion ? [1, 1] : [0.5, 1]
  );

  return (
    <section
      ref={sectionRef}
      id="advanced-editorial-features"
      className="relative w-full bg-[#2D7A5C] py-24 sm:py-32 lg:py-40 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Context Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF9E8]/15 border border-[#FFF9E8]/25 text-[#FFF9E8] text-xs font-mono font-bold tracking-widest uppercase mb-5">
            <span className="w-2 h-2 rounded-full bg-[#D9EE86]" />
            INTELLIGENCE &amp; RESILIENCE
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#FFF9E8] tracking-tight leading-[1.12]">
            BUILT FOR UNPREDICTABLE REALITY.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#FFF9E8]/85 leading-relaxed font-normal max-w-2xl">
            Trips unfold in unpredictable ways. TULIS equips organizers and squads with multimodal intelligence, outcome simulation, and mission-critical emergency assistance.
          </p>
        </div>

        {/* 3-Card Editorial Layout:
            Card 1 (Vertical) + Card 2 (Vertical) on top
            Card 3 (Horizontal) spanning full width below
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
          {/* =========================================================================
              CARD 1 — MULTIMODAL AI OPERATIONS (Vertical, Left)
              Color: #FFF9E8
              Animation: FROM LEFT (opacity 0, x -100px, scale 0.94 -> 1, 0, 1)
              ========================================================================= */}
          <motion.div
            id="card-multimodal-ai"
            style={{
              x: card1X,
              opacity: card1Opacity,
              scale: card1Scale,
            }}
            className="flex flex-col justify-between rounded-[28px] sm:rounded-[36px] bg-[#FFF9E8] border-2 border-[#12382E]/15 p-6 sm:p-8 lg:p-10 shadow-[0_24px_48px_-12px_rgba(18,56,46,0.25),0_4px_12px_rgba(18,56,46,0.08)] min-h-[560px] sm:min-h-[620px] xl:min-h-[660px] will-change-transform"
          >
            {/* Visual Illustration Area: 45–55% of card space */}
            <motion.div
              style={{
                scale: card1IllustScale,
                opacity: card1IllustOpacity,
              }}
              className="relative w-full h-[290px] sm:h-[350px] lg:h-[370px] xl:h-[410px] flex items-center justify-center will-change-transform"
            >
              <ChromaKeyVideo
                src="/tulis/landing/advanced/multimodal-ai.mp4"
                threshold={0.24}
                smoothing={0.06}
                spillThreshold={0.18}
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                ariaLabel="MULTIMODAL AI OPERATIONS"
                className="w-full h-full object-contain filter drop-shadow-[0_16px_28px_rgba(18,56,46,0.08)]"
              />
            </motion.div>

            {/* Content & Typography */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-[#12382E]/10 flex flex-col space-y-3 sm:space-y-4">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest uppercase text-[#2D7A5C] bg-[#2D7A5C]/10 px-3 py-1 rounded-full w-fit">
                01 &bull; INTELLIGENT CAPTURE
              </span>
              <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#12382E] tracking-tight leading-[1.14]">
                MULTIMODAL AI OPERATIONS.
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-[#12382E]/85 leading-relaxed font-normal">
                Bring receipts, voice notes, trip conversations, and itinerary planning into one intelligent workspace. TULIS turns different travel inputs into structured actions, helping you capture, understand, and manage trip information without jumping between multiple tools.
              </p>
            </div>
          </motion.div>

          {/* =========================================================================
              CARD 2 — WHAT-IF SCENARIOS (Vertical, Right)
              Color: #D9EE86
              Animation: FROM RIGHT (opacity 0, x 100px, scale 0.94 -> 1, 0, 1)
              ========================================================================= */}
          <motion.div
            id="card-what-if-scenarios"
            style={{
              x: card2X,
              opacity: card2Opacity,
              scale: card2Scale,
            }}
            className="flex flex-col justify-between rounded-[28px] sm:rounded-[36px] bg-[#D9EE86] border-2 border-[#12382E]/15 p-6 sm:p-8 lg:p-10 shadow-[0_24px_48px_-12px_rgba(18,56,46,0.25),0_4px_12px_rgba(18,56,46,0.08)] min-h-[560px] sm:min-h-[620px] xl:min-h-[660px] will-change-transform"
          >
            {/* Visual Illustration Area: 45–55% of card space */}
            <motion.div
              style={{
                scale: card2IllustScale,
                opacity: card2IllustOpacity,
              }}
              className="relative w-full h-[290px] sm:h-[350px] lg:h-[370px] xl:h-[410px] flex items-center justify-center will-change-transform"
            >
              <ChromaKeyVideo
                src="/tulis/landing/advanced/what-if-scenarios.mp4"
                threshold={0.24}
                smoothing={0.06}
                spillThreshold={0.18}
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                ariaLabel="WHAT-IF SCENARIOS"
                className="w-full h-full object-contain filter drop-shadow-[0_16px_28px_rgba(18,56,46,0.08)]"
              />
            </motion.div>

            {/* Content & Typography */}
            <div className="mt-6 sm:mt-8 pt-4 border-t border-[#12382E]/15 flex flex-col space-y-3 sm:space-y-4">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest uppercase text-[#12382E] bg-[#12382E]/10 px-3 py-1 rounded-full w-fit">
                02 &bull; IMPACT MODELING
              </span>
              <h3 className="text-2xl sm:text-3xl xl:text-4xl font-black text-[#12382E] tracking-tight leading-[1.14]">
                WHAT-IF SCENARIOS.
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-[#12382E]/85 leading-relaxed font-normal">
                Explore the impact of traveler changes, cancellations, expense revisions, and budget shifts before committing them to the real trip. TULIS lets you safely test different outcomes and understand how each change affects the trip and its finances.
              </p>
            </div>
          </motion.div>

          {/* =========================================================================
              CARD 3 — HUMAN SAFETY & EMERGENCY SOS (Horizontal, Bottom)
              Color: #F2D778
              Animation: FROM BOTTOM (opacity 0, y 120px, scale 0.94 -> 1, 0, 1)
              Layout: Wide horizontal card below the two vertical cards
              ========================================================================= */}
          <motion.div
            id="card-emergency-sos"
            style={{
              y: card3Y,
              opacity: card3Opacity,
              scale: card3Scale,
            }}
            className="lg:col-span-2 flex flex-col lg:flex-row items-center justify-between rounded-[28px] sm:rounded-[36px] bg-[#F2D778] border-2 border-[#12382E]/15 p-6 sm:p-8 lg:p-12 xl:p-14 shadow-[0_24px_48px_-12px_rgba(18,56,46,0.25),0_4px_12px_rgba(18,56,46,0.08)] min-h-[460px] lg:min-h-[480px] will-change-transform gap-8 lg:gap-12"
          >
            {/* Visual Illustration Area: 45–55% of card space */}
            <motion.div
              style={{
                scale: card3IllustScale,
                opacity: card3IllustOpacity,
              }}
              className="relative w-full lg:w-1/2 h-[300px] sm:h-[360px] md:h-[400px] lg:h-[440px] xl:h-[480px] flex items-center justify-center will-change-transform"
            >
              <ChromaKeyVideo
                src="/tulis/landing/advanced/emergency-sos.mp4"
                threshold={0.28}
                smoothing={0.04}
                spillThreshold={0.18}
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                ariaLabel="HUMAN SAFETY & EMERGENCY SOS"
                className="w-full h-full object-contain filter drop-shadow-[0_16px_28px_rgba(18,56,46,0.08)]"
              />
            </motion.div>

            {/* Content & Typography */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-4 sm:space-y-5">
              <span className="inline-block text-[11px] font-mono font-bold tracking-widest uppercase text-[#12382E] bg-[#12382E]/10 px-3 py-1 rounded-full w-fit">
                03 &bull; CRITICAL SAFEGUARDS
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#12382E] tracking-tight leading-[1.12]">
                HUMAN SAFETY &amp; EMERGENCY SOS.
              </h3>
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-[#12382E]/85 leading-relaxed font-normal">
                Trigger an emergency beacon with one tap, share live GPS location, find nearby police assistance, and keep emergency contacts connected. TULIS provides a dedicated live tracking page when real-time visibility matters.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
