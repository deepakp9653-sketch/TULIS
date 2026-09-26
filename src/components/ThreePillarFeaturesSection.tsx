'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { ChromaKeyVideo } from './ChromaKeyVideo';

interface PillarConfig {
  id: string;
  index: string;
  heading: string;
  description: string;
  video: string;
  orbRange: [number, number];
  videoRange: [number, number];
  textRange: [number, number];
}

const PILLARS: PillarConfig[] = [
  {
    id: 'one-plan',
    index: '01',
    heading: 'ONE TRIP. ONE PLAN.',
    description:
      'Bring every booking, activity, stay, and journey into one shared itinerary. Everyone knows where they need to be, what they’re doing, and who’s part of each plan.',
    video: '/tulis/landing/features/feature-one-plan.mp4',
    // 1. Orb 1 appears first, 4. Video 1 reveals, 7. Heading + desc 1 reveals
    orbRange: [0.04, 0.16],
    videoRange: [0.24, 0.38],
    textRange: [0.48, 0.62],
  },
  {
    id: 'fair-split',
    index: '02',
    heading: 'EVERY EXPENSE. FAIRLY SPLIT.',
    description:
      'Track shared and personal spending across the trip without messy calculations. TULIS automatically keeps each person’s share clear, even when people pay differently or join and leave activities.',
    video: '/tulis/landing/features/feature-fair-split.mp4',
    // 2. Orb 2 appears second, 5. Video 2 reveals, 8. Heading + desc 2 reveals
    orbRange: [0.10, 0.22],
    videoRange: [0.31, 0.45],
    textRange: [0.55, 0.69],
  },
  {
    id: 'changes-balance',
    index: '03',
    heading: 'CHANGES IN. BALANCES UPDATED.',
    description:
      'Plans change, people drop out, bookings get cancelled, and refunds happen. TULIS recalculates the financial picture while keeping every change accounted for and traceable.',
    video: '/tulis/landing/features/feature-changes-balance.mp4',
    // 3. Orb 3 appears third, 6. Video 3 reveals, 9. Heading + desc 3 reveals
    orbRange: [0.16, 0.28],
    videoRange: [0.38, 0.52],
    textRange: [0.62, 0.76],
  },
];

interface PillarColumnProps {
  pillar: PillarConfig;
  progress: MotionValue<number>;
  prefersReducedMotion: boolean;
}

const PillarColumn: React.FC<PillarColumnProps> = ({
  pillar,
  progress,
  prefersReducedMotion,
}) => {
  // Orb Transform: starts at scale 0.90, y 36, opacity 0 -> scale 1, y 0, opacity 1
  const orbOpacity = useTransform(
    progress,
    pillar.orbRange,
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const orbScale = useTransform(
    progress,
    pillar.orbRange,
    prefersReducedMotion ? [1, 1] : [0.90, 1]
  );
  const orbY = useTransform(
    progress,
    pillar.orbRange,
    prefersReducedMotion ? [0, 0] : [36, 0]
  );

  // Video Transform: starts at scale 0.90, y 36, opacity 0 -> scale 1, y 0, opacity 1
  const videoOpacity = useTransform(
    progress,
    pillar.videoRange,
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const videoScale = useTransform(
    progress,
    pillar.videoRange,
    prefersReducedMotion ? [1, 1] : [0.90, 1]
  );
  const videoY = useTransform(
    progress,
    pillar.videoRange,
    prefersReducedMotion ? [0, 0] : [36, 0]
  );

  // Text Transform: starts at scale 0.92, y 28, opacity 0 -> scale 1, y 0, opacity 1
  const textOpacity = useTransform(
    progress,
    pillar.textRange,
    prefersReducedMotion ? [1, 1] : [0, 1]
  );
  const textScale = useTransform(
    progress,
    pillar.textRange,
    prefersReducedMotion ? [1, 1] : [0.92, 1]
  );
  const textY = useTransform(
    progress,
    pillar.textRange,
    prefersReducedMotion ? [0, 0] : [28, 0]
  );

  return (
    <div className="flex flex-col items-center text-center">
      {/* Visual Stage: Orb directly behind MP4 illustration */}
      <div className="relative w-full aspect-[4/3] flex items-center justify-center mb-6 sm:mb-8">
        {/* 1. Orb: White circular orb background with soft inner shading */}
        <motion.div
          style={{ opacity: orbOpacity, scale: orbScale, y: orbY }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 will-change-transform"
        >
          <div className="relative w-[240px] sm:w-[270px] md:w-[260px] lg:w-[310px] aspect-square filter drop-shadow-[0_12px_32px_rgba(18,56,46,0.06)]">
            <Image
              src="/tulis/landing/features/feature-orb.png"
              alt="Feature Orb"
              fill
              sizes="(max-width: 768px) 280px, 320px"
              priority
              className="object-contain pointer-events-none"
            />
          </div>
        </motion.div>

        {/* 2. MP4 Illustration: Cleanly keyed WebGL canvas centered directly over the Orb */}
        <motion.div
          style={{ opacity: videoOpacity, scale: videoScale, y: videoY }}
          className="relative z-10 w-full h-full flex items-center justify-center will-change-transform filter drop-shadow-[0_12px_28px_rgba(18,56,46,0.08)]"
        >
          <div className="relative w-[280px] sm:w-[320px] md:w-[300px] lg:w-[360px] aspect-[16/9] flex items-center justify-center">
            <ChromaKeyVideo
              src={pillar.video}
              threshold={0.16}
              smoothing={0.10}
              autoPlay={true}
              loop={true}
              muted={true}
              playsInline={true}
              ariaLabel={pillar.heading}
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>
      </div>

      {/* 3. Heading + Description Stage */}
      <motion.div
        style={{ opacity: textOpacity, scale: textScale, y: textY }}
        className="w-full max-w-sm mx-auto flex flex-col items-center space-y-3 px-2 will-change-transform"
      >
        {/* Index Tag */}
        <span className="text-[11px] font-mono font-bold tracking-widest text-[#2D7A5C] bg-[#DCEFE3]/70 px-2.5 py-0.5 rounded-full">
          {pillar.index}
        </span>

        {/* Heading */}
        <h3 className="text-xl sm:text-2xl font-black text-[#12382E] tracking-tight leading-snug uppercase">
          {pillar.heading}
        </h3>

        {/* Description */}
        <p className="text-sm sm:text-[14.5px] leading-relaxed text-[#3B4953]/85 font-normal">
          {pillar.description}
        </p>
      </motion.div>
    </div>
  );
};

export const ThreePillarFeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Dedicated, independent scroll progress for this feature section
  // Starts as the section enters the bottom 85% of viewport, finishes as section reaches focus
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 85%', 'center 38%'],
  });

  return (
    <section
      ref={sectionRef}
      id="features-three-pillars"
      className="relative w-full bg-[#F4F5EE] py-24 sm:py-32 md:py-36 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Three evenly spaced feature columns horizontally */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 sm:gap-16 md:gap-8 lg:gap-12 items-start">
          {PILLARS.map((pillar) => (
            <PillarColumn
              key={pillar.id}
              pillar={pillar}
              progress={scrollYProgress}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
