"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { CaseStudyItem } from "@/lib/case-studies";

interface PortfolioCardImagePreviewProps {
  project: CaseStudyItem;
  isRtl: boolean;
}

export default function PortfolioCardImagePreview({
  project,
  isRtl,
}: PortfolioCardImagePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Gallery items for this project
  const galleryItems = useMemo(() => {
    if (project.gallery && project.gallery.length > 0) {
      return project.gallery;
    }
    if (project.secondaryImage) {
      return [{ src: project.secondaryImage }];
    }
    if (project.image) {
      return [{ src: project.image }];
    }
    return [{ src: "/case_study_1.jpg" }];
  }, [project.gallery, project.image, project.secondaryImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const [maxScroll, setMaxScroll] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const currentItem = galleryItems[currentIndex] || galleryItems[0];
  const hasMultipleImages = galleryItems.length > 1;

  // Calculate maximum vertical scroll offset based on natural image aspect ratio & container size
  const updateScrollDimensions = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const containerWidth = containerRef.current.offsetWidth;
    const imgNaturalHeight = imageRef.current.naturalHeight;
    const imgNaturalWidth = imageRef.current.naturalWidth;

    if (containerHeight > 0 && containerWidth > 0 && imgNaturalWidth > 0 && imgNaturalHeight > 0) {
      // Height of image when scaled to match container width
      const renderedHeight = (containerWidth * imgNaturalHeight) / imgNaturalWidth;
      const scrollable = Math.max(0, renderedHeight - containerHeight);
      setMaxScroll(scrollable);
    }
  }, []);

  // Update dimensions when image finishes loading or current slide changes
  const handleImageLoad = () => {
    setImageLoaded(true);
    updateScrollDimensions();
  };

  useEffect(() => {
    setImageLoaded(false);
    setIsHovered(false);
    setIsTouchActive(false);

    // If image is already cached/complete, update dimensions immediately
    if (imageRef.current && imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      handleImageLoad();
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleResize = () => updateScrollDimensions();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollDimensions]);

  // Calm, premium smooth scroll duration: ~95px / second (~2.5x to 3x slower for readable inspection)
  const scrollDuration = useMemo(() => {
    if (maxScroll <= 20) return 0.5;
    return Math.min(24, Math.max(7, maxScroll / 95));
  }, [maxScroll]);

  const isScrollingActive = isHovered || isTouchActive;
  const isTallScreenshot = maxScroll > 25;

  // Handle click on the preview container
  const handleContainerClick = (e: React.MouseEvent) => {
    // On touch devices with coarse pointer, first tap on tall screenshots activates scroll preview instead of immediate navigation
    if (isTallScreenshot && typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      if (!isTouchActive) {
        e.preventDefault();
        e.stopPropagation();
        setIsTouchActive(true);
      }
    }
  };

  // Carousel navigation handlers with event stopPropagation
  const handlePrev = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? galleryItems.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === galleryItems.length - 1 ? 0 : prev + 1));
  };

  // Touch tap toggles scroll preview on mobile
  const handleTouchContainer = () => {
    if (isTallScreenshot) {
      setIsTouchActive((prev) => !prev);
    }
  };

  // Label to display for the active variation (if provided)
  const activeLabel = isRtl
    ? currentItem.labelFa || currentItem.labelEn
    : currentItem.labelEn || currentItem.labelFa;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleContainerClick}
      className="group/preview relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-white/[0.04] mb-5 select-none"
    >
      {/* ─── Scrolling / Scaled Screenshot ─── */}
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          contain: "paint",
        }}
      >
        <img
          ref={imageRef}
          src={currentItem.src}
          alt={isRtl ? project.titleFa : project.titleEn}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`w-full block select-none pointer-events-none ${
            isTallScreenshot
              ? "h-auto min-h-full origin-top"
              : "h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          }`}
          style={{
            willChange: isTallScreenshot ? "transform" : "auto",
            transform: isTallScreenshot
              ? isScrollingActive
                ? `translate3d(0, -${maxScroll}px, 0)`
                : "translate3d(0, 0, 0)"
              : undefined,
            transition: isTallScreenshot
              ? isScrollingActive
                ? `transform ${scrollDuration}s cubic-bezier(0.25, 0.1, 0.25, 1)`
                : "transform 0.85s cubic-bezier(0.25, 1, 0.5, 1)"
              : undefined,
          }}
        />
      </div>

      {/* ─── Top Badges (Preserved from existing design: Year & Category) ─── */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white tracking-wider shadow-sm">
          {project.year}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-white/85 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold text-foreground shadow-sm">
          {isRtl ? project.categoryFa : project.categoryEn}
        </span>
      </div>

      {/* ─── Carousel Navigation Arrows (Minimalist, visible on hover/active) ─── */}
      {hasMultipleImages && (
        <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-20">
          {/* Previous Arrow Button */}
          <button
            type="button"
            aria-label={isRtl ? "تصویر بعدی" : "Previous variation"}
            onClick={handlePrev}
            onPointerDown={(e) => e.stopPropagation()}
            className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 shadow-lg transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
              isHovered || isTouchActive
                ? "opacity-100"
                : "opacity-0 md:group-hover/preview:opacity-100 max-md:opacity-90"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Arrow Button */}
          <button
            type="button"
            aria-label={isRtl ? "تصویر قبلی" : "Next variation"}
            onClick={handleNext}
            onPointerDown={(e) => e.stopPropagation()}
            className={`pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-md border border-white/15 shadow-lg transition-all duration-200 hover:scale-110 active:scale-90 cursor-pointer ${
              isHovered || isTouchActive
                ? "opacity-100"
                : "opacity-0 md:group-hover/preview:opacity-100 max-md:opacity-90"
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* ─── Subtle Multi-Image Variant Pill Indicator ─── */}
      {hasMultipleImages && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 shadow-md text-white">
            {activeLabel && (
              <span className="text-[10px] font-medium leading-none tracking-wide text-white/90">
                {activeLabel}
              </span>
            )}
            <div className="flex items-center gap-1">
              {galleryItems.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? "w-3 bg-[#B7FF00]" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Tall Screenshot Scroll Hint (Subtle indicator when hovered) ─── */}
      {isTallScreenshot && !isScrollingActive && (
        <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none opacity-0 group-hover/preview:opacity-80 transition-opacity duration-300">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] text-white/80 border border-white/10">
            <svg className="w-2.5 h-2.5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>{isRtl ? "پیش‌نمایش کامل" : "Full Preview"}</span>
          </div>
        </div>
      )}
    </div>
  );
}
