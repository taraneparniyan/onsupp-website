"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

type ScrollRevealAnimation =
  | "slideUp"
  | "fadeIn"
  | "scaleUp"
  | "blur"
  | "maskUp"
  | "slideRight"
  | "slideLeft";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  animation?: ScrollRevealAnimation;
  variants?: Variants;
  staggerChildren?: number;
  viewportMargin?: string;
  amount?: number | "some" | "all";
  once?: boolean;
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.55,
  yOffset = 20,
  animation = "slideUp",
  variants,
  staggerChildren,
  viewportMargin = "-50px",
  amount,
  once = true,
}: ScrollRevealProps) {
  const [mounted, setMounted] = React.useState(false);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (mounted && shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getAnimationVariants = (): Variants => {
    const transition = {
      duration,
      delay,
      ease: EASE_PREMIUM,
      ...(staggerChildren ? { staggerChildren, delayChildren: delay } : {}),
    };

    switch (animation) {
      case "fadeIn":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition },
        };
      case "scaleUp":
        return {
          hidden: { opacity: 0, scale: 0.94 },
          visible: { opacity: 1, scale: 1, transition },
        };
      case "blur":
        return {
          hidden: { opacity: 0, filter: "blur(8px)", y: yOffset },
          visible: { opacity: 1, filter: "blur(0px)", y: 0, transition },
        };
      case "maskUp":
        return {
          hidden: { opacity: 0, clipPath: "inset(0% 0% 16% 0%)", y: yOffset },
          visible: { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", y: 0, transition: { ...transition, duration: Math.max(duration, 0.7) } },
        };
      case "slideRight":
        return {
          hidden: { opacity: 0, x: -28 },
          visible: { opacity: 1, x: 0, transition },
        };
      case "slideLeft":
        return {
          hidden: { opacity: 0, x: 28 },
          visible: { opacity: 1, x: 0, transition },
        };
      case "slideUp":
      default:
        return {
          hidden: { opacity: 0, y: yOffset },
          visible: { opacity: 1, y: 0, transition },
        };
    }
  };

  return (
    <motion.div
      suppressHydrationWarning
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin, ...(amount !== undefined ? { amount } : {}) }}
      variants={variants || getAnimationVariants()}
      className={className}
    >
      {children}
    </motion.div>
  );
}
