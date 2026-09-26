export interface ScrollProgressState {
  /** Normalized scroll progress from 0 (world) to 1 (interface) */
  progress: number;
  /** Raw scrollY in pixels */
  scrollY: number;
  /** Current phase of the transformation (1 to 5) */
  phase: 1 | 2 | 3 | 4 | 5;
  /** Subtle mouse offset [-1, 1] */
  mouseOffset: { x: number; y: number };
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
}

export interface TulisHeroProps {
  onEnterApp: () => void;
  onOpenCreateTrip: () => void;
  onOpenJoinTrip: () => void;
  currentUser?: any;
  onOpenAuth?: () => void;
  onOpenMyTrips?: () => void;
}

export interface LayerProps {
  progress: number;
  mouseOffset: { x: number; y: number };
  prefersReducedMotion: boolean;
}
