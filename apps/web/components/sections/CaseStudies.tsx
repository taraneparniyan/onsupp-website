"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  SHOWCASE_PROJECTS,
  type CaseStudyItem,
} from "@/lib/case-studies";
import { BACKEND_URL } from "@/config/api";
import ShowcaseCard from "./portfolio-showcase/ShowcaseCard";

export default function CaseStudies() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [projects, setProjects] = useState<CaseStudyItem[]>(SHOWCASE_PROJECTS);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [chunkSize, setChunkSize] = useState(3);

  // Sync with backend API if available, preserving gallery definitions
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${BACKEND_URL}/api/v1/casestudies`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItems) => {
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const merged: CaseStudyItem[] = dbItems.map((dbItem: any, idx: number) => {
            const match = SHOWCASE_PROJECTS.find(
              (p) => p.slug === dbItem.slug || p.titleFa === dbItem.titleFa || p.id === dbItem.slug
            );
            if (match) {
              return {
                ...match,
                titleFa: dbItem.titleFa || match.titleFa,
                titleEn: dbItem.titleEn || match.titleEn,
                client: dbItem.client || match.client,
                clientEn: dbItem.clientEn || match.clientEn,
                taglineFa: dbItem.taglineFa || match.taglineFa,
                taglineEn: dbItem.taglineEn || match.taglineEn,
                categoryFa: dbItem.categoryFa || match.categoryFa,
                categoryEn: dbItem.categoryEn || match.categoryEn,
                image: dbItem.imageUrl || match.image,
                secondaryImage: dbItem.secondaryImage || match.secondaryImage,
                gallery: match.gallery,
                liveUrl: dbItem.liveUrl || match.liveUrl,
                position: dbItem.position ?? match.position ?? idx,
                featured: dbItem.featured ?? match.featured,
              };
            }
            return {
              id: dbItem.slug || `db-${dbItem.id}`,
              slug: dbItem.slug || `project-${dbItem.id}`,
              client: dbItem.client || dbItem.titleFa,
              clientEn: dbItem.clientEn || dbItem.titleEn,
              titleFa: dbItem.titleFa || "",
              titleEn: dbItem.titleEn || "",
              taglineFa: dbItem.taglineFa || dbItem.descriptionFa || "",
              taglineEn: dbItem.taglineEn || dbItem.descriptionEn || "",
              categoryFa: dbItem.categoryFa || "دیجیتال",
              categoryEn: dbItem.categoryEn || "Digital",
              servicesFa: [dbItem.categoryFa || "توسعه محصول"],
              servicesEn: [dbItem.categoryEn || "Product Development"],
              metricsFa: [{ value: "۱۰۰٪", label: "رضایت کارفرما" }],
              metricsEn: [{ value: "100%", label: "Client Satisfaction" }],
              colorGradient: "from-[#1a1315] via-[#241a1e] to-[#100b0d]",
              accentColor: "#8BB3A4",
              glowColor: "rgba(139, 179, 164, 0.2)",
              previewType: "web",
              image: dbItem.imageUrl || "/case_study_1.jpg",
              secondaryImage: dbItem.secondaryImage || undefined,
              liveUrl: dbItem.liveUrl || "#",
              featured: dbItem.featured !== false,
              position: dbItem.position ?? idx,
              year: dbItem.year || "۲۰۲۵",
            };
          });

          const featured = merged
            .filter((p) => p.featured !== false)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

          if (featured.length > 0) {
            setProjects(featured);
          }
        }
      })
      .catch(() => {
        // Retain initial default SHOWCASE_PROJECTS
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Responsive chunk size: Desktop = 3 cards visible, Tablet = 2 cards, Mobile = 1 card
  useEffect(() => {
    const handleResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 768) {
        setChunkSize(1);
      } else if (window.innerWidth < 1024) {
        setChunkSize(2);
      } else {
        setChunkSize(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Partition projects into slides of `chunkSize` (Handling final non-divisible group correctly)
  const slides = useMemo(() => {
    const list: CaseStudyItem[][] = [];
    for (let i = 0; i < projects.length; i += chunkSize) {
      list.push(projects.slice(i, i + chunkSize));
    }
    return list.length > 0 ? list : [[...projects]];
  }, [projects, chunkSize]);

  const totalSlides = slides.length;

  // Ensure active index is within bounds if slides count changes
  useEffect(() => {
    if (activeSlideIndex >= totalSlides) {
      setActiveSlideIndex(Math.max(0, totalSlides - 1));
    }
  }, [activeSlideIndex, totalSlides]);

  // Vertical Navigation: Next (Down) & Previous (Up)
  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Keyboard accessibility (ArrowDown & ArrowUp)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      nextSlide();
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      prevSlide();
    }
  };

  // Touch Swipe gestures for vertical mobile navigation
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    touchDeltaY.current = e.touches[0].clientY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current !== null) {
      const delta = touchDeltaY.current;
      const threshold = 45;
      if (delta < -threshold) {
        nextSlide();
      } else if (delta > threshold) {
        prevSlide();
      }
    }
    touchStartY.current = null;
    touchDeltaY.current = 0;
  };

  const toPersianDigits = (num: number): string => {
    const pNums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(num).replace(/[0-9]/g, (w) => pNums[+w]);
  };

  const currentGroup = slides[activeSlideIndex] || slides[0] || [];

  return (
    <section
      id="case-studies"
      aria-label={isRtl ? "ویترین نمونه‌کارهای آن‌ساپ" : "OnSupp Portfolio Showcase"}
      className="section-viewport relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-[#38534A] dark:bg-[#17221E] text-white border-y border-black/10 dark:border-white/10 transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative z-10 w-full max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header ── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div>
              {/* Eyebrow - Matching About Us Section Pattern */}
              <div className="inline-flex items-center gap-3 mb-2 text-xs sm:text-sm font-bold tracking-widest text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#8AB3A0]/60" />
                <span>{isRtl ? "ویترین نمونه‌کارها" : "PORTFOLIO SHOWCASE"}</span>
              </div>

              {/* Headline */}
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-[42px] lg:whitespace-nowrap font-bold tracking-tight text-white ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? "معماری پروژه‌ها و مهندسی محصول" : "FEATURED CASE STUDIES"}
              </h2>
            </div>

            {/* Trailing Controls: Minimalist Vertical Navigation & All Projects Link */}
            <div className="flex items-center gap-6 self-start sm:self-end">
              <Link
                href="/portfolio"
                className={`group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-white/90 hover:text-white uppercase transition-colors ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                <span>{isRtl ? "مشاهده همه پروژه‌ها" : "VIEW ALL PORTFOLIO"}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isRtl
                      ? "rotate-180 group-hover:-translate-x-1"
                      : "group-hover:translate-x-1"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Stepped Counter & Minimalist Vertical Navigation Controls */}
              <div className="flex items-center gap-3 border-s border-white/20 ps-4">
                <span className="text-xs font-mono font-medium text-white/70 tracking-wider">
                  {isRtl
                    ? `${toPersianDigits(activeSlideIndex + 1)} / ${toPersianDigits(totalSlides)}`
                    : `0${activeSlideIndex + 1} / 0${totalSlides}`}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Previous Button (Arrow Up) */}
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label={isRtl ? "پروژه‌های قبلی" : "Previous projects"}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1E]/60 hover:bg-[#F8F9FA] hover:text-[#1F1F1E] border border-white/15 hover:border-white text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>

                  {/* Next Button (Arrow Down) */}
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label={isRtl ? "پروژه‌های بعدی" : "Next projects"}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1F1F1E]/60 hover:bg-[#F8F9FA] hover:text-[#1F1F1E] border border-white/15 hover:border-white text-white backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.4"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Vertical Slider Viewport: Exactly 3 Cards in Desktop Viewport ── */}
        <div className="relative w-full min-h-[520px] sm:min-h-[550px] lg:min-h-[560px]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`slide-group-${activeSlideIndex}`}
              initial={{
                opacity: 0,
                y: prefersReducedMotion ? 0 : direction === 1 ? 50 : -50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: prefersReducedMotion ? 0 : direction === 1 ? -50 : 50,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.15 : 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 items-stretch"
            >
              {currentGroup.map((project) => (
                <div key={project.slug || project.id} className="w-full h-full flex">
                  <ShowcaseCard project={project} isRtl={isRtl} />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom Stepper Dots (Clean, minimal rounded pill indicators) ── */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDirection(idx > activeSlideIndex ? 1 : -1);
                  setActiveSlideIndex(idx);
                }}
                aria-label={`Go to slide group ${idx + 1}`}
                className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeSlideIndex
                    ? "w-8 bg-[#F8F9FA] shadow-[0_0_6px_rgba(248,249,250,0.4)]"
                    : "w-2 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
