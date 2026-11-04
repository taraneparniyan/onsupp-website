"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";
import { DETAILED_SERVICES_DATA } from "./services-data";
import { CategoryIcon } from "./CategoryIcon";
import { scrollToSection } from "@/lib/scroll";

interface ServicesHeroSlide {
  id: string;
  src: string;
  badgeFa: string;
  badgeEn: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  themeTagFa: string;
  themeTagEn: string;
}

const SERVICES_HERO_SLIDES: ServicesHeroSlide[] = [
  {
    id: "media-studio",
    src: "/images/hero/hero-media-studio.webp",
    badgeFa: "دپارتمان‌های استودیو، رسانه و انیمیشن",
    badgeEn: "Media, Studio & Motion Departments",
    titleFa: "طراحی، تولید سینمایی و هویت‌سازی تمایز برند",
    titleEn: "Cinematic Media Production & Brand Identity",
    descFa:
      "تلفیق تصویربرداری صنعتی، انیمیشن سه‌بعدی و استودیو پادکست با بالاترین تجهیزات سینمایی برای خلق تمایزی تکرارنشدنی در ذهن مخاطب.",
    descEn:
      "Harmonizing commercial cinematography, 3D kinetic animation, and acoustic studio recording to cement brand authority.",
    themeTagFa: "تولید رسانه‌ای و محتوا",
    themeTagEn: "Media & Cinema Production",
  },
  {
    id: "tech-engineering",
    src: "/images/hero/hero-tech-engineering.webp",
    badgeFa: "دپارتمان‌های وب، سئو، CRM و نرم‌افزار",
    badgeEn: "Web, SEO, CRM & Software Departments",
    titleFa: "مهندسی پلتفرم‌های مقیاس‌پذیر و اتوماسیون رشد",
    titleEn: "Enterprise Web Engineering & Growth Systems",
    descFa:
      "معماری وب‌سایت‌های مدرن، رتبه‌بندی ارگانیک در موتورهای جستجو، پایپ‌لاین‌های فروش و سامانه‌های ابری اختصاصی سازمانی.",
    descEn:
      "Next.js web platforms, technical SEO dominance, automated lead pipelines, and bespoke enterprise cloud architectures.",
    themeTagFa: "فناوری و مهندسی داده",
    themeTagEn: "Technology & Software",
  },
];

