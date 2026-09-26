'use client';

import { useState, useEffect, useRef } from 'react';
import { ScrollProgressState } from './types';
import { HERO_CONFIG, clamp } from './motion-config';

interface UseHeroScrollOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useHeroScroll({ containerRef }: UseHeroScrollOptions): ScrollProgressState {
  const [state, setState] = useState<ScrollProgressState>({
    progress: 0,
    scrollY: 0,
    phase: 1,
    mouseOffset: { x: 0, y: 0 },
    prefersReducedMotion: false,
  });

  const targetMouseRef = useRef({ x: 0, y: 0 });
  const currentMouseRef = useRef({ x: 0, y: 0 });
  const isHeroPastRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // 1. Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      setState((prev) => ({ ...prev, prefersReducedMotion: mediaQuery.matches }));
    };
    updateReducedMotion();
    mediaQuery.addEventListener('change', updateReducedMotion);

    // 2. Centralized scroll calculation
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const containerTop = rect.top;
      const scrollDistance =
        window.innerWidth < 768
          ? HERO_CONFIG.scrollDistanceMobile
          : HERO_CONFIG.scrollDistanceDesktop;

      // When containerTop is 0, progress is 0.
      // As container scrolls up (containerTop becomes negative), progress approaches 1.
      const rawProgress = -containerTop / scrollDistance;
      const progress = clamp(rawProgress, 0, 1);

      // If user has scrolled well past the hero and state is already settled, bail early
      if (progress >= 1 && isHeroPastRef.current) {
        return;
      }
      if (progress >= 1) {
        isHeroPastRef.current = true;
      } else {
        isHeroPastRef.current = false;
      }

      let phase: 1 | 2 | 3 | 4 | 5 = 1;
      if (progress < 0.15) phase = 1;
      else if (progress < 0.35) phase = 2;
      else if (progress < 0.55) phase = 3;
      else if (progress < 0.75) phase = 4;
      else phase = 5;

      setState((prev) => {
        // Prevent redundant state updates if progress delta is negligible
        if (Math.abs(prev.progress - progress) < 0.001 && prev.phase === phase) {
          return prev;
        }
        return {
          ...prev,
          progress,
          scrollY: window.scrollY,
          phase,
        };
      });
    };

    // 3. Subtle mouse interaction on desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (isHeroPastRef.current) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1
      targetMouseRef.current = { x: nx, y: ny };
    };

    // 4. Smooth interpolation loop for mouse parallax - only update state when values shift
    const tick = () => {
      if (!isHeroPastRef.current) {
        const dx = targetMouseRef.current.x - currentMouseRef.current.x;
        const dy = targetMouseRef.current.y - currentMouseRef.current.y;

        if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
          currentMouseRef.current.x += dx * 0.05;
          currentMouseRef.current.y += dy * 0.05;

          setState((prev) => ({
            ...prev,
            mouseOffset: {
              x: currentMouseRef.current.x,
              y: currentMouseRef.current.y,
            },
          }));
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    handleScroll();
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      mediaQuery.removeEventListener('change', updateReducedMotion);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [containerRef]);

  return state;
}
