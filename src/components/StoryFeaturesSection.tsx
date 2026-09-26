'use client';

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { ChromaKeyVideo } from './ChromaKeyVideo';

interface StoryFeature {
  id: string;
  index: string;
  heading: string;
  description: string;
  video: string;
}

const STORY_FEATURES: StoryFeature[] = [
  {
    id: 'clear-balances',
    index: '01',
    heading: 'KNOW WHAT YOU OWE.',
    description:
      'See exactly who paid, who consumed, and how every expense affects the group. TULIS turns scattered spending into a clear, explainable balance for every traveler.',
    video: '/tulis/landing/features/story/clear-balances.mp4',
  },
  {
    id: 'simple-settlement',
    index: '02',
    heading: 'SETTLE WITHOUT THE MESS.',
    description:
      'TULIS simplifies group obligations into clear payment targets, so everyone knows who needs to pay whom and can move directly to settlement through UPI.',
    video: '/tulis/landing/features/story/simple-settlement.mp4',
  },
  {
    id: 'changes-refunds',
    index: '03',
    heading: 'EVERY CHANGE. ACCOUNTED FOR.',
    description:
      'Cancellations, refunds, booking changes, and new expenses can reshape a trip. TULIS keeps the financial impact visible and preserves the history behind every change.',
    video: '/tulis/landing/features/story/changes-refunds.mp4',
  },
  {
    id: 'offline-sync',
    index: '04',
    heading: 'KEEP MOVING. EVEN OFFLINE.',
    description:
      'Record expenses and important trip actions without relying on a constant connection. TULIS queues changes safely and reconciles them when connectivity returns.',
    video: '/tulis/landing/features/story/offline-sync.mp4',
  },
];

interface StoryIllustrationProps {
  feature: StoryFeature;
  index: number;
  onActivate: (index: number) => void;
  prefersReducedMotion: boolean;
}

const StoryIllustrationItem = memo<StoryIllustrationProps>(({
  feature,
  index,
  onActivate,
  prefersReducedMotion,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);

  // Track each illustration's position as it scrolls through the viewport center
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ['start end', 'end start'],
  });

  // When centered around 0.5, the illustration reaches full active state
  const opacity = useTransform(
    scrollYProgress,
    [0.18, 0.42, 0.58, 0.82],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.22, 1, 1, 0.22]
  );
  const scale = useTransform(
    scrollYProgress,
    [0.18, 0.42, 0.58, 0.82],
    prefersReducedMotion ? [1, 1, 1, 1] : [0.91, 1, 1, 0.91]
  );

  // Notify parent container when this feature enters central focus
  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    if (latest >= 0.32 && latest <= 0.68) {
      onActivate(index);
    }
  });

  return (
    <div
      ref={itemRef}
      id={`story-item-${index}`}
      className="relative w-full flex flex-col items-center justify-center py-8 sm:py-16 md:py-24"
    >
      {/* Visual illustration stage with smooth scroll-driven activation */}
      <motion.div
        style={{ opacity, scale }}
        className="relative w-full max-w-[540px] aspect-[16/9] flex items-center justify-center will-change-transform"
      >
        {/* Subtle grounding ambient shadow */}
        <div className="absolute bottom-2 inset-x-12 h-6 rounded-full bg-[#12382E]/6 blur-xl pointer-events-none" />

        {/* ChromaKey WebGL Canvas removing green background */}
        <ChromaKeyVideo
          src={feature.video}
          threshold={0.16}
          smoothing={0.10}
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          ariaLabel={feature.heading}
          className="w-full h-full object-contain filter drop-shadow-[0_12px_28px_rgba(18,56,46,0.06)]"
        />
      </motion.div>

      {/* Mobile-only inline text display: visible when stacked on smaller screens */}
      <motion.div
        style={{ opacity }}
        className="block lg:hidden w-full max-w-md mx-auto text-center mt-6 px-4 space-y-2.5"
      >
        <span className="inline-block text-[11px] font-mono font-bold tracking-widest text-[#2D7A5C] bg-[#DCEFE3] px-2.5 py-0.5 rounded-full">
          {feature.index}
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-[#12382E] tracking-tight leading-tight uppercase">
          {feature.heading}
        </h3>
        <p className="text-sm sm:text-base leading-relaxed text-[#3B4953]/85 font-normal">
          {feature.description}
        </p>
      </motion.div>
    </div>
  );
});

StoryIllustrationItem.displayName = 'StoryIllustrationItem';

export const StoryFeaturesSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const handleActivate = useCallback((idx: number) => {
    setActiveIndex((prev) => (prev === idx ? prev : idx));
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const onChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const activeFeature = STORY_FEATURES[activeIndex] || STORY_FEATURES[0];

  return (
    <section
      ref={sectionRef}
      id="story-features"
      className="relative w-full bg-[#F4F5EE] py-20 sm:py-28 md:py-36 overflow-clip select-none"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-16">
          
          {/* =========================================================================
              LEFT: 4 illustrations vertically, one below another
              Initially faint (opacity ~0.2, scale ~0.91), only active one reaches 1.0
              ========================================================================= */}
          <div className="w-full lg:w-7/12 flex flex-col space-y-12 sm:space-y-20 lg:space-y-28">
            {STORY_FEATURES.map((feature, idx) => (
              <StoryIllustrationItem
                key={feature.id}
                feature={feature}
                index={idx}
                onActivate={handleActivate}
                prefersReducedMotion={prefersReducedMotion}
              />
            ))}
          </div>

          {/* =========================================================================
              RIGHT: Sticky text area (Desktop)
              Remains pinned as user scrolls through the 4 illustrations
              Smoothly transitions to match the active illustration
              ========================================================================= */}
          <div className="hidden lg:block w-full lg:w-5/12 lg:sticky lg:top-36 lg:self-start py-8">
            <div className="space-y-8 pr-4">
              
              {/* 4-Step Chapter Indicator Bar */}
              <div className="flex items-center gap-2">
                {STORY_FEATURES.map((f, i) => (
                  <div
                    key={`bar-${f.id}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeIndex
                        ? 'w-10 bg-[#2D7A5C]'
                        : 'w-4 bg-[#DCEFE3]'
                    }`}
                  />
                ))}
                <span className="ml-3 text-[11px] font-mono font-bold tracking-widest text-[#2D7A5C]">
                  {activeFeature.index} / 04
                </span>
              </div>

              {/* Dynamic Text Stage: Headings and description cross-fade smoothly */}
              <div className="relative min-h-[220px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="space-y-4"
                  >
                    <h2 className="text-3xl sm:text-4xl xl:text-[2.6rem] font-black text-[#12382E] tracking-tight leading-[1.08] uppercase">
                      {activeFeature.heading}
                    </h2>
                    <p className="text-base sm:text-lg leading-relaxed text-[#3B4953]/85 font-normal">
                      {activeFeature.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Editorial Outline List: Shows full story progression */}
              <div className="pt-6 border-t border-[#12382E]/10 space-y-3">
                {STORY_FEATURES.map((feat, idx) => {
                  const isCur = idx === activeIndex;
                  return (
                    <div
                      key={`list-${feat.id}`}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        isCur
                          ? 'opacity-100 translate-x-1 text-[#12382E]'
                          : 'opacity-35 text-[#3B4953]'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isCur ? 'bg-[#2D7A5C]' : 'bg-[#3B4953]/30'}`} />
                      <span className={`text-xs font-mono tracking-wider uppercase ${isCur ? 'font-bold' : 'font-medium'}`}>
                        {feat.index} • {feat.heading}
                      </span>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
