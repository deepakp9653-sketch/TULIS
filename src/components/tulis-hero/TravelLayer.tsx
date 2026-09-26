'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing } from './motion-config';

export const TravelLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  const t = prefersReducedMotion ? 0 : progress;

  // Smooth curved flightpath:
  // Starts in upper sky (left: 24%, top: 20%), glides rightward and ascends slightly
  const arcX = interpolate(t, [0, 1], [0, 260], Easing.easeOutQuad);
  const arcY =
    interpolate(t, [0, 0.45], [0, -35], Easing.easeOutQuad) +
    interpolate(t, [0.45, 1], [0, 20], Easing.easeInOutQuad);

  const rotate = interpolate(t, [0, 1], [0, -5]);
  const scale = interpolate(t, [0, 1], [1, 0.88], Easing.easeInOutQuad);

  const planeOpacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.75, 1], [1, 0.25], Easing.easeOutQuad);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <div
        className="absolute top-[18%] left-[22%] sm:left-[26%] w-[130px] sm:w-[180px] lg:w-[220px] aspect-[1444/536] will-change-transform"
        style={{
          transform: `translate3d(${arcX + mouseOffset.x * 5}px, ${arcY + mouseOffset.y * 4}px, 0) scale(${scale}) rotate(${rotate}deg)`,
          opacity: planeOpacity,
          zIndex: 8,
        }}
      >
        <div className="relative w-full h-full animate-airplane-hover">
          <Image
            src="/tulis/travel/airplane.png"
            alt="Airplane"
            fill
            sizes="(max-width: 640px) 130px, 220px"
            priority
            className="object-contain pointer-events-none drop-shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
