'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX, HERO_CONFIG } from './motion-config';

export const CloudLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Configured parallax speeds:
  // Back clouds: 0.15
  // Middle clouds: 0.30
  // Front cloud: 0.50
  const c3Travel = BASE_PARALLAX.travelY * PARALLAX_SPEEDS.backClouds; // ~39px
  const c3Mouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.backClouds;

  const c2Travel = BASE_PARALLAX.travelY * PARALLAX_SPEEDS.middleClouds; // ~78px
  const c2Mouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.middleClouds;

  const c1Travel = BASE_PARALLAX.travelY * PARALLAX_SPEEDS.frontCloud; // ~130px
  const c1Mouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.frontCloud;

  // Cloud 03: Small distant cloud (far background, slow horizontal drift left)
  const c3X = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, HERO_CONFIG.clouds.cloud3X], Easing.easeOutCubic) + mouseOffset.x * c3Mouse;
  const c3Y = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -c3Travel], Easing.easeOutQuad) + mouseOffset.y * c3Mouse;
  const c3Opacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.4, 0.95], [0.85, 0.1], Easing.easeOutQuad);

  // Cloud 02: Medium midground cloud (drifts right)
  const c2X = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, HERO_CONFIG.clouds.cloud2X], Easing.easeOutCubic) + mouseOffset.x * c2Mouse;
  const c2Y = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -c2Travel], Easing.easeOutQuad) + mouseOffset.y * c2Mouse;
  const c2Opacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.35, 0.9], [0.9, 0.05], Easing.easeOutQuad);

  // Cloud 01: Large foreground cloud (drifts left and outward)
  const c1X = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, HERO_CONFIG.clouds.cloud1X], Easing.easeOutCubic) + mouseOffset.x * c1Mouse;
  const c1Y = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -c1Travel], Easing.easeOutQuad) + mouseOffset.y * c1Mouse;
  const c1Opacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.3, 0.85], [0.95, 0], Easing.easeOutQuad);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Cloud 03 - Small Distant Cloud */}
      <div
        className="absolute top-[12%] left-[10%] sm:left-[14%] w-[160px] sm:w-[220px] aspect-[1988/837] will-change-transform"
        style={{
          transform: `translate3d(${c3X}px, ${c3Y}px, 0)`,
          opacity: c3Opacity,
          zIndex: 2,
        }}
      >
        <div className="relative w-full h-full animate-cloud-drift-slow">
          <Image
            src="/tulis/clouds/cloud-03.png"
            alt="Distant Cloud"
            fill
            sizes="220px"
            priority
            className="object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Cloud 02 - Medium Cloud */}
      <div
        className="absolute top-[20%] right-[4%] sm:right-[10%] w-[200px] sm:w-[300px] aspect-[1754/684] will-change-transform"
        style={{
          transform: `translate3d(${c2X}px, ${c2Y}px, 0)`,
          opacity: c2Opacity,
          zIndex: 3,
        }}
      >
        <div className="relative w-full h-full animate-cloud-drift-mid">
          <Image
            src="/tulis/clouds/cloud-02.png"
            alt="Midground Cloud"
            fill
            sizes="300px"
            priority
            className="object-contain pointer-events-none"
          />
        </div>
      </div>

      {/* Cloud 01 - Large Foreground Cloud */}
      <div
        className="absolute top-[26%] -left-[4%] sm:-left-[2%] w-[260px] sm:w-[400px] aspect-[2032/778] will-change-transform"
        style={{
          transform: `translate3d(${c1X}px, ${c1Y}px, 0)`,
          opacity: c1Opacity,
          zIndex: 4,
        }}
      >
        <div className="relative w-full h-full animate-cloud-drift-fast">
          <Image
            src="/tulis/clouds/cloud-01.png"
            alt="Foreground Cloud"
            fill
            sizes="400px"
            priority
            className="object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
