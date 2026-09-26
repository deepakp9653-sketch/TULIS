'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX } from './motion-config';

// Clutter reduction: temporarily hidden from initial composition to maintain spacious cinematic feel
// Asset code preserved intact for reintroduction whenever desired.
const SHOW_SIGNPOST = false;

export const ObjectLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Parallax transformations for travel objects (configured foreground speed: 1.00)
  const mouseStr = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.foreground;

  const objOpacity = 1;

  // Tent (lower-left / midground)
  const tentX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.7);
  const tentY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -14], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.75);

  // Campfire + Smoke Anchored Group (lower-left foreground)
  const fireX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.7);
  const fireY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.85);

  // Camera (foreground detail, left side)
  const camX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.85);
  const camY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.9);
  const camRotate = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -4], Easing.easeInOutQuad);

  // Backpack (lower-right foreground)
  const packX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 14], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.9);
  const packY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.95);
  const packRotate = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 4], Easing.easeInOutQuad);

  // Luggage (right midground)
  const lugX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 16], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.8);
  const lugY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.85);
  const lugRotate = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 3], Easing.easeInOutQuad);

  // Signpost (along route, when enabled)
  const signY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -10], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.75);

  // Compass (subtle rotation and translation on scroll)
  const compX = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 10], Easing.easeOutCubic) + mouseOffset.x * (mouseStr * 0.65);
  const compY = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, -12], Easing.easeOutCubic) + mouseOffset.y * (mouseStr * 0.75);
  const compRotate = prefersReducedMotion ? 0 : interpolate(progress, [0, 1], [0, 35], Easing.easeInOutCubic);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* 1. Tent (lower-left / midground) */}
      <div
        className="absolute bottom-[9%] left-[15%] sm:left-[18%] w-[130px] sm:w-[180px] lg:w-[220px] aspect-[1461/899] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${tentX}px, ${tentY}px, 0)`,
          opacity: objOpacity,
          zIndex: 8,
        }}
      >
        <Image
          src="/tulis/camping/tent.png"
          alt="Tent"
          fill
          sizes="220px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* 2. Campfire + Smoke Single Anchored Visual Group */}
      {/* Smoke originates directly above the flame logs and rises naturally without separating on scroll */}
      <div
        className="absolute bottom-[7%] left-[25%] sm:left-[28%] w-[80px] sm:w-[105px] lg:w-[125px] will-change-transform filter drop-shadow-sm pointer-events-none"
        style={{
          transform: `translate3d(${fireX}px, ${fireY}px, 0)`,
          opacity: objOpacity,
          zIndex: 9,
        }}
      >
        <div className="relative w-full flex flex-col items-center">
          {/* Smoke: anchored directly above the fire, rising vertically with subtle drift */}
          <div className="absolute bottom-[66%] left-1/2 -translate-x-1/2 w-[74%] aspect-[693/1186] origin-bottom pointer-events-none">
            <div className="relative w-full h-full animate-smoke-rise origin-bottom">
              <Image
                src="/tulis/camping/campfire-smoke.png"
                alt="Campfire Smoke"
                fill
                sizes="110px"
                className="object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Campfire: Base flame & logs */}
          <div className="relative w-full aspect-[962/1090]">
            <Image
              src="/tulis/camping/campfire.png"
              alt="Campfire"
              fill
              sizes="125px"
              className="object-contain pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Travel Signpost (temporarily hidden to reduce clutter, asset preserved) */}
      {SHOW_SIGNPOST && (
        <div
          className="absolute bottom-[12%] left-[34%] sm:left-[37%] w-[65px] sm:w-[90px] lg:w-[110px] aspect-[823/1173] will-change-transform filter drop-shadow-sm"
          style={{
            transform: `translate3d(${mouseOffset.x * 4}px, ${signY}px, 0)`,
            opacity: objOpacity,
            zIndex: 8,
          }}
        >
          <Image
            src="/tulis/objects/travel-signpost.png"
            alt="Travel Signpost"
            fill
            sizes="110px"
            className="object-contain pointer-events-none"
          />
        </div>
      )}

      {/* 4. Camera (foreground detail, left side) */}
      <div
        className="absolute bottom-[3%] left-[8%] sm:left-[11%] w-[65px] sm:w-[90px] lg:w-[110px] aspect-[1326/1053] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${camX}px, ${camY}px, 0) rotate(${camRotate}deg)`,
          opacity: objOpacity,
          zIndex: 10,
        }}
      >
        <Image
          src="/tulis/objects/camera.png"
          alt="Camera"
          fill
          sizes="110px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* 5. Luggage (right midground) */}
      <div
        className="absolute bottom-[7%] right-[18%] sm:right-[22%] w-[80px] sm:w-[110px] lg:w-[130px] aspect-[627/1091] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${lugX}px, ${lugY}px, 0) rotate(${lugRotate}deg)`,
          opacity: objOpacity,
          zIndex: 9,
        }}
      >
        <Image
          src="/tulis/objects/luggage.png"
          alt="Luggage"
          fill
          sizes="130px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* 6. Backpack (lower-right foreground) */}
      <div
        className="absolute bottom-[4%] right-[10%] sm:right-[13%] w-[70px] sm:w-[95px] lg:w-[120px] aspect-[962/1152] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${packX}px, ${packY}px, 0) rotate(${packRotate}deg)`,
          opacity: objOpacity,
          zIndex: 10,
        }}
      >
        <Image
          src="/tulis/objects/backpack.png"
          alt="Backpack"
          fill
          sizes="120px"
          className="object-contain pointer-events-none"
        />
      </div>

      {/* 7. Compass (storytelling anchor that settles on scroll) */}
      <div
        className="absolute bottom-[11%] right-[28%] sm:right-[32%] w-[65px] sm:w-[85px] lg:w-[105px] aspect-[1156/1156] will-change-transform filter drop-shadow-sm"
        style={{
          transform: `translate3d(${compX}px, ${compY}px, 0) rotate(${compRotate}deg)`,
          opacity: objOpacity,
          zIndex: 8,
        }}
      >
        <Image
          src="/tulis/travel/compass.png"
          alt="Compass"
          fill
          sizes="105px"
          className="object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};
