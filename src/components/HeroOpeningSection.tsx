'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ChromaKeyVideo } from './ChromaKeyVideo';

interface ScrollWordProps {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
  colorClass: string;
  prefersReducedMotion: boolean;
}

const ScrollWord: React.FC<ScrollWordProps> = ({
  word,
  progress,
  range,
  colorClass,
  prefersReducedMotion,
}) => {
  const opacity = useTransform(progress, range, prefersReducedMotion ? [1, 1] : [0.18, 1]);
  const y = useTransform(progress, range, prefersReducedMotion ? [0, 0] : [16, 0]);
  const scale = useTransform(progress, range, prefersReducedMotion ? [1, 1] : [0.96, 1]);

  return (
    <motion.span
      style={{ opacity, y, scale }}
      className={`inline-block mr-[0.25em] last:mr-0 will-change-transform ${colorClass}`}
    >
      {word}
    </motion.span>
  );
};

export const HeroOpeningSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Track scroll progress as this section enters and moves into full viewport focus
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });

  // Scroll-responsive transforms for illustrations (starts slightly smaller & lower, scales & rises to 1)
  const characterY = useTransform(
    scrollYProgress,
    [0.05, 0.72],
    prefersReducedMotion ? [0, 0] : [65, 0]
  );
  const characterScale = useTransform(
    scrollYProgress,
    [0.05, 0.72],
    prefersReducedMotion ? [1, 1] : [0.88, 1]
  );
  const characterOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.40],
    prefersReducedMotion ? [1, 1] : [0.2, 1]
  );

  const bagY = useTransform(
    scrollYProgress,
    [0.08, 0.75],
    prefersReducedMotion ? [0, 0] : [50, 0]
  );
  const bagScale = useTransform(
    scrollYProgress,
    [0.08, 0.75],
    prefersReducedMotion ? [1, 1] : [0.84, 1]
  );
  const bagOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.45],
    prefersReducedMotion ? [1, 1] : [0.2, 1]
  );

  const bgOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.35],
    prefersReducedMotion ? [1, 1] : [0.7, 1]
  );

  // Word-by-word reveal sequence: 6 words across scroll progress [0.10, 0.74]
  const wordsConfig: Array<{
    word: string;
    range: [number, number];
    colorClass: string;
    phraseGroup: number;
  }> = [
      { word: 'EVERY', range: [0.10, 0.20], colorClass: 'text-[#12382E]', phraseGroup: 1 },
      { word: 'TRIP.', range: [0.20, 0.30], colorClass: 'text-[#12382E]', phraseGroup: 1 },
      { word: 'EVERY', range: [0.32, 0.42], colorClass: 'text-[#2D7A5C]', phraseGroup: 2 },
      { word: 'EXPENSE.', range: [0.42, 0.52], colorClass: 'text-[#2D7A5C]', phraseGroup: 2 },
      { word: 'ONE', range: [0.54, 0.64], colorClass: 'text-[#243B53]', phraseGroup: 3 },
      { word: 'PLACE.', range: [0.64, 0.74], colorClass: 'text-[#243B53]', phraseGroup: 3 },
    ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#EBF4DD] via-[#F4F5EE] to-[#F4F5EE] select-none"
      style={{
        // Cinematic section height with seamless vertical continuity
        minHeight: 'clamp(620px, 88vh, 1000px)',
      }}
    >
      {/* =========================================================================
          1. CAMPSITE / TRAVEL BACKGROUND
          Entire illustration preserved without cropping, native 1920:1080 aspect ratio.
          Scroll-responsive elevation into place.
          ========================================================================= */}
      <motion.div
        style={{ opacity: bgOpacity }}
        className="absolute inset-x-0 bottom-0 w-full flex items-end justify-center pointer-events-none select-none z-0"
      >
        <div className="relative w-full max-w-[1920px]">
          <Image
            src="/tulis/landing/hero/hero-background.png"
            alt="Campsite and Travel Horizon"
            width={1920}
            height={1080}
            priority
            sizes="100vw"
            className="w-full h-auto object-contain object-bottom pointer-events-none"
          />
        </div>
      </motion.div>

      {/* =========================================================================
          2. EDITORIAL HEADLINE & ILLUSTRATION STAGE
          Spacious cinematic stage with scroll-driven word-by-word reveal
          ========================================================================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12 sm:pt-20 md:pt-24 pb-4 flex flex-col items-center justify-between min-h-[clamp(620px,88vh,1000px)]">
        {/* EDITORIAL HEADLINE
            Word-by-word reveal driven directly by scroll progress
            Heavy bold editorial typeface in strictly permitted palette
        */}
        <div className="text-center max-w-5xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem] font-black tracking-tight leading-[1.06] uppercase">
            {/* Phrase 1: EVERY TRIP. */}
            <span className="inline-block whitespace-nowrap mr-3 sm:mr-5">
              {wordsConfig
                .filter((w) => w.phraseGroup === 1)
                .map((w, idx) => (
                  <ScrollWord
                    key={`p1-${idx}`}
                    word={w.word}
                    progress={scrollYProgress}
                    range={w.range}
                    colorClass={w.colorClass}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
            </span>

            {/* Phrase 2: EVERY EXPENSE. */}
            <span className="inline-block whitespace-nowrap mr-3 sm:mr-5">
              {wordsConfig
                .filter((w) => w.phraseGroup === 2)
                .map((w, idx) => (
                  <ScrollWord
                    key={`p2-${idx}`}
                    word={w.word}
                    progress={scrollYProgress}
                    range={w.range}
                    colorClass={w.colorClass}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
            </span>

            {/* Phrase 3: ONE PLACE. */}
            <span className="inline-block whitespace-nowrap">
              {wordsConfig
                .filter((w) => w.phraseGroup === 3)
                .map((w, idx) => (
                  <ScrollWord
                    key={`p3-${idx}`}
                    word={w.word}
                    progress={scrollYProgress}
                    range={w.range}
                    colorClass={w.colorClass}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                ))}
            </span>
          </h2>
        </div>

        {/* ILLUSTRATIONS COMPOSITION STAGE
            Main character in center (Primary illustration)
            Travel-object/bag animation elegantly offset to the right
            Scroll-responsive: starts slightly smaller and lower, scales and rises up smoothly
            Both videos continuously loop once visible with zero visual clipping
        */}
        <div className="relative w-full max-w-6xl flex-1 flex items-end justify-center mt-6 sm:mt-10 mb-2 sm:mb-6">
          {/* Subtle Ground Anchor Shadow */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] max-w-[640px] h-6 rounded-full bg-[#12382E]/8 blur-xl pointer-events-none" />

          {/* MAIN CHARACTER VIDEO (Center Primary Illustration)
              Chroma key removes solid #00FF00 green
              Scroll-responsive upward movement & scaling
              Continuous loop
          */}
          <motion.div
            style={{
              y: characterY,
              scale: characterScale,
              opacity: characterOpacity,
            }}
            className="relative z-20 w-[280px] sm:w-[420px] md:w-[520px] lg:w-[600px] aspect-[16/9] flex items-center justify-center filter drop-shadow-[0_12px_24px_rgba(18,56,46,0.08)] will-change-transform"
          >
            <ChromaKeyVideo
              src="/tulis/landing/hero/main-character.mp4"
              threshold={0.16}
              smoothing={0.10}
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              ariaLabel="TULIS Traveler Character"
              className="w-full h-full"
            />
          </motion.div>

          {/* TRAVEL-OBJECTS / GEAR VIDEO (Offset Secondary Visual)
              Chroma key removes solid #00FF00 green
              Positioned beside the couch so objects (camera/passport) are fully visible without clipping
              Scroll-responsive upward movement & scaling
              Continuous loop
          */}
          <motion.div
            style={{
              y: bagY,
              scale: bagScale,
              opacity: bagOpacity,
            }}
            className="absolute right-0 sm:right-2 md:right-4 lg:right-6 xl:right-10 bottom-1 sm:bottom-4 md:bottom-6 z-30 w-[170px] sm:w-[230px] md:w-[280px] lg:w-[320px] aspect-[16/9] flex items-center justify-center filter drop-shadow-[0_8px_20px_rgba(18,56,46,0.06)] will-change-transform"
          >
            <ChromaKeyVideo
              src="/tulis/landing/hero/travel-objects.mp4"
              threshold={0.16}
              smoothing={0.10}
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              ariaLabel="TULIS Travel Backpack and Gear"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
