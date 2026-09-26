'use client';

import React, { useEffect, useState, useRef } from 'react';

export const TulisCursor: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isHoveredRef = useRef(false);
  const isVisibleRef = useRef(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || reducedMotion) return;

    setMounted(true);

    const onMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Check if hovering an interactive element - only update state if changed
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = !!target.closest('button, a, input, select, textarea, [data-cursor="pointer"], [role="button"]');
        if (isHoveredRef.current !== interactive) {
          isHoveredRef.current = interactive;
          setIsHovered(interactive);
        }
      }
    };

    const onMouseDown = () => setIsPressed(true);
    const onMouseUp = () => setIsPressed(false);
    const onMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth physics loop for the trailing ring
    const loop = () => {
      // Immediate response for dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${targetPos.current.x}px, ${targetPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Damped lag for outer ring
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.18;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(loop);
    };

    rafId.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-[100] transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Outer Damped Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border transition-all duration-150 ease-out will-change-transform ${
          isHovered
            ? 'scale-150 border-[#5A7863] bg-[#90AB8B]/20 shadow-[0_0_12px_rgba(90,120,99,0.25)]'
            : isPressed
            ? 'scale-90 border-[#3B4953]/60 bg-transparent'
            : 'scale-100 border-[#3B4953]/35 bg-transparent'
        }`}
      />

      {/* Inner Precision Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full bg-[#5A7863] transition-transform duration-100 ease-out will-change-transform ${
          isPressed ? 'scale-75' : isHovered ? 'scale-125 bg-[#3B4953]' : 'scale-100'
        }`}
      />
    </div>
  );
};
