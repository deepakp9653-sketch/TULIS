/**
 * TULIS Hero Motion Configuration & Animation Easing Utilities
 * Centralized configuration to prevent random magic numbers and ensure physical coherence.
 */

export const HERO_COLORS = {
  cream: '#E6E9B8',
  sage: '#90AB8B',
  deepSage: '#5A7863',
  darkSlate: '#3B4953',
} as const;

/** Configurable Multi-Plane Parallax Speeds (far = subtle, near = strong) */
export const PARALLAX_SPEEDS = {
  sun: 0.08,
  backClouds: 0.15,
  backMountains: 0.20,
  middleClouds: 0.30,
  route: 0.40,
  frontMountains: 0.45,
  frontCloud: 0.50,
  trees: 0.70,
  rocks: 0.90,
  foreground: 1.00,
} as const;

/** Base physical travel distances for parallax calculations */
export const BASE_PARALLAX = {
  /** Base vertical translation distance for full scroll range */
  travelY: 260,
  /** Base mouse offset multiplier */
  mouseStrength: 8,
} as const;

export const HERO_CONFIG = {
  /** Total scroll distance in pixels to complete the 0 -> 1 transformation */
  scrollDistanceDesktop: 800,
  scrollDistanceMobile: 620,

  /** Logo transformation values */
  logo: {
    startScale: 1.25,
    endScaleDesktop: 0.22,
    endScaleMobile: 0.26,
    startTopPercent: 39, // Dominant focal point around 38-40% from top
  },

  /** Clouds horizontal & vertical displacement */
  clouds: {
    cloud1X: -260,
    cloud2X: 200,
    cloud3X: -120,
  },

  /** Mountains transformation */
  mountains: {
    backScale: 0.96,
    frontScale: 1.04,
  },

  /** Travel objects */
  objects: {
    compassRotate: 85,
  },

  /** Airplane trajectory */
  airplane: {
    endX: 260,
    endY: 20,
  },

  /** Header emergence timing */
  header: {
    emergeStartProgress: 0.32,
    emergeEndProgress: 0.65,
  },

  /** Digital workspace card emergence */
  workspace: {
    unfoldStartProgress: 0.36,
    unfoldEndProgress: 0.78,
  },
};

/** Easing functions for natural physical interpolation */
export const Easing = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutSine: (t: number) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
};

/** Clamp value between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Interpolate with custom easing and clamped progress */
export function interpolate(
  progress: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easingFn: (t: number) => number = Easing.linear
): number {
  const [inMin, inMax] = inputRange;
  const [outMin, outMax] = outputRange;

  if (progress <= inMin) return outMin;
  if (progress >= inMax) return outMax;

  const normalized = (progress - inMin) / (inMax - inMin);
  const eased = easingFn(clamp(normalized, 0, 1));
  return outMin + (outMax - outMin) * eased;
}