export default function ServicesHero({
  isRtl,
  activeCategory,
  onSelectCategory,
}: {
  isRtl: boolean;
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Automatic slideshow crossfade every 6.5s
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % SERVICES_HERO_SLIDES.length);
    }, 6500);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPaused]);

  const currentSlide = SERVICES_HERO_SLIDES[currentSlideIndex];

  const handlePillClick = (serviceId: string) => {
    onSelectCategory(serviceId);
    scrollToSection(serviceId);
  };

  return (
    <section
      aria-label={isRtl ? "معرفی دپارتمان‌های تخصصی آن‌ساپ" : "OnSupp Core Services Introduction"}
      className="relative w-full min-h-[620px] lg:min-h-[700px] pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden border-b border-black/[0.06] dark:border-white/[0.08] select-none bg-[#121517] text-white"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Immersive 3D Slideshow Background Imagery ─── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
        {SERVICES_HERO_SLIDES.map((slide, index) => {
          const isActive = index === currentSlideIndex;

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-90 z-10 scale-100" : "opacity-0 z-0 pointer-events-none scale-105"
              }`}
              style={{ transitionProperty: "opacity, transform", transitionDuration: "1000ms" }}
            >
              <Image
                src={slide.src}
                alt={isRtl ? slide.titleFa : slide.titleEn}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className="object-cover object-center w-full h-full"
                quality={92}
              />
            </div>
          );
        })}

        {/* ─── Reading Contrast Directional Gradient Scrim ─── */}
        {/* In RTL: Strong dark veil on the text side (right) fading to transparent on the visual 3D art side (left) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 pointer-events-none transition-colors duration-500 bg-gradient-to-t from-[#121517] via-[#121517]/80 to-[#121517]/65 lg:bg-gradient-to-r lg:from-[#121517]/40 lg:via-[#121517]/85 lg:to-[#121517]/95"
          style={
            isRtl
              ? {
                  background:
                    "linear-gradient(to left, rgba(18,21,23,0.95) 0%, rgba(18,21,23,0.85) 45%, rgba(18,21,23,0.40) 80%, rgba(18,21,23,0.20) 100%)",
                }
              : undefined
          }
        />

        {/* ─── Eased Bottom Scrim Blending into Section 02 ─── */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40 sm:h-56 z-20 pointer-events-none bg-gradient-to-t from-[#141715] via-[#141715]/70 to-transparent"
        />
      </div>

      {/* ─── Content Container ─── */}
      <div className="relative z-30 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ─── Top Bar: Breadcrumbs & Slide Switcher ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          {/* Breadcrumb Navigation */}
          <motion.nav
            aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
            initial={prefersReducedMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="flex items-center gap-2 text-xs text-white/70 font-medium select-none"
          >
            <Link
              href="/"
              className="hover:text-[#B7FF00] transition-colors"
            >
              {isRtl ? "صفحه اصلی" : "Home"}
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white font-semibold">
              {isRtl ? "خدمات تخصصی" : "Our Services"}
            </span>
          </motion.nav>

          {/* Interactive Hero Slide Switcher Pills */}
          <div className="flex items-center gap-2 shrink-0">
            {SERVICES_HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 border ${
                    isActive
                      ? "bg-white/20 text-white border-white/40 shadow-sm backdrop-blur-md"
                      : "bg-black/40 text-white/60 border-white/10 hover:text-white hover:border-white/25 backdrop-blur-sm"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-[#B7FF00] animate-pulse" : "bg-white/40"
                    }`}
                  />
                  <span>{isRtl ? slide.themeTagFa : slide.themeTagEn}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Hero Headline & Lead Prose ─── */}
        <div className="max-w-4xl">
          {/* Dynamic Eyebrow badge matching active slide theme */}
          <motion.div
            key={`badge-${currentSlideIndex}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#B7FF00] uppercase mb-5"
          >
            <span className="h-px w-10 bg-[#B7FF00]/60" />
            <span>
              {isRtl ? currentSlide.badgeFa : currentSlide.badgeEn}
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.12 }}
            className={`text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.2] sm:leading-[1.18] mb-6 drop-shadow-md ${
              isRtl
                ? "font-[family-name:var(--font-vazirmatn)]"
                : "font-[family-name:var(--font-gendy)]"
            }`}
          >
            {isRtl
              ? "طراحی، فناوری و استراتژی برای ساخت تمایز پایدار برندها"
              : "Design, Technology & Strategy for Enduring Category Leadership"}
          </motion.h1>

          {/* Editorial Lead Prose */}
          <motion.p
            key={`desc-${currentSlideIndex}`}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.18 }}
            className="text-base sm:text-lg lg:text-xl text-white/85 leading-relaxed sm:leading-[1.8] max-w-3xl mb-8 drop-shadow"
          >
            {isRtl
              ? "در آن‌ساپ، ۷ دپارتمان تخصصی در پیوندی هماهنگ گرد هم آمده‌اند تا فراتر از راهکارهای مقطعی، زیرساخت پایدار رشد، تولید محتوای سینمایی و مهندسی دقیق نرم‌افزارهای تجاری را محقق سازند. هر خدمت با تعهد به تمایز بصری و خلق بالاترین ارزش تجاری ارائه می‌شود."
              : "At OnSupp, 7 specialized departments work in unified synergy to architect sustainable growth pipelines, cinema-grade brand narratives, and mission-critical enterprise engineering — crafted without compromise for category leaders."}
          </motion.p>

          {/* Quick Metrics Capsule */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.25 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold text-white/85"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 backdrop-blur-md shadow-sm">
              <span className="font-mono text-[#B7FF00] font-bold">
                {isRtl ? "۰۷" : "07"}
              </span>
              <span>{isRtl ? "دپارتمان تخصصی" : "Core Departments"}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 backdrop-blur-md shadow-sm">
              <span className="font-mono text-[#B7FF00] font-bold">
                {isRtl ? "۲۱+" : "21+"}
              </span>
              <span>{isRtl ? "زیرخدمت فعال" : "Specialized Capabilities"}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/50 border border-white/15 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
              <span>{isRtl ? "۱۰۰٪ مهندسی و دیزاین اختصاصی" : "100% Bespoke Engineering"}</span>
            </div>
          </motion.div>
        </div>

        {/* ─── Quick Department Jump Navigator Pills ─── */}
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.32 }}
          className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white/60">
              {isRtl ? "دسترسی مستقیم به دپارتمان‌ها:" : "Direct Department Navigator:"}
            </span>
            <span className="text-[11px] font-mono text-white/40 hidden sm:inline">
              {isRtl ? "کلیک برای پیمایش سریع" : "Click to jump directly"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {DETAILED_SERVICES_DATA.map((service) => {
              const isSelected = activeCategory === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => handlePillClick(service.id)}
                  className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 border ${
                    isSelected
                      ? "bg-[#B7FF00] text-[#121517] border-[#B7FF00] shadow-md shadow-[#B7FF00]/25"
                      : "bg-black/50 border-white/15 text-white/85 hover:border-white/40 hover:text-white hover:bg-black/70 backdrop-blur-md"
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] ${
                      isSelected ? "text-[#121517] font-black" : "text-[#B7FF00]"
                    }`}
                  >
                    {isRtl ? service.numStrFa : service.numStrEn}
                  </span>
                  <span className={isSelected ? "text-[#121517]" : "text-[#B7FF00]"}>
                    <CategoryIcon type={service.iconType} className="w-4 h-4" />
                  </span>
                  <span>{isRtl ? service.titleFa : service.titleEn}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
