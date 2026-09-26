'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX, HERO_CONFIG } from './motion-config';

export const MountainLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Back mountains: Configured parallax
  const backTravel = 28;
  const backY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -backTravel], Easing.easeOutCubic) +
      mouseOffset.y * (BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.backMountains);
  const backScale = prefersReducedMotion
    ? 1
    : interpolate(progress, [0, 1], [1, HERO_CONFIG.mountains.backScale], Easing.easeInOutQuad);
  const backOpacity = 1;

  // Front mountains: Remain anchored at the bottom, gentle grounding parallax
  const frontY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) +
      mouseOffset.y * (BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.frontMountains);
  const frontScale = prefersReducedMotion
    ? 1
    : interpolate(progress, [0, 1], [1, 1.02], Easing.easeOutQuad);
  const frontOpacity = 1;

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Back Mountains (Distant complete silhouette sitting naturally at bottom) */}
      <div
        className="absolute inset-x-0 bottom-0 w-full flex items-end justify-center will-change-transform"
        style={{
          transform: `translate3d(0, ${backY}px, 0) scale(${backScale})`,
          opacity: backOpacity,
          transformOrigin: 'center bottom',
          zIndex: 5,
        }}
      >
        <div className="relative w-full max-w-[2560px]">
          <Image
            src="/tulis/mountains/mountains-back.png"
            alt="Back Mountains"
            width={2400}
            height={1340}
            priority
            sizes="100vw"
            className="w-full h-auto object-contain object-bottom pointer-events-none block"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Front Mountains (Foreground complete silhouette sitting naturally at bottom) */}
      <div
        className="absolute inset-x-0 bottom-0 w-full flex items-end justify-center will-change-transform"
        style={{
          transform: `translate3d(0, ${frontY}px, 0) scale(${frontScale})`,
          opacity: frontOpacity,
          transformOrigin: 'center bottom',
          zIndex: 7,
        }}
      >
        <div className="relative w-full max-w-[2560px]">
          <Image
            src="/tulis/mountains/mountains-front.png"
            alt="Front Mountains"
            width={2400}
            height={1340}
            priority
            sizes="100vw"
            className="w-full h-auto object-contain object-bottom pointer-events-none block"
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>
    </div>
  );
};
