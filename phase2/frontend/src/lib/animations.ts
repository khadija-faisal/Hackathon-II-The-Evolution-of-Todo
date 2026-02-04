// [Task]: T-080
// [From]: plan.md §6.6, Constitution §VIII
// [Reference]: Page transition animations, motion preferences

/**
 * Page Transition Animations (T-080)
 *
 * Provides CSS keyframe animations and utility functions for page entry/exit transitions.
 * Respects prefers-reduced-motion for accessibility.
 *
 * Features:
 * - Page enter: fade in + translate Y 10px → 0px (200ms)
 * - Page exit: fade out (150ms)
 * - Spring physics for smooth motion
 * - Instant display when reduced motion is enabled
 *
 * Reference: Constitution §VIII (Motion & Interaction Principles)
 */

export const pageTransitionStyles = `
  @keyframes pageEnter {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pageExit {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(10px);
    }
  }

  .animate-page-enter {
    animation: pageEnter 0.2s ease-out forwards;
  }

  .animate-page-exit {
    animation: pageExit 0.15s ease-in forwards;
  }

  /* Reduced motion variants */
  @media (prefers-reduced-motion: reduce) {
    .animate-page-enter,
    .animate-page-exit {
      animation: none;
      opacity: 1;
      transform: none;
    }
  }
`

/**
 * Get animation delay based on motion preference
 * Returns 0ms if reduced motion is enabled
 */
export const getTransitionDelay = (prefersReducedMotion: boolean): number => {
  return prefersReducedMotion ? 0 : 200
}

/**
 * Get page enter animation class with motion preference support
 */
export const getPageEnterAnimation = (prefersReducedMotion: boolean): string => {
  return prefersReducedMotion ? '' : 'animate-page-enter'
}

/**
 * Smooth page transition configuration for client-side navigation
 */
export const pageTransitionConfig = {
  enter: {
    duration: 0.2, // 200ms
    ease: 'easeOut',
  },
  exit: {
    duration: 0.15, // 150ms
    ease: 'easeIn',
  },
}

/**
 * Spring physics configuration for button/card interactions
 * Stiffness: 300 (responsive), Damping: 30 (smooth overshoot)
 */
export const springConfig = {
  default: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  bouncy: {
    stiffness: 200,
    damping: 20,
    mass: 1,
  },
  tight: {
    stiffness: 400,
    damping: 40,
    mass: 1,
  },
}

/**
 * Animation timing presets for common interactions
 */
export const timingPresets = {
  fast: 0.15, // 150ms - quick feedback
  normal: 0.2, // 200ms - default transitions
  slow: 0.5, // 500ms - deliberate entrance
}
