"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { CaseStudyItem } from "@/lib/case-studies";

interface ShowcaseCardProps {
  project: CaseStudyItem;
  isRtl: boolean;
}

export default function ShowcaseCard({ project, isRtl }: ShowcaseCardProps) {
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

  const currentItem = galleryItems[currentIndex] || galleryItems[0];
  const hasMultipleImages = galleryItems.length > 1;

  // Calculate maximum vertical scroll offset for full screenshot preview
  const updateScrollDimensions = useCallback(() => {
    if (!containerRef.current || !imageRef.current) return;
    const containerHeight = containerRef.current.offsetHeight;
    const containerWidth = containerRef.current.offsetWidth;
    const imgNaturalHeight = imageRef.current.naturalHeight;
    const imgNaturalWidth = imageRef.current.naturalWidth;

    if (containerHeight > 0 && containerWidth > 0 && imgNaturalWidth > 0 && imgNaturalHeight > 0) {
      const renderedHeight = (containerWidth * imgNaturalHeight) / imgNaturalWidth;
      const scrollable = Math.max(0, renderedHeight - containerHeight);
      setMaxScroll(scrollable);
    }
  }, []);

  const handleImageLoad = () => {
    updateScrollDimensions();
  };

  useEffect(() => {
    setIsHovered(false);
    setIsTouchActive(false);

    if (imageRef.current && imageRef.current.complete && imageRef.current.naturalWidth > 0) {
      updateScrollDimensions();
    }
  }, [currentIndex, updateScrollDimensions]);

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

  // Multi-image carousel navigation
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

  // Mobile touch inspection
  const handleContainerClick = (e: React.MouseEvent) => {
    if (isTallScreenshot && typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      if (!isTouchActive) {
        e.preventDefault();
        e.stopPropagation();
        setIsTouchActive(true);
      }
    }
  };

  const activeLabel = isRtl
    ? currentItem.labelFa || currentItem.labelEn
    : currentItem.labelEn || currentItem.labelFa;

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      onClick={handleContainerClick}
      className="group relative flex flex-col justify-between w-full h-[520px] sm:h-[550px] lg:h-[560px] rounded-[28px] overflow-hidden bg-[#1F1F1E] border border-white/10 hover:border-white/25 transition-all duration-300 shadow-2xl select-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 1. Full Image Background with Hover-to-Scroll (Crisp, No Heavy Dark Gradients) ── */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden bg-[#1F1F1E] rounded-[28px]"
        style={{ contain: "paint" }}
      >
        <img
          ref={imageRef}
          src={currentItem.src}
          alt={isRtl ? project.titleFa : project.titleEn}
          loading="lazy"
          onLoad={handleImageLoad}
          className={`w-full block select-none pointer-events-none rounded-[28px] ${
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

      {/* ── 2. Top Bar: Floating Frosted Pill Badges (Category & Year) ── */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between pointer-events-none">
        {/* Floating Category Label - Frosted Glass Pill */}
        <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#1F1F1E]/70 backdrop-blur-md text-[#F8F9FA] border border-white/15 shadow-md">
          {isRtl ? project.categoryFa : project.categoryEn}
        </span>

        {/* Execution Year Badge - Frosted Pill with Delicate Accent Dot */}
        <span className="px-3 py-1.5 rounded-full text-[11px] font-mono font-bold bg-[#1F1F1E]/70 backdrop-blur-md text-[#F8F9FA] border border-white/15 shadow-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#8BB3A4] shadow-[0_0_6px_rgba(139,179,164,0.6)]" />
          <span>{project.year || (isRtl ? "۱۴۰۴" : "2025")}</span>
        </span>
      </div>

      {/* ── 3. Multi-Image Carousel Controls (Minimalist Frosted Circular Buttons) ── */}
      {hasMultipleImages && (
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-3.5 flex items-center justify-between z-20 pointer-events-none">
          {/* Previous Arrow */}
          <button
            type="button"
            aria-label={isRtl ? "تصویر بعدی" : "Previous image"}
            onClick={handlePrev}
            onPointerDown={(e) => e.stopPropagation()}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1E]/75 hover:bg-[#F8F9FA] text-[#F8F9FA] hover:text-[#1F1F1E] border border-white/20 hover:border-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            aria-label={isRtl ? "تصویر قبلی" : "Next image"}
            onClick={handleNext}
            onPointerDown={(e) => e.stopPropagation()}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1E]/75 hover:bg-[#F8F9FA] text-[#F8F9FA] hover:text-[#1F1F1E] border border-white/20 hover:border-white backdrop-blur-md shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 opacity-0 group-hover:opacity-100 max-md:opacity-90 cursor-pointer"
          >
            <svg
              className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Multi-Image Active Variation Pill Indicator */}
      {hasMultipleImages && (
        <div className="absolute top-16 inset-x-0 flex justify-center z-10 pointer-events-none">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1F1F1E]/75 backdrop-blur-md border border-white/20 text-[#F8F9FA] shadow-md">
            {activeLabel && (
              <span className="text-[10px] font-medium leading-none text-[#F8F9FA]/90">
                {activeLabel}
              </span>
            )}
            <div className="flex items-center gap-1.5">
              {galleryItems.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 transition-all duration-300 rounded-full ${
                    idx === currentIndex
                      ? "w-3.5 bg-[#8BB3A4] shadow-[0_0_5px_rgba(139,179,164,0.5)]"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Bottom Information Section: Pure Colorless Progressive Optical Blur (Matching Reference Card) ── */}
      <div className="relative z-10 w-full p-5 sm:p-6 pt-12">
        {/* Progressive Pure Blur Layers — Zero Color, Zero Gradient Tint, Zero Glass Box */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -top-6 overflow-hidden rounded-b-[28px]"
        >
          {/* Layer 1: Gentle feathering blur at the top transition */}
          <div
            className="absolute inset-0 backdrop-blur-[4px]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 100%)",
              maskImage: "linear-gradient(to bottom, transparent 0%, black 22%, black 100%)",
            }}
          />
          {/* Layer 2: Medium progressive optical blur */}
          <div
            className="absolute inset-0 backdrop-blur-[10px]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent 10%, black 38%, black 100%)",
              maskImage: "linear-gradient(to bottom, transparent 10%, black 38%, black 100%)",
            }}
          />
          {/* Layer 3: Full natural optical blur across the text & button zone */}
          <div
            className="absolute inset-0 backdrop-blur-[18px]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent 22%, black 52%, black 100%)",
              maskImage: "linear-gradient(to bottom, transparent 22%, black 52%, black 100%)",
            }}
          />
        </div>

        {/* Content sitting directly on the pure blurred area */}
        <div className="relative z-10">
          {/* Row 1: Project Name & Star / Metric Accent */}
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <h3
              className={`text-base sm:text-lg font-bold text-[#F8F9FA] leading-tight truncate group-hover:text-white transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? project.titleFa : project.titleEn}
            </h3>

            {/* Delicate Accent Rating/Metric (matching reference 4.8 ★) */}
            <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-[#F8F9FA] drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              <span>{isRtl ? "۴.۹" : "4.9"}</span>
              <span className="text-[#8BB3A4] text-xs">★</span>
            </div>
          </div>

          {/* Row 2: Client Subtitle / Details with Subtle Building Icon */}
          <div className="flex items-center gap-1.5 text-xs text-[#F8F9FA]/90 mb-3.5 font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
            <svg
              className="w-3.5 h-3.5 text-[#F8F9FA]/85 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span className="truncate">{isRtl ? project.client : project.clientEn}</span>
          </div>

          {/* Row 3: Services Delivered by OnSupp (Clean Inline Items without Colored Boxes, Matching Reference) */}
          {((isRtl ? project.servicesFa : project.servicesEn) || []).length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[11px] font-medium text-[#F8F9FA]/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
              {(isRtl ? project.servicesFa : project.servicesEn).slice(0, 3).map((service, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full border border-[#F8F9FA]/70 shrink-0" />
                  <span>{service}</span>
                </div>
              ))}
            </div>
          )}

          {/* Row 4: Full-Width Rounded Pill Button: "مشاهده جزئیات پروژه" (Matching Reference "Reserve" Button) */}
          <div className="w-full py-3 px-5 rounded-full bg-[#F8F9FA] hover:bg-[#38534A] text-[#1F1F1E] hover:text-[#F8F9FA] text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-[0.98]">
            <span>{isRtl ? "مشاهده جزئیات پروژه" : "View Case Study"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
