'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX } from './motion-config';

export const NatureLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Configured gentle parallax speeds
  const treeMouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.trees;
  const rockMouse = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.rocks;

  // Parallax offsets for foliage: anchored naturally at the base
  const natureY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -18], Easing.easeOutCubic);
  const natureOpacity = 1;

  // Independent Parallax for the 4 Rocks
  const r1X = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -15], Easing.easeOutCubic) + mouseOffset.x * rockMouse;
  const r1Y = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.y * (rockMouse * 1.1);

  const r2X = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.x * (rockMouse * 0.8);
  const r2Y = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -8], Easing.easeOutCubic) + mouseOffset.y * (rockMouse * 0.9);

  const r3X = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 12], Easing.easeOutCubic) + mouseOffset.x * (rockMouse * 0.8);
  const r3Y = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -9], Easing.easeOutCubic) + mouseOffset.y * (rockMouse * 0.9);

  const r4X = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 18], Easing.easeOutCubic) + mouseOffset.x * rockMouse;
  const r4Y = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.y * (rockMouse * 1.1);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Large Tree framing left edge */}
      <div
        className="absolute bottom-[2%] left-[1%] sm:left-[3%] w-[120px] sm:w-[170px] lg:w-[210px] aspect-[544/1173] will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 6}px, ${natureY + mouseOffset.y * 7}px, 0)`,
          opacity: natureOpacity,
          zIndex: 8,
        }}
      >
        <Image
          src="/tulis/nature/tree-large.png"
          alt="Tree Large"
          fill
          sizes="210px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Small Tree midground */}
      <div
        className="absolute bottom-[10%] left-[11%] sm:left-[14%] w-[90px] sm:w-[130px] lg:w-[160px] aspect-[716/973] will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 4}px, ${natureY * 0.8 + mouseOffset.y * 5}px, 0)`,
          opacity: natureOpacity,
          zIndex: 8,
        }}
      >
        <Image
          src="/tulis/nature/tree-small.png"
          alt="Tree Small"
          fill
          sizes="160px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Bush foliage left foreground */}
      <div
        className="absolute bottom-[2%] left-[8%] sm:left-[10%] w-[110px] sm:w-[150px] lg:w-[190px] aspect-[1457/741] will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 7}px, ${natureY * 1.1 + mouseOffset.y * 7}px, 0)`,
          opacity: natureOpacity,
          zIndex: 9,
        }}
      >
        <Image
          src="/tulis/nature/bush.png"
          alt="Bush"
          fill
          sizes="190px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Grass foliage right foreground */}
      <div
        className="absolute bottom-[2%] right-[12%] sm:right-[15%] w-[120px] sm:w-[170px] lg:w-[210px] aspect-[930/976] will-change-transform"
        style={{
          transform: `translate3d(${mouseOffset.x * 7}px, ${natureY * 1.1 + mouseOffset.y * 7}px, 0)`,
          opacity: natureOpacity,
          zIndex: 9,
        }}
      >
        <Image
          src="/tulis/nature/grass.png"
          alt="Grass"
          fill
          sizes="210px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Rock 01 (Independent DOM element: bottom-left foreground) */}
      <div
        className="absolute bottom-[1%] left-[2%] sm:left-[4%] w-[70px] sm:w-[100px] lg:w-[125px] aspect-[487/423] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${r1X}px, ${r1Y}px, 0)`,
          opacity: natureOpacity,
          zIndex: 10,
        }}
      >
        <Image
          src="/tulis/nature/rock-01.png"
          alt="Rock 1"
          fill
          sizes="125px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Rock 02 (Independent DOM element: mid-left) */}
      <div
        className="absolute bottom-[3%] left-[17%] sm:left-[21%] w-[65px] sm:w-[95px] lg:w-[120px] aspect-[548/505] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${r2X}px, ${r2Y}px, 0)`,
          opacity: natureOpacity,
          zIndex: 9,
        }}
      >
        <Image
          src="/tulis/nature/rock-02.png"
          alt="Rock 2"
          fill
          sizes="120px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Rock 03 (Independent DOM element: mid-right) */}
      <div
        className="absolute bottom-[2%] right-[18%] sm:right-[22%] w-[75px] sm:w-[110px] lg:w-[135px] aspect-[637/318] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${r3X}px, ${r3Y}px, 0)`,
          opacity: natureOpacity,
          zIndex: 9,
        }}
      >
        <Image
          src="/tulis/nature/rock-03.png"
          alt="Rock 3"
          fill
          sizes="135px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* Rock 04 (Independent DOM element: bottom-right foreground) */}
      <div
        className="absolute bottom-[1%] right-[3%] sm:right-[5%] w-[80px] sm:w-[115px] lg:w-[145px] aspect-[552/446] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${r4X}px, ${r4Y}px, 0)`,
          opacity: natureOpacity,
          zIndex: 10,
        }}
      >
        <Image
          src="/tulis/nature/rock-04.png"
          alt="Rock 4"
          fill
          sizes="145px"
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
