"use client";

import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  variants?: Variants;
  staggerChildren?: number;
  viewportMargin?: string;
  once?: boolean;
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  yOffset = 20,
  variants,
  staggerChildren,
  viewportMargin = "-50px",
  once = true,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const defaultVariants: Variants = {
    hidden: {
      opacity: 0,
      y: yOffset,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        delay,
        ease: EASE_PREMIUM,
        ...(staggerChildren ? { staggerChildren, delayChildren: delay } : {}),
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      variants={variants || defaultVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
