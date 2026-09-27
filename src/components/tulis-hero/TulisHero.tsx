'use client';

import React, { useRef } from 'react';
import { TulisHeroProps } from './types';
import { useHeroScroll } from './useHeroScroll';
import { HeroScene } from './HeroScene';
import { HeroLogo } from './HeroLogo';
import { TulisHeader } from './TulisHeader';
import { ChevronDown } from 'lucide-react';

export const TulisHero: React.FC<TulisHeroProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress, mouseOffset, prefersReducedMotion } = useHeroScroll({ containerRef });

  // Scroll prompt indicator at 0px (fades out gracefully by progress 0.12)
  const scrollIndicatorOpacity = Math.max(0, 1 - progress * 8);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh+620px)] md:h-[calc(100vh+800px)]"
      style={{
        backgroundColor: '#E6E9B8',
      }}
    >
      {/* Pinned 100vw x 100vh viewport scene */}
      <div className="sticky top-0 w-full h-screen overflow-hidden select-none">
        {/* Cinematic Header that emerges naturally during the transformation */}
        <TulisHeader
          progress={progress}
          onEnterApp={props.onEnterApp}
          onOpenCreateTrip={props.onOpenCreateTrip}
          onOpenJoinTrip={props.onOpenJoinTrip}
          currentUser={props.currentUser}
          onOpenAuth={props.onOpenAuth}
          onOpenMyTrips={props.onOpenMyTrips}
        />

        {/* Central visual anchor: Large centered logo that flies diagonally into the header */}
        <HeroLogo
          progress={progress}
          mouseOffset={mouseOffset}
          prefersReducedMotion={prefersReducedMotion}
        />

        {/* Layered landscape world and digital workspace transformation */}
        <HeroScene
          progress={progress}
          mouseOffset={mouseOffset}
          prefersReducedMotion={prefersReducedMotion}
          onEnterApp={props.onEnterApp}
          onOpenCreateTrip={props.onOpenCreateTrip}
          onOpenJoinTrip={props.onOpenJoinTrip}
        />

        {/* Scroll invitation prompt at 0px */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none transition-opacity duration-200"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#3B4953]/70">
            Scroll to enter workspace
          </span>
          <ChevronDown className="w-4 h-4 text-[#5A7863] animate-bounce" />
        </div>
      </div>
    </div>
  );
};
