'use client';

import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

interface GlobeProps {
  className?: string;
}

export default function Earth({ className = '' }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  // Group squad locations across continents
  const SQUAD_LOCATIONS = [
    { name: 'San Francisco', location: [37.7749, -122.4194] as [number, number], size: 0.05 },
    { name: 'London', location: [51.5074, -0.1278] as [number, number], size: 0.05 },
    { name: 'Goa', location: [15.2993, 74.1240] as [number, number], size: 0.06 },
    { name: 'Tokyo', location: [35.6762, 139.6503] as [number, number], size: 0.05 },
    { name: 'Rio de Janeiro', location: [-22.9068, -43.1729] as [number, number], size: 0.05 },
  ];

  useEffect(() => {
    let phi = 0;
    let width = 0;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: (width || 380) * 2,
      height: (width || 380) * 2,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.07, 0.09, 0.06], // Deep charcoal-green #12160F
      markerColor: [0.37, 0.66, 0.49], // Solid #5FA97D mint
      glowColor: [0.24, 0.49, 0.35],  // Forest #3E7D5A ambient aura
      markers: SQUAD_LOCATIONS.map((loc) => ({
        location: loc.location,
        size: loc.size,
      })),
    });

    let animId: number;
    const animate = () => {
      if (!pointerInteracting.current) {
        phi += 0.005;
      }
      globe.update({
        phi: phi + pointerInteractionMovement.current,
        width: (width || 380) * 2,
        height: (width || 380) * 2,
      });
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      className={`w-full aspect-square max-w-[380px] sm:max-w-[420px] mx-auto relative flex items-center justify-center select-none ${className}`}
      onPointerDown={(e) => {
        pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
      }}
      onPointerUp={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onPointerOut={() => {
        pointerInteracting.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
      }}
      onMouseMove={(e) => {
        if (pointerInteracting.current !== null) {
          const delta = e.clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.01;
        }
      }}
      onTouchMove={(e) => {
        if (pointerInteracting.current !== null && e.touches[0]) {
          const delta = e.touches[0].clientX - pointerInteracting.current;
          pointerInteractionMovement.current = delta * 0.01;
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab opacity-95 transition-opacity duration-700"
        style={{ width: '100%', height: '100%', contain: 'layout paint size' }}
      />

      {/* Pulsing marker dots overlay for synced squad nodes */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-20"
        viewBox="0 0 400 400"
        fill="none"
      >
        <g className="animate-pulse">
          <circle cx="110" cy="170" r="4" fill="#5FA97D" />
          <circle cx="110" cy="170" r="10" stroke="#5FA97D" strokeWidth="1" strokeOpacity="0.4" />
          
          <circle cx="250" cy="150" r="4" fill="#5FA97D" />
          <circle cx="250" cy="150" r="10" stroke="#5FA97D" strokeWidth="1" strokeOpacity="0.4" />
          
          <circle cx="220" cy="260" r="4" fill="#5FA97D" />
          <circle cx="220" cy="260" r="10" stroke="#5FA97D" strokeWidth="1" strokeOpacity="0.4" />

          <circle cx="190" cy="290" r="4" fill="#5FA97D" />
          <circle cx="190" cy="290" r="10" stroke="#5FA97D" strokeWidth="1" strokeOpacity="0.4" />
        </g>
      </svg>
    </div>
  );
}
