"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";

interface ScrollableProjectFrameProps {
  src: string;
  alt: string;
  isRtl: boolean;
  className?: string;
  priority?: boolean;
  previewType?: "mobile" | "web" | "platform";
  liveUrl?: string;
}

export default function ScrollableProjectFrame({
  src,
  alt,
  isRtl,
  className = "h-[320px] sm:h-[380px] lg:h-[440px] w-full",
  priority = false,
  previewType = "web",
}: ScrollableProjectFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const [isHovered, setIsHovered] = useState(false);
  const [maxScroll, setMaxScroll] = useState(0);
  const [duration, setDuration] = useState(3.5);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Detect touch device
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsTouchDevice(
        "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    }
  }, []);

  // Compute scroll distance and animation duration based on actual rendered dimensions
  const measureDimensions = useCallback(() => {
    const container = containerRef.current;
    const img = imgRef.current;
    if (!container || !img) return;

    const containerH = container.clientHeight;
    const containerW = container.clientWidth;

    const naturalW = img.naturalWidth || 1200;
    const naturalH = img.naturalHeight || 800;

    if (naturalW === 0 || naturalH === 0) return;

    // Calculate actual height when image width matches container width
    const renderedH = (naturalH / naturalW) * containerW;
    const scrollDist = Math.max(0, Math.round(renderedH - containerH));

    setMaxScroll(scrollDist);

    // Compute proportional duration: ~280px per second, min 2.2s, max 8.5s
    if (scrollDist > 30) {
      const calculatedDuration = Math.max(2.2, Math.min(8.5, scrollDist / 280));
      setDuration(Number(calculatedDuration.toFixed(2)));
    } else {
      setDuration(0);
    }
  }, []);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageLoaded(true);
    measureDimensions();
  };

  // Recalculate on window resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      measureDimensions();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [measureDimensions]);

  const isTall = maxScroll > 40;

  // On hover over the image frame, trigger smooth scroll
  const handleMouseEnter = () => {
    if (!prefersReducedMotion && isTall && !isTouchDevice) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      role="region"
      aria-label={`${alt} - ${isRtl ? "پیش‌نمایش تصویر پروژه" : "Project Preview"}`}
      onFocus={() => {
        if (!prefersReducedMotion && isTall && !isTouchDevice) setIsHovered(true);
      }}
      onBlur={() => setIsHovered(false)}
      className={`group/frame relative w-full overflow-hidden rounded-none select-none border border-[#1F1F1E]/12 dark:border-white/10 bg-[#E7EBE8] dark:bg-[#161918] transition-colors ${
        isTouchDevice && isTall
          ? "overflow-y-auto overscroll-contain no-scrollbar cursor-grab active:cursor-grabbing"
          : "overflow-hidden"
      } ${className}`}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ── Inner Image Wrapper ── */}
      <div
        className="relative w-full"
        style={{
          transform:
            !isTouchDevice && isHovered && isTall && !prefersReducedMotion
              ? `translateY(-${maxScroll}px)`
              : "translateY(0px)",
          transition:
            !isTouchDevice && isTall && !prefersReducedMotion
              ? isHovered
                ? `transform ${duration}s cubic-bezier(0.28, 0.9, 0.45, 1)`
                : "transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)"
              : undefined,
          willChange: isTall ? "transform" : "auto",
        }}
      >
        <Image
          ref={imgRef}
          src={src}
          alt={alt}
          width={1400}
          height={4000}
          priority={priority}
          onLoad={handleImageLoad}
          className="w-full h-auto block object-cover object-top rounded-none"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 45vw"
        />
      </div>

      {/* ── Editorial Top Micro-Header Bar (Minimalist Browser / Device Chrome) ── */}
      <div className="absolute top-0 inset-x-0 h-7 bg-[#1F1F1E]/80 dark:bg-[#121413]/90 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between text-[10px] text-white/70 pointer-events-none z-20">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-none bg-white/20" />
          <span className="w-2 h-2 rounded-none bg-white/20" />
          <span className="w-2 h-2 rounded-none bg-white/20" />
        </div>
        <span className="font-mono text-[9px] tracking-wider text-white/50 uppercase truncate max-w-[140px]">
          {previewType === "mobile" ? "mobile" : "web.onsupp"}
        </span>
        <div className="flex items-center gap-1">
          {isTall && (
            <span className="inline-block w-1.5 h-1.5 rounded-none bg-[#8AB3A0]" />
          )}
        </div>
      </div>

      {/* ── Desktop Hover Indicator Cue ── */}
      {isTall && !isTouchDevice && (
        <div
          aria-hidden="true"
          className={`absolute bottom-3 end-3 z-20 pointer-events-none transition-all duration-300 ${
            isHovered
              ? "opacity-0 translate-y-1"
              : "opacity-100 translate-y-0"
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#1F1F1E]/85 dark:bg-black/90 backdrop-blur-md border border-white/15 text-[10px] font-medium text-white/90 shadow-md">
            <svg
              className="w-3 h-3 text-[#8AB3A0] animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>{isRtl ? "هاور برای مرور کامل" : "Hover to scroll"}</span>
          </div>
        </div>
      )}

      {/* ── Mobile Touch Scroll Hint ── */}
      {isTall && isTouchDevice && (
        <div
          aria-hidden="true"
          className="absolute bottom-3 end-3 z-20 pointer-events-none"
        >
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none bg-[#1F1F1E]/85 dark:bg-black/90 backdrop-blur-md border border-white/15 text-[9px] font-medium text-white/80">
            <svg className="w-2.5 h-2.5 text-[#8AB3A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            <span>{isRtl ? "اسکرول لمسی" : "Scroll to view"}</span>
          </div>
        </div>
      )}

      {/* ── Subtle Vertical Progress Hairline (Runs along edge when hovered) ── */}
      {isTall && !isTouchDevice && (
        <div
          aria-hidden="true"
          className={`absolute top-7 bottom-0 ${
            isRtl ? "left-0" : "right-0"
          } w-[2px] bg-black/10 dark:bg-white/10 pointer-events-none z-20 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full bg-[#38534A] dark:bg-[#8AB3A0]"
            style={{
              height: isHovered ? "100%" : "0%",
              transition: isHovered
                ? `height ${duration}s cubic-bezier(0.28, 0.9, 0.45, 1)`
                : "height 0.85s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>
      )}
    </div>
  );
}
