// [Task]: T-065
// [From]: plan.md §6.6, Constitution §VIII
// [Reference]: Framer Motion utilities, animation variants, and accessibility hooks

import { useEffect, useState } from 'react'

/**
 * Hook to detect if user prefers reduced motion
 * Returns true if user has enabled prefers-reduced-motion in system settings
 * Used to instantly display animations without delays for accessibility
 *
 * Ref: Constitution §VIII (Accessibility in Modern Design)
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check media query on mount
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Animation variants for Framer Motion components
 * Per Constitution §VIII: Motion & Interaction Principles
 */

// Floating Card Animation (1.5s loop, Y-axis oscillation)
export const floatingCardVariants = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

// Reduced Motion Variant (instant, no animation)
export const reducedMotionFloatingCard = {
  animate: {
    y: 0,
    transition: { duration: 0 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0 },
  },
}

// Button Hover/Tap Animations (Spring Physics: stiffness 300, damping 30)
export const buttonInteractionVariants = {
  whileHover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  whileTap: {
    scale: 0.95,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Reduced Motion Button Variant
export const reducedMotionButton = {
  whileHover: {
    scale: 1,
    transition: { duration: 0 },
  },
  whileTap: {
    scale: 1,
    transition: { duration: 0 },
  },
}

// Card Hover Animation (Shadow and Scale)
export const cardHoverVariants = {
  whileHover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  whileTap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
}

// Reduced Motion Card Variant
export const reducedMotionCard = {
  whileHover: {
    scale: 1,
    transition: { duration: 0 },
  },
  whileTap: {
    scale: 1,
    transition: { duration: 0 },
  },
}

// SVG Path Draw-In Animation (500ms, cubic-bezier easing)
export const svgDrawInVariants = {
  initial: { pathLength: 0, opacity: 0 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1], // cubic-bezier for smooth acceleration
    },
  },
}

// Reduced Motion SVG Variant
export const reducedMotionSvg = {
  initial: { pathLength: 1, opacity: 1 },
  animate: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0 },
  },
}

// Page Entry Animation (Fade + Translate Y)
export const pageEnterVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
}

// Reduced Motion Page Variant
export const reducedMotionPageEnter = {
  initial: {
    opacity: 1,
    y: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0 },
  },
  exit: {
    opacity: 1,
    transition: { duration: 0 },
  },
}

// Animation Timing Configuration
export const animationConfig = {
  spring: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  transition: {
    duration: {
      fast: 0.15,
      normal: 0.2,
      slow: 0.5,
    },
  },
}

/**
 * Helper function to get variants based on motion preference
 * Use this to conditionally return variants depending on user accessibility settings
 */
export const getMotionVariants = (
  standard: any,
  reduced: any,
  prefersReducedMotion: boolean
) => {
  return prefersReducedMotion ? reduced : standard
}

/**
 * Helper to safely use animation config
 * Returns instant animation config if reduced motion is preferred
 */
export const getSafeAnimationConfig = (prefersReducedMotion: boolean) => {
  return prefersReducedMotion
    ? { duration: 0, delay: 0 }
    : animationConfig
}
