"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  SHOWCASE_PROJECTS,
  type CaseStudyItem,
} from "@/lib/case-studies";
import { BACKEND_URL } from "@/config/api";

const AUTOPLAY_INTERVAL_MS = 6000;

export default function CaseStudies() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [projects, setProjects] = useState<CaseStudyItem[]>(SHOWCASE_PROJECTS);
  const total = projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  // Sync with backend API
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
              previewType: (dbItem.projectType === "app" ? "mobile" : dbItem.projectType === "instagram" ? "platform" : "web") as any,
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
        // Retain default SHOWCASE_PROJECTS
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Transition handlers with modulo wrap
  const nextSlide = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index: number) => {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index % total);
  }, [activeIndex, total]);

  // Autoplay with hover pause
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [prefersReducedMotion, isPaused, nextSlide]);

  // Touch and pointer gestures
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null) {
      const delta = touchDeltaX.current;
      const threshold = 40;
      if (isRtl) {
        if (delta < -threshold) nextSlide();
        else if (delta > threshold) prevSlide();
      } else {
        if (delta < -threshold) nextSlide();
        else if (delta > threshold) prevSlide();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setTimeout(() => setIsPaused(false), 200);
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (isRtl) nextSlide();
      else prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (isRtl) prevSlide();
      else nextSlide();
    }
  };

  // Currently visible 3 projects for the hybrid stage
  const featuredProject = projects[activeIndex % total] || projects[0];
  const companionProject1 = projects[(activeIndex + 1) % total] || projects[0];
  const companionProject2 = projects[(activeIndex + 2) % total] || projects[0];

  const toPersianDigits = (num: number): string => {
    const pNums = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return String(num).replace(/[0-9]/g, (w) => pNums[+w]);
  };

  return (
    <section
      id="case-studies"
      aria-label={isRtl ? "نمونه‌کارهای آن‌ساپ" : "OnSupp Portfolio & Case Studies"}
      className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-[#38534A] dark:bg-[#17221E] text-white border-y border-black/10 dark:border-white/10 transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative z-10 w-full max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header ── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 sm:mb-12">
            <div>
              {/* Eyebrow - Matching About Us Section Pattern */}
              <div className="inline-flex items-center gap-3 mb-2 text-xs sm:text-sm font-bold tracking-widest text-[#D4A5A8] uppercase">
                <span className="h-px w-10 bg-[#D4A5A8]/60" />
                <span>{isRtl ? "ویترین پروژه‌ها" : "SELECTED WORKS"}</span>
              </div>

              {/* Headline */}
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-white ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? "معماری پروژه‌ها و مهندسی محصول" : "FEATURED CASE STUDIES"}
              </h2>
            </div>

            {/* Trailing Controls & Counter */}
            <div className="flex items-center gap-5 self-start sm:self-end">
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

              {/* Stepped Counter & Navigation Buttons */}
              <div className="flex items-center gap-3 border-s border-white/20 ps-4">
                <span className="text-xs font-mono font-medium text-white/70 tracking-wider">
                  {isRtl
                    ? `${toPersianDigits(activeIndex + 1)} / ${toPersianDigits(total)}`
                    : `0${activeIndex + 1} / 0${total}`}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label={isRtl ? "پروژه قبلی" : "Previous project"}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label={isRtl ? "پروژه بعدی" : "Next project"}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Hybrid Stage Showcase ── */}
        <div className="relative w-full">
          {/* Desktop/Tablet Hybrid Layout */}
          <div className="hidden md:flex items-stretch gap-5 lg:gap-6 w-full h-[480px] lg:h-[500px] xl:h-[520px]">
            {/* 1. Dominant Featured Project (~58% on Desktop, ~65% on Tablet) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`featured-${featuredProject.id}`}
                initial={{ opacity: 0, x: direction === 1 ? (isRtl ? -20 : 20) : (isRtl ? 20 : -20) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? (isRtl ? 20 : -20) : (isRtl ? -20 : 20) }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full md:w-[65%] lg:w-[58%] shrink-0 h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#161D1A] text-foreground dark:text-white border border-black/[0.07] dark:border-white/10 shadow-[0_16px_40px_-12px_rgba(56,83,74,0.1),_0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.55)] flex flex-col justify-between group"
              >
                <Link
                  href={`/portfolio/${featuredProject.slug}`}
                  className="relative flex flex-col sm:flex-row items-stretch justify-between h-full w-full select-none cursor-pointer"
                >
                  {/* Info Column (~42% width) */}
                  <div className="flex flex-col justify-between w-full sm:w-[42%] lg:w-[40%] h-full p-6 sm:p-7 lg:p-8 z-20 shrink-0 bg-white dark:bg-[#161D1A]">
                    <div>
                      {/* Eyebrow & Client */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase text-[#9f2334] dark:text-[#D4A5A8]">
                          {isRtl ? featuredProject.categoryFa : featuredProject.categoryEn}
                        </span>
                        <span className="text-foreground/20 dark:text-white/20">•</span>
                        <span className="text-[11px] font-mono text-foreground/60 dark:text-white/60">
                          {isRtl ? featuredProject.client : featuredProject.clientEn}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3
                        className={`text-lg sm:text-xl lg:text-2xl font-bold leading-snug tracking-tight text-foreground dark:text-white mb-3 group-hover:text-[#9f2334] dark:group-hover:text-[#D4A5A8] transition-colors ${
                          isRtl
                            ? "font-[family-name:var(--font-vazirmatn)]"
                            : "font-[family-name:var(--font-gendy)] uppercase leading-tight"
                        }`}
                      >
                        {isRtl ? featuredProject.titleFa : featuredProject.titleEn}
                      </h3>

                      {/* Concise Tagline */}
                      <p className="text-xs sm:text-sm text-foreground/70 dark:text-white/70 line-clamp-3 leading-relaxed mb-4">
                        {isRtl ? featuredProject.taglineFa : featuredProject.taglineEn}
                      </p>

                      {/* Service Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(isRtl ? featuredProject.servicesFa : featuredProject.servicesEn)
                          .slice(0, 2)
                          .map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-foreground/[0.04] dark:bg-white/5 border border-foreground/10 dark:border-white/10 text-foreground/75 dark:text-white/75"
                            >
                              {s}
                            </span>
                          ))}
                      </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="pt-4 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground dark:text-white group-hover:text-[#9f2334] dark:group-hover:text-[#D4A5A8] transition-colors">
                        <span>{isRtl ? "مشاهده جزئیات پروژه" : "View Case Study"}</span>
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
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </span>

                      <div className="w-8 h-8 rounded-full border border-foreground/20 dark:border-white/20 flex items-center justify-center text-foreground dark:text-white group-hover:bg-[#9f2334] dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-[#1F1F1E] group-hover:border-[#9f2334] dark:group-hover:border-white transition-all">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={isRtl ? "M17 17L7 7M7 7H17M7 7V17" : "M7 17L17 7M17 7H7M17 7V17"}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Dominant Image Container (~60% width) */}
                  <div className="relative w-full sm:w-[58%] lg:w-[60%] h-full overflow-hidden bg-[#161615]">
                    <Image
                      src={featuredProject.image || "/case_study_1.jpg"}
                      alt={isRtl ? featuredProject.titleFa : featuredProject.titleEn}
                      fill
                      priority
                      sizes="(max-width: 1024px) 60vw, 45vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* 2. First Companion Card (~21% on Desktop, ~35% on Tablet) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`companion1-${companionProject1.id}`}
                initial={{ opacity: 0, x: direction === 1 ? (isRtl ? -15 : 15) : (isRtl ? 15 : -15) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? (isRtl ? 15 : -15) : (isRtl ? -15 : 15) }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                onClick={() => goToSlide((activeIndex + 1) % total)}
                className="w-full md:w-[35%] lg:w-[21%] h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#161D1A] text-foreground dark:text-white border border-black/[0.07] dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 shadow-[0_10px_30px_-8px_rgba(56,83,74,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col group select-none"
              >
                {/* Visual Image */}
                <div className="relative w-full h-[65%] overflow-hidden bg-[#161615]">
                  <Image
                    src={companionProject1.image || "/case_study_1.jpg"}
                    alt={isRtl ? companionProject1.titleFa : companionProject1.titleEn}
                    fill
                    sizes="(max-width: 1024px) 35vw, 20vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Bottom Metadata */}
                <div className="flex-1 p-5 flex flex-col justify-between bg-white dark:bg-[#161D1A]">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9f2334] dark:text-[#D4A5A8] mb-1">
                      {isRtl ? companionProject1.categoryFa : companionProject1.categoryEn}
                    </span>
                    <h4 className="text-sm font-bold text-foreground dark:text-white group-hover:text-[#9f2334] dark:group-hover:text-[#D4A5A8] transition-colors line-clamp-2 leading-snug">
                      {isRtl ? companionProject1.titleFa : companionProject1.titleEn}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-xs text-foreground/50 dark:text-white/50 pt-2 border-t border-foreground/10 dark:border-white/10 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                    <span className="text-[11px] font-mono truncate max-w-[120px]">
                      {isRtl ? companionProject1.client : companionProject1.clientEn}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-125 ${
                        isRtl ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* 3. Second Companion Card (~21% on Desktop, hidden on Tablet) */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`companion2-${companionProject2.id}`}
                initial={{ opacity: 0, x: direction === 1 ? (isRtl ? -15 : 15) : (isRtl ? 15 : -15) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? (isRtl ? 15 : -15) : (isRtl ? -15 : 15) }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                onClick={() => goToSlide((activeIndex + 2) % total)}
                className="hidden lg:flex lg:w-[21%] h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white dark:bg-[#161D1A] text-foreground dark:text-white border border-black/[0.07] dark:border-white/10 hover:border-black/25 dark:hover:border-white/30 shadow-[0_10px_30px_-8px_rgba(56,83,74,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 cursor-pointer flex-col group select-none"
              >
                {/* Visual Image */}
                <div className="relative w-full h-[65%] overflow-hidden bg-[#161615]">
                  <Image
                    src={companionProject2.image || "/case_study_1.jpg"}
                    alt={isRtl ? companionProject2.titleFa : companionProject2.titleEn}
                    fill
                    sizes="20vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Bottom Metadata */}
                <div className="flex-1 p-5 flex flex-col justify-between bg-white dark:bg-[#161D1A]">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#9f2334] dark:text-[#D4A5A8] mb-1">
                      {isRtl ? companionProject2.categoryFa : companionProject2.categoryEn}
                    </span>
                    <h4 className="text-sm font-bold text-foreground dark:text-white group-hover:text-[#9f2334] dark:group-hover:text-[#D4A5A8] transition-colors line-clamp-2 leading-snug">
                      {isRtl ? companionProject2.titleFa : companionProject2.titleEn}
                    </h4>
                  </div>

                  <div className="flex items-center justify-between text-xs text-foreground/50 dark:text-white/50 pt-2 border-t border-foreground/10 dark:border-white/10 group-hover:text-foreground dark:group-hover:text-white transition-colors">
                    <span className="text-[11px] font-mono truncate max-w-[120px]">
                      {isRtl ? companionProject2.client : companionProject2.clientEn}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform group-hover:scale-125 ${
                        isRtl ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Mobile Single Card Showcase (< 768px) */}
          <div className="block md:hidden w-full">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`mobile-${featuredProject.id}`}
                initial={{ opacity: 0, x: direction === 1 ? (isRtl ? -20 : 20) : (isRtl ? 20 : -20) }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? (isRtl ? 20 : -20) : (isRtl ? -20 : 20) }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-2xl overflow-hidden bg-white dark:bg-[#161D1A] text-foreground dark:text-white border border-black/[0.07] dark:border-white/10 shadow-xl flex flex-col"
              >
                <Link
                  href={`/portfolio/${featuredProject.slug}`}
                  className="flex flex-col w-full"
                >
                  {/* Top Image */}
                  <div className="relative w-full h-[220px] overflow-hidden bg-[#161615]">
                    <Image
                      src={featuredProject.image || "/case_study_1.jpg"}
                      alt={isRtl ? featuredProject.titleFa : featuredProject.titleEn}
                      fill
                      priority
                      sizes="95vw"
                      className="object-cover object-top"
                    />
                    <div className="absolute top-3 end-3 px-2.5 py-1 rounded-full text-[10px] font-mono bg-black/60 backdrop-blur-md text-[#D4A5A8] border border-white/15">
                      {isRtl ? featuredProject.categoryFa : featuredProject.categoryEn}
                    </div>
                  </div>

                  {/* Bottom Text Content */}
                  <div className="p-5 flex flex-col justify-between bg-white dark:bg-[#161D1A]">
                    <div>
                      <span className="block text-xs font-mono text-foreground/50 dark:text-white/50 mb-1">
                        {isRtl ? featuredProject.client : featuredProject.clientEn}
                      </span>
                      <h3 className="text-base font-bold text-foreground dark:text-white mb-2 leading-snug">
                        {isRtl ? featuredProject.titleFa : featuredProject.titleEn}
                      </h3>
                      <p className="text-xs text-foreground/70 dark:text-white/70 line-clamp-2 leading-relaxed mb-4">
                        {isRtl ? featuredProject.taglineFa : featuredProject.taglineEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-foreground/10 dark:border-white/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground dark:text-white flex items-center gap-1.5">
                        <span>{isRtl ? "مشاهده پروژه" : "View Case Study"}</span>
                        <svg
                          className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>

                      <span className="text-[11px] font-mono text-foreground/40 dark:text-white/40">
                        {isRtl
                          ? `${toPersianDigits(activeIndex + 1)} / ${toPersianDigits(total)}`
                          : `0${activeIndex + 1} / 0${total}`}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </AnimatePresence>

            {/* Mobile Dots Navigation */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {projects.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goToSlide(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-7 bg-white dark:bg-[#D4A5A8]"
                      : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
