'use client';

import React from 'react';
import Image from 'next/image';
import { LayerProps } from './types';
import { interpolate, Easing, PARALLAX_SPEEDS, BASE_PARALLAX } from './motion-config';

// Clutter reduction: temporarily hidden from initial composition to create a clean, spacious scene.
// All assets (travel route ribbon, waypoint, location pin, destination markers) are preserved intact.
const SHOW_TRAVEL_ROUTE = false;

export const RouteLayer: React.FC<LayerProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
}) => {
  // Configured parallax speed 0.40
  const routeTravel = BASE_PARALLAX.travelY * PARALLAX_SPEEDS.route; // ~104px
  const mouseStr = BASE_PARALLAX.mouseStrength * PARALLAX_SPEEDS.route;

  // Travel route shifts and scales gently
  const routeY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, routeTravel], Easing.easeOutCubic) + mouseOffset.y * mouseStr;
  const routeScale = prefersReducedMotion
    ? 1
    : interpolate(progress, [0, 1], [1, 0.95], Easing.easeInOutQuad);
  const routeOpacity = prefersReducedMotion
    ? 1
    : interpolate(progress, [0.6, 1], [0.95, 0.25], Easing.easeOutQuad);

  // Markers move inward toward the center interface as scroll progresses
  // 1. Waypoint (near start of route)
  const wpX = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 80], Easing.easeOutCubic) + mouseOffset.x * 3;
  const wpY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 30], Easing.easeOutCubic);

  // 2. Location Pin (first scenic waypoint)
  const pinX = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 50], Easing.easeOutCubic) + mouseOffset.x * 4;
  const pinY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 20], Easing.easeOutCubic);

  // 3. Destination Marker (mid-route milestone)
  const destX = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -40], Easing.easeOutCubic) + mouseOffset.x * 4;
  const destY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 25], Easing.easeOutCubic);

  // 4. Destination Flag (final summit / goal)
  const flagX = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, -70], Easing.easeOutCubic) + mouseOffset.x * 3;
  const flagY = prefersReducedMotion
    ? 0
    : interpolate(progress, [0, 1], [0, 15], Easing.easeOutCubic);

  if (!SHOW_TRAVEL_ROUTE) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* Travel Route ribbon spanning across the landscape */}
      <div
        className="absolute bottom-[16%] sm:bottom-[18%] left-1/2 w-[85vw] max-w-[1000px] aspect-[2261/828] will-change-transform"
        style={{
          transform: `translate3d(calc(-50% + ${mouseOffset.x * 4}px), ${routeY}px, 0) scale(${routeScale})`,
          opacity: routeOpacity,
          zIndex: 6,
        }}
      >
        <Image
          src="/tulis/travel/travel-route.png"
          alt="Travel Route"
          fill
          sizes="(max-width: 768px) 90vw, 1000px"
          priority
          className="object-contain pointer-events-none"
        />

        {/* Marker 1: Waypoint along the route */}
        <div
          className="absolute left-[12%] top-[52%] w-[28px] sm:w-[36px] aspect-[576/578] will-change-transform filter drop-shadow-sm"
          style={{ transform: `translate3d(${wpX}px, ${wpY}px, 0)` }}
        >
          <Image
            src="/tulis/travel/waypoint.png"
            alt="Waypoint"
            fill
            sizes="36px"
            className="object-contain pointer-events-none"
          />
        </div>

        {/* Marker 2: Location Pin */}
        <div
          className="absolute left-[32%] top-[12%] w-[32px] sm:w-[42px] aspect-[642/870] will-change-transform filter drop-shadow-sm"
          style={{ transform: `translate3d(${pinX}px, ${pinY}px, 0)` }}
        >
          <Image
            src="/tulis/travel/location-pin.png"
            alt="Location Pin"
            fill
            sizes="42px"
            className="object-contain pointer-events-none animate-bounce"
            style={{ animationDuration: '3.5s' }}
          />
        </div>

        {/* Marker 3: Destination Marker */}
        <div
          className="absolute right-[34%] top-[42%] w-[34px] sm:w-[44px] aspect-[814/991] will-change-transform filter drop-shadow-sm"
          style={{ transform: `translate3d(${destX}px, ${destY}px, 0)` }}
        >
          <Image
            src="/tulis/travel/destination-marker.png"
            alt="Destination Marker"
            fill
            sizes="44px"
            className="object-contain pointer-events-none"
          />
        </div>

        {/* Marker 4: Destination Flag */}
        <div
          className="absolute right-[10%] top-[24%] w-[32px] sm:w-[40px] aspect-[544/812] will-change-transform filter drop-shadow-sm"
          style={{ transform: `translate3d(${flagX}px, ${flagY}px, 0)` }}
        >
          <Image
            src="/tulis/travel/destination-flag.png"
            alt="Destination Flag"
            fill
            sizes="40px"
            className="object-contain pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};
