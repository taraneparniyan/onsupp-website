"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isReducedMotion, scrollToSection } from "@/lib/scroll";

/**
 * Root client controller that establishes the unified smooth-scrolling behavior
 * across all public pages and admin panel matching the natural, pleasant admin feel.
 * - 100% native hardware-accelerated scrolling with zero wheel hijacking or latency.
 * - Handles auto-scroll to `#hash` on initial load and route changes.
 * - Dynamically toggles smooth vs instant scrolling based on `prefers-reduced-motion`.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  // Enforce reduced-motion preferences dynamically
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => {
      document.documentElement.style.scrollBehavior = isReducedMotion()
        ? "auto"
        : "smooth";
    };

    handleMotionPreference();
    mediaQuery.addEventListener("change", handleMotionPreference);
    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreference);
    };
  }, []);

  // Handle URL hash navigation on route change
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash;
      const timer = setTimeout(() => {
        scrollToSection(hash, { updateHash: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
