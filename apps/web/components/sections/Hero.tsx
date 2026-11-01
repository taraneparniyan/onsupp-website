"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { scrollToSection } from "@/lib/scroll";

// ─── Number Localization ───────────────────────────────────────────────────
const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

// ─── Types ───────────────────────────────────────────────────────────────────
export type HeroSettings = {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaText2: string;
  ctaText2En: string;
  ctaLink2: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export type HeroSlide = {
  id: string;
  categoryFa: string;
  categoryEn: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  subtitleEn: string;
  ctaTextFa: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaText2Fa?: string;
  ctaText2En?: string;
  ctaLink2?: string;
  image: string;
  imageAltFa: string;
  imageAltEn: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const DEFAULT_BACKEND_HERO: HeroSettings = {
  title: "رشد دیجیتال کسب‌وکار شما، با استراتژی دقیق و مهندسی نوین",
  titleEn: "Empowering Your Digital Growth With Precision Strategy & Modern Engineering",
  subtitle:
    "طراحی و توسعه وب‌سایت‌های مقیاس‌پذیر، سئوی تخصصی تکنیکال و راهکارهای جامع دیجیتال مارکتینگ همگام با اهداف سازمان شما.",
  subtitleEn:
    "Scalable web architecture, deep technical SEO, and comprehensive digital marketing solutions tailored to your enterprise goals.",
  ctaText: "شروع پروژه و مشاوره",
  ctaTextEn: "Start Project & Consultation",
  ctaLink: "#contact",
  ctaText2: "بررسی خدمات تخصصی",
  ctaText2En: "Explore Our Services",
  ctaLink2: "#services",
  imageUrl: null,
  imageAlt: null,
};

// Curated high-resolution editorial photographic slides
const CURATED_SLIDES: Omit<HeroSlide, "id">[] = [
  {
    categoryFa: "معماری وب و پلتفرم‌های مقیاس‌پذیر",
    categoryEn: "WEB ENGINEERING & PLATFORMS",
    titleFa: "رشد دیجیتال کسب‌وکار شما، با استراتژی دقیق و مهندسی نوین",
    titleEn: "Empowering Your Digital Growth With Precision Strategy & Modern Engineering",
    subtitleFa:
      "طراحی و توسعه وب‌سایت‌های مقیاس‌پذیر، سئوی تخصصی تکنیکال و راهکارهای جامع دیجیتال مارکتینگ همگام با اهداف سازمان شما.",
    subtitleEn:
      "Scalable web architecture, deep technical SEO, and comprehensive digital marketing solutions tailored to your enterprise goals.",
    ctaTextFa: "شروع پروژه و مشاوره",
    ctaTextEn: "Start Project & Consultation",
    ctaLink: "#contact",
    ctaText2Fa: "بررسی خدمات تخصصی",
    ctaText2En: "Explore Our Services",
    ctaLink2: "#services",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2400&q=85",
    imageAltFa: "فضای نوآوری مهندسی وب و طراحی مدرن آن‌ساپ",
    imageAltEn: "Modern web architecture and digital innovation workspace at OnSupp",
  },
  {
    categoryFa: "سئو تکنیکال و معماری داده",
    categoryEn: "DATA-DRIVEN SEO & GROWTH",
    titleFa: "دیده‌شدن پایدار در جایگاه‌های برتر با رویکرد داده‌محور",
    titleEn: "Securing Top Search Authority Through Scientific Data Architecture",
    subtitleFa:
      "آدیت فنی عمیق، اصلاح ساختارهای معنایی، و ایجاد مسیرهای پیوسته ورودی ارگانیک برای تسلط پایدار در بازار رقابتی.",
    subtitleEn:
      "Exhaustive technical SEO audits, semantic knowledge engineering, and sustainable organic lead acquisition.",
    ctaTextFa: "مشاهده نمونه پروژه‌ها",
    ctaTextEn: "View Case Studies",
    ctaLink: "#case-studies",
    ctaText2Fa: "تحلیل آنلاین وضعیت",
    ctaText2En: "Request Audit",
    ctaLink2: "#contact",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2400&q=85",
    imageAltFa: "تحلیل داده‌ها و رشد ارگانیک در سئو تکنیکال",
    imageAltEn: "Data analytics and organic search growth dashboard",
  },
  {
    categoryFa: "هویت برند و استودیو تولید محتوا",
    categoryEn: "BRAND IDENTITY & STUDIO PRODUCTION",
    titleFa: "روایتی ماندگار و متمایز از برند در تمام بسترهای دیجیتال",
    titleEn: "Distinctive Visual Storytelling Across Every Digital Frontier",
    subtitleFa:
      "تصویربرداری سینمایی، استراتژی برندسازی در فضای مجازی و طراحی دارایی‌های بصری سطح اول برای اثرگذاری حداکثری.",
    subtitleEn:
      "Cinematic studio production, bespoke brand identity systems, and high-impact social media creative direction.",
    ctaTextFa: "درخواست مشاوره استودیو",
    ctaTextEn: "Book Studio Consultation",
    ctaLink: "#contact",
    ctaText2Fa: "مشاهده تعرفه‌ها",
    ctaText2En: "Review Pricing",
    ctaLink2: "#pricing",
    image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=2400&q=85",
    imageAltFa: "استودیو ایده‌پردازی و هویت‌سازی دیجیتال آن‌ساپ",
    imageAltEn: "Creative studio and brand storytelling strategy room",
  },
];

export default function Hero() {
  const { lang } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isRtl = lang === "fa";

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Manual-first navigation
  const [slides, setSlides] = useState<HeroSlide[]>(
    CURATED_SLIDES.map((s, idx) => ({ ...s, id: `slide-${idx + 1}` }))
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  // ─── Fetch Backend Hero Settings & Update Slide 1 ─────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/hero`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: HeroSettings | null) => {
        if (!data || !data.title) return;
        setSlides((prev) => {
          const updated = [...prev];
          updated[0] = {
            ...updated[0],
            titleFa: data.title || updated[0].titleFa,
            titleEn: data.titleEn || updated[0].titleEn,
            subtitleFa: data.subtitle || updated[0].subtitleFa,
            subtitleEn: data.subtitleEn || updated[0].subtitleEn,
            ctaTextFa: data.ctaText || updated[0].ctaTextFa,
            ctaTextEn: data.ctaTextEn || updated[0].ctaTextEn,
            ctaLink: data.ctaLink || updated[0].ctaLink,
            ctaText2Fa: data.ctaText2 || updated[0].ctaText2Fa,
            ctaText2En: data.ctaText2En || updated[0].ctaText2En,
            ctaLink2: data.ctaLink2 || updated[0].ctaLink2,
            image: data.imageUrl || updated[0].image,
            imageAltFa: data.imageAlt || updated[0].imageAltFa,
            imageAltEn: data.imageAlt || updated[0].imageAltEn,
          };
          return updated;
        });
      })
      .catch(() => {});
  }, []);

  // ─── Slide Navigation Handlers ───────────────────────────────────────────
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
  };

  // ─── Gentle Autoplay with Pause on Hover ─────────────────────────────────
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 9000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, nextSlide]);

  // ─── Keyboard Navigation ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (isRtl) nextSlide();
        else prevSlide();
      } else if (e.key === "ArrowRight") {
        if (isRtl) prevSlide();
        else nextSlide();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRtl, nextSlide, prevSlide]);

  // ─── Touch Swipe Support ─────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped Right
        if (isRtl) nextSlide();
        else prevSlide();
      } else {
        // Swiped Left
        if (isRtl) prevSlide();
        else nextSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <section
      id="hero"
      aria-label={isRtl ? "بخش شاخص و اسلایدر اصلی" : "Homepage Hero Slider"}
      dir={isRtl ? "rtl" : "ltr"}
      className="relative w-full min-h-[90vh] md:min-h-[94vh] lg:min-h-[96vh] flex items-center overflow-hidden bg-[#141414] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPlaying(false)}
    >
      {/* ══════════════════════════════════════════════════════════════════════
          1. BACKGROUND PHOTOGRAPHIC SLIDES (Harvard Full-Bleed Imagery)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={currentSlide.image}
              alt={isRtl ? currentSlide.imageAltFa : currentSlide.imageAltEn}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════════════
            2. DIRECTIONAL GRADIENT OVERLAY (Approved Burgundy & Charcoal)
            Ensures 100% Text Readability While Revealing The Photography
            ════════════════════════════════════════════════════════════════════ */}
        {/* Horizontal Directional Scrim (Deep where text lives, feathering toward the opposite side) */}
        <div
          className={`absolute inset-0 ${
            isRtl
              ? "bg-gradient-to-l from-[#141414]/95 via-[#141414]/80 via-45% to-transparent lg:from-[#141414]/95 lg:via-[#4F0001]/60 lg:via-40% lg:to-transparent"
              : "bg-gradient-to-r from-[#141414]/95 via-[#141414]/80 via-45% to-transparent lg:from-[#141414]/95 lg:via-[#4F0001]/60 lg:via-40% lg:to-transparent"
          }`}
          aria-hidden="true"
        />

        {/* Bottom Ambient Vignette to integrate seamlessly with the website canvas */}
        <div
          className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/40 to-transparent"
          aria-hidden="true"
        />

        {/* Top subtle scrim for clean navbar readability */}
        <div
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#141414]/70 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. REAL SEMANTIC HTML TYPOGRAPHY CONTENT
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24 pt-28 sm:pt-32 pb-24 md:pb-28">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start"
            >
              {/* Category Eyebrow Pill */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white/95 text-xs sm:text-sm font-semibold tracking-wide mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-[#B66B70]" />
                <span>{isRtl ? currentSlide.categoryFa : currentSlide.categoryEn}</span>
              </div>

              {/* Major Editorial Headline */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.28] sm:leading-[1.2] tracking-tight drop-shadow-sm">
                {isRtl ? currentSlide.titleFa : currentSlide.titleEn}
              </h1>

              {/* Description Body */}
              <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl font-normal">
                {isRtl ? currentSlide.subtitleFa : currentSlide.subtitleEn}
              </p>

              {/* Action Buttons */}
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
                <Link
                  href={currentSlide.ctaLink}
                  onClick={(e) => {
                    if (currentSlide.ctaLink.startsWith("#")) {
                      e.preventDefault();
                      scrollToSection(currentSlide.ctaLink.replace("#", ""));
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 sm:py-4 rounded-lg bg-[#4F0001] hover:bg-[#680001] text-white text-sm sm:text-base font-bold border border-white/10 transition-colors shadow-sm"
                >
                  <span>{isRtl ? currentSlide.ctaTextFa : currentSlide.ctaTextEn}</span>
                  <svg
                    className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </Link>

                {currentSlide.ctaText2Fa && (
                  <Link
                    href={currentSlide.ctaLink2 || "#services"}
                    onClick={(e) => {
                      if (currentSlide.ctaLink2?.startsWith("#")) {
                        e.preventDefault();
                        scrollToSection(currentSlide.ctaLink2.replace("#", ""));
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-lg bg-black/40 hover:bg-white/10 text-white text-sm sm:text-base font-semibold border border-white/30 backdrop-blur-sm transition-colors"
                  >
                    <span>
                      {isRtl ? currentSlide.ctaText2Fa : currentSlide.ctaText2En}
                    </span>
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          4. SLIDE CONTROLS & PAGINATION (Discrete, Editorial & Accessible)
          ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute z-20 bottom-8 sm:bottom-12 inset-x-0 w-full max-w-[1600px] mx-auto px-6 sm:px-12 lg:px-24 flex items-center justify-between">
        {/* Slide Counter & Segmented Progress Bars */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-white/90 text-xs sm:text-sm font-bold tracking-widest font-mono">
            {toFaDigits(`0${currentSlideIndex + 1}`)}
            <span className="text-white/40 mx-1.5">/</span>
            <span className="text-white/50">{toFaDigits(`0${slides.length}`)}</span>
          </div>

          {/* Segmented Progress Indicators */}
          <div className="flex items-center gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={isRtl ? `رفتن به اسلاید ${idx + 1}` : `Go to slide ${idx + 1}`}
                className="group py-2 cursor-pointer focus:outline-none"
              >
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentSlideIndex
                      ? "w-8 sm:w-12 bg-[#B66B70]"
                      : "w-4 sm:w-6 bg-white/30 group-hover:bg-white/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Previous & Next Control Arrows */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={prevSlide}
            aria-label={isRtl ? "اسلاید قبلی" : "Previous slide"}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-black/40 hover:bg-white hover:text-[#1F1F1E] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm active:scale-95"
          >
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRtl ? "" : "rotate-180"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label={isRtl ? "اسلاید بعدی" : "Next slide"}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/25 bg-black/40 hover:bg-white hover:text-[#1F1F1E] text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm active:scale-95"
          >
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
