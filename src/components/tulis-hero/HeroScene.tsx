'use client';

import React from 'react';
import { LayerProps } from './types';
import { SkyLayer } from './SkyLayer';
import { CloudLayer } from './CloudLayer';
import { MountainLayer } from './MountainLayer';
import { RouteLayer } from './RouteLayer';
import { TravelLayer } from './TravelLayer';
import { NatureLayer } from './NatureLayer';
import { ObjectLayer } from './ObjectLayer';

interface HeroSceneProps extends LayerProps {
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
}

export const HeroScene: React.FC<HeroSceneProps> = ({
  progress,
  mouseOffset,
  prefersReducedMotion,
  onEnterApp,
  onOpenCreateTrip,
  onOpenJoinTrip,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Layer 0 & 1: Sky and Sun */}
      <SkyLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Layer 2, 3, 4: Clouds (Small, Mid, Large) */}
      <CloudLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Layer 5: Back Mountains */}
      <MountainLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Layer 6: Travel Route & Markers */}
      <RouteLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Layer 7: Front Mountains are part of MountainLayer, properly z-indexed */}

      {/* Layer 8: Nature (Trees, Bush, Grass, 4 Independent Parallax Rocks) */}
      <NatureLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Layer 9: Travel Objects (Tent, Campfire with Looping Smoke, Luggage, Camera, Backpack, Signpost, Compass) */}
      <ObjectLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Motion Flight: Airplane following curved path */}
      <TravelLayer
        progress={progress}
        mouseOffset={mouseOffset}
        prefersReducedMotion={prefersReducedMotion}
      />

      {/* Subtle bottom gradient to blend seamlessly into subsequent page sections */}
      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: Math.max(0, (progress - 0.70) * 3.33),
          background: 'linear-gradient(to bottom, rgba(230, 233, 184, 0) 0%, #E6E9B8 100%)',
          zIndex: 25,
        }}
      />
    </div>
  );
};
