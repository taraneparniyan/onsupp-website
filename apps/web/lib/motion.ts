import { type Variants, type Transition } from "framer-motion";

// ─── Standard Brand Easing Curves ───────────────────────────────────────────
// Apple / Vercel grade premium curves: quick initial response with graceful deceleration
export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;
export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;
export const EASE_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

// ─── Viewport Entrance Variants ─────────────────────────────────────────────

/**
 * Standard subtle upward fade-in for section headers and standalone elements
 */
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay,
      ease: EASE_PREMIUM,
    },
  }),
};

/**
 * Soft fade in without directional displacement
 */
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.5,
      delay,
      ease: EASE_PREMIUM,
    },
  }),
};

// ─── Staggered Group Variants ────────────────────────────────────────────────

/**
 * Container variant that orchestrates staggered reveals of its children
 */
export const staggerContainer: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: (staggerDelay = 0.08) => ({
    opacity: 1,
    transition: {
      staggerChildren: typeof staggerDelay === "number" ? staggerDelay : 0.08,
      delayChildren: 0.04,
    },
  }),
};

/**
 * Child item variant for use inside a staggerContainer
 */
export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: EASE_PREMIUM,
    },
  },
};

// ─── Services Section Specialized Variants ───────────────────────────────────

/**
 * Directional slide and wave cascade for Services slide changes
 */
export const serviceSlideContainer: Variants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? 40 : -40,
  }),
  center: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: EASE_PREMIUM,
      when: "beforeChildren",
      staggerChildren: 0.07,
    },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -40 : 40,
    transition: {
      duration: 0.25,
      ease: EASE_PREMIUM,
    },
  }),
};

export const serviceCardItem: Variants = {
  enter: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: EASE_PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: EASE_PREMIUM,
    },
  },
};

// ─── Reusable Hover & Tap Interactive Presets ────────────────────────────────

export const hoverLift = {
  y: -4,
  transition: {
    duration: 0.25,
    ease: EASE_PREMIUM,
  },
};

export const hoverSubtleLift = {
  y: -2,
  scale: 1.01,
  transition: {
    duration: 0.25,
    ease: EASE_PREMIUM,
  },
};

export const tapFeedback = {
  scale: 0.96,
  transition: {
    duration: 0.12,
  },
};

export const buttonHover = {
  scale: 1.02,
  transition: {
    duration: 0.2,
    ease: EASE_PREMIUM,
  },
};
