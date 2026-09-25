import { useReducedMotion } from 'framer-motion';

// ============================================================================
// TULIS DESIGN SYSTEM — MOTION TOKENS & VARIANTS
// Calibrated for 60fps performance, accessibility, and clean feel.
// ============================================================================

export const MOTION_TOKENS = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.4,
  },
  easing: {
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeInOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  },
  spring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  stagger: {
    base: 0.05,
    cap: 8,
  },
};

// Reusable Framer Motion Variants
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.duration.base,
      ease: MOTION_TOKENS.easing.easeOut,
    },
  },
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: MOTION_TOKENS.duration.base,
      ease: MOTION_TOKENS.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: MOTION_TOKENS.duration.fast,
    },
  },
};

export const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: MOTION_TOKENS.duration.base,
      ease: MOTION_TOKENS.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: MOTION_TOKENS.duration.fast,
    },
  },
};

export const slideInLeftVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: MOTION_TOKENS.duration.base,
      ease: MOTION_TOKENS.easing.easeOut,
    },
  },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: MOTION_TOKENS.duration.base,
      ease: MOTION_TOKENS.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 0,
    paddingBottom: 0,
    transition: {
      duration: MOTION_TOKENS.duration.fast,
      ease: MOTION_TOKENS.easing.easeInOut,
    },
  },
};

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: MOTION_TOKENS.duration.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: MOTION_TOKENS.duration.fast },
  },
};

export const modalPanelVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MOTION_TOKENS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: MOTION_TOKENS.duration.fast },
  },
};

export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: MOTION_TOKENS.stagger.base,
      delayChildren: 0.02,
    },
  },
};

export const formErrorShakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};

// Custom Hook to respect prefers-reduced-motion cleanly across all components
export function useMotionConfig() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return {
      shouldReduceMotion: true,
      fadeUp: fadeInVariants,
      scaleIn: fadeInVariants,
      slideInLeft: fadeInVariants,
      listItem: fadeInVariants,
      staggerContainer: fadeInVariants,
      spring: { duration: MOTION_TOKENS.duration.base },
    };
  }

  return {
    shouldReduceMotion: false,
    fadeUp: fadeUpVariants,
    scaleIn: scaleInVariants,
    slideInLeft: slideInLeftVariants,
    listItem: listItemVariants,
    staggerContainer: staggerContainerVariants,
    spring: MOTION_TOKENS.spring,
  };
}
