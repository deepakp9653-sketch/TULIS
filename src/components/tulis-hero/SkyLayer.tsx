'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX } from './motion-config';

export const SkyLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Configured parallax speed: 0.08 (subtle distant movement)
  const sunTravel = BASE_PARALLAX.travelY * PARALLAX_SPEEDS.sun; // ~21px
  const sunMouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.sun;

  // Parallax and atmospheric drift for the distant sun
  const sunY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -sunTravel], Easing.easeOutQuad) + mouseOffset.y * sunMouse;
  const sunX = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 18], Easing.easeOutQuad) + mouseOffset.x * sunMouse;
  const sunScale = prefersReducedMotion
    ? 1
    : interpolate(progress, [0, 1], [1, 0.88], Easing.easeInOutQuad);
  const sunOpacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.65, 1], [1, 0.2], Easing.easeOutQuad);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
      style={{
        backgroundColor: '#EBF4DD',
        zIndex: 0,
      }}
    >
      {/* Soft atmospheric gradient into horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%] opacity-35"
        style={{
          background: 'linear-gradient(to top, #90AB8B 0%, rgba(235, 244, 221, 0) 100%)',
        }}
      />

      {/* Sun: positioned towards upper-right, distant, atmospheric */}
      <div
        className="absolute top-[8%] right-[14%] sm:right-[18%] w-[160px] sm:w-[220px] lg:w-[260px] aspect-square will-change-transform"
        style={{
          transform: `translate3d(${sunX}px, ${sunY}px, 0) scale(${sunScale})`,
          opacity: sunOpacity,
          mixBlendMode: 'multiply',
          zIndex: 1,
        }}
      >
        <div className="relative w-full h-full animate-sun-drift">
          <Image
            src="/tulis/objects/sun.png"
            alt="Sun"
            fill
            sizes="(max-width: 640px) 160px, 260px"
            priority
            className="object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
