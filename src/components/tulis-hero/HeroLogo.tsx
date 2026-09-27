'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { interpolate, Easing, HERO_CONFIG } from './motion-config';

interface HeroLogoProps {
  progress: number;
  mouseOffset: { x: number; y: number };
  prefersReducedMotion: boolean;
}

export const HeroLogo: React.FC<HeroLogoProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });

  useEffect(() => {
    const updateSize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // 1. Initial State (at progress 0): Dominant focal point centered horizontally at 38–40% top
  const startX = viewport.width * 0.5;
  const startY = viewport.height * (HERO_CONFIG.logo.startTopPercent / 100);

  // 2. Final Target State (docked inside TulisHeader logo slot)
  const isMobile = viewport.width < 768;
  const headerMaxW = 1280;
  const containerLeft = Math.max(0, (viewport.width - headerMaxW) / 2);
  const outerPadding = isMobile ? 16 : 24; // px-4 vs px-6
  const innerPadding = isMobile ? 16 : 24; // px-4 vs px-6
  const slotHalfWidth = isMobile ? 55 : 65; // w-[110px] vs w-[130px]

  // Exact center coordinate of the header's logo slot
  const targetX = containerLeft + outerPadding + innerPadding + slotHalfWidth;
  // Header py-2.5/py-3 + inner py-2.5 + half of 36px slot height
  const targetY = isMobile ? 38 : 40;

  const totalDeltaX = targetX - startX;
  const totalDeltaY = targetY - startY;

  // 3. Movement phases:
  // 0% -> 15%: Logo begins shrinking in place as the dominant anchor
  // 15% -> 40%: Smooth diagonal flight towards navbar slot
  // 40% -> 70%: Settles precisely into compact header as header finishes emergence
  const t = prefersReducedMotion ? (progress > 0.35 ? 1 : 0) : progress;

  // Scale: 1.0 down to ~0.28 (desktop) or ~0.34 (mobile) to match header logo slot perfectly
  const startScale = HERO_CONFIG.logo.startScale || 1.22;
  const endScale = isMobile
    ? HERO_CONFIG.logo.endScaleMobile
    : HERO_CONFIG.logo.endScaleDesktop;

  const scale = prefersReducedMotion
    ? progress > 0.35
      ? endScale
      : startScale
    : interpolate(t, [0, 0.65], [startScale, endScale], Easing.easeInOutQuad);

  // Diagonal flight deltas: starts moving early with smooth physical glide
  const currentDeltaX = prefersReducedMotion
    ? progress > 0.35
      ? totalDeltaX
      : 0
    : interpolate(t, [0.08, 0.65], [0, totalDeltaX], Easing.easeInOutQuad);

  const currentDeltaY = prefersReducedMotion
    ? progress > 0.35
      ? totalDeltaY
      : 0
    : interpolate(t, [0.08, 0.65], [0, totalDeltaY], Easing.easeInOutQuad);

  // Logo remains the steady visual anchor (very subtle mouse influence, no distracting movement)
  const mouseInfluence = Math.max(0, 1 - progress * 3);
  const mouseX = mouseOffset.x * 2.0 * mouseInfluence;
  const mouseY = mouseOffset.y * 1.5 * mouseInfluence;

  // Visual separation depth opacity (fades smoothly as logo ascends to navbar)
  const haloOpacity = Math.max(0, 1 - progress * 2.2);

  return (
    <div
      className="fixed pointer-events-none select-none will-change-transform z-40"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        transform: `translate3d(calc(-50% + ${currentDeltaX + mouseX}px), calc(-50% + ${currentDeltaY + mouseY}px), 0) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Subtle soft ambient depth halo: provides pristine visual separation from mountains/clouds without artificial borders */}
      <div
        className="absolute -inset-16 sm:-inset-24 rounded-full blur-2xl pointer-events-none -z-10 transition-opacity duration-300"
        style={{
          opacity: haloOpacity,
          background:
            'radial-gradient(ellipse 65% 55% at center, rgba(230, 233, 184, 0.96) 0%, rgba(230, 233, 184, 0.72) 42%, rgba(230, 233, 184, 0) 80%)',
        }}
      />

      {/* Hero Logo: dominant 360-460px size on desktop */}
      <div className="relative w-[320px] sm:w-[380px] md:w-[440px] lg:w-[460px] aspect-[2400/919] filter drop-shadow-[0_12px_28px_rgba(59,73,83,0.14)] transition-all">
        <Image
          src="/tulis/logo/tulis-logo.png"
          alt="TULIS"
          fill
          priority
          sizes="(max-width: 640px) 320px, (max-width: 1024px) 380px, 460px"
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
