"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { scrollToSection } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";

export interface HeroSlideItem {
  id?: number | string;
  src: string;
  mobileSrc?: string;
  altEn: string;
  altFa: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  ctaTextFa?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  ctaText2Fa?: string;
  ctaText2En?: string;
  ctaLink2?: string;
  position?: number;
}

export const CANONICAL_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "cinema-studio",
    src: "/images/hero/hero-media-studio.webp",
    altEn: "OnSupp cinema production, audio podcast studio and dynamic media showcase",
    altFa: "استودیو تخصصی تصویربرداری، تولید تیزر سینمایی و پادکست آن‌ساپ",
    titleFa: "تولید رسانه‌ای، سینمایی و استودیو اختصاصی",
    titleEn: "Cinematic Production & Bespoke Studio Media",
    descFa: "روایت بصری فاخر، تصویربرداری صنعتی، پادکست و تیزرهای تبلیغاتی با پیشرفته‌ترین تجهیزات سینمایی",
    descEn: "Elevating brand storytelling through cinema-grade cinematography, podcast studio recording, and high-impact commercial media.",
    ctaTextFa: "مشاهده خدمات",
    ctaTextEn: "Explore Services",
    ctaLink: "/services",
    ctaText2Fa: "درباره ما",
    ctaText2En: "About Us",
    ctaLink2: "/about",
    position: 0,
  },
  {
    id: "tech-engineering",
    src: "/images/hero/hero-tech-engineering.webp",
    altEn: "OnSupp scalable enterprise software engineering, web design and data growth",
    altFa: "مهندسی نرم‌افزار، توسعه وب‌سایت‌های سازمانی، سئو تکنیکال و CRM آن‌ساپ",
    titleFa: "مهندسی نرم‌افزار، پلتفرم‌های وب و اتوماسیون داده‌محور",
    titleEn: "Enterprise Web Engineering & Intelligent Data Systems",
    descFa: "معماری سیستم‌های مدرن با Next.js، سئو تکنیکال، اتوماسیون CRM و سامانه‌های ابری مقیاس‌پذیر",
    descEn: "Architecting high-performance Next.js platforms, technical SEO dominance, and mission-critical enterprise CRM workflows.",
    ctaTextFa: "مشاهده خدمات",
    ctaTextEn: "Explore Services",
    ctaLink: "/services",
    ctaText2Fa: "درباره ما",
    ctaText2En: "About Us",
    ctaLink2: "/about",
    position: 1,
  },
];

export default function Hero() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [slides, setSlides] = useState<HeroSlideItem[]>(CANONICAL_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [, setLoading] = useState(true);
  const [, setApiError] = useState<string | null>(null);

  // Sync slides with backend Hero API
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchHeroSlides() {
      try {
        setLoading(true);
        const res = await fetch(`${BACKEND_URL}/api/v1/hero`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`خطای سرور: کد وضعیت ${res.status}`);
        }

        const data = await res.json();
        if (!isMounted) return;

        if (Array.isArray(data) && data.length > 0) {
          // Filter valid slides (non-empty titles & active)
          const valid = data.filter(
            (item: any) =>
              item.isActive !== false &&
              (item.title?.trim() || item.titleEn?.trim())
          );

          if (valid.length > 0) {
            const mappedSlides: HeroSlideItem[] = valid
              .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
              .map((item: any, idx: number) => {
                const fallbackImage =
                  idx % 2 === 0
                    ? "/images/hero/hero-media-studio.webp"
                    : "/images/hero/hero-tech-engineering.webp";

                let src = item.imageUrl?.trim() || fallbackImage;
                if (src.startsWith("uploads/")) {
                  src = `/${src}`;
                }

                return {
                  id: item.id ?? idx,
                  src,
                  altFa: item.imageAlt?.trim() || item.title?.trim() || "اسلاید معرفی آن‌ساپ",
                  altEn: item.imageAlt?.trim() || item.titleEn?.trim() || "OnSupp Hero Showcase",
                  titleFa: item.title?.trim() || item.titleEn?.trim() || "",
                  titleEn: item.titleEn?.trim() || item.title?.trim() || "",
                  descFa: item.subtitle?.trim() || "",
                  descEn: item.subtitleEn?.trim() || "",
                  ctaTextFa: item.ctaText?.trim(),
                  ctaTextEn: item.ctaTextEn?.trim(),
                  ctaLink: item.ctaLink?.trim() || "/services",
                  ctaText2Fa: item.ctaText2?.trim(),
                  ctaText2En: item.ctaText2En?.trim(),
                  ctaLink2: item.ctaLink2?.trim() || "/about",
                  position: item.position ?? idx,
                };
              });

            setSlides(mappedSlides);
            setApiError(null);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // Graceful fallback to verified canonical slides
          setApiError(err.message || "عدم برقراری ارتباط با وب‌سرویس هیرو");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHeroSlides();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Safe index within bounds
  const safeCurrentIndex = currentIndex < slides.length ? currentIndex : 0;
  const currentSlide = slides[safeCurrentIndex] || CANONICAL_HERO_SLIDES[0];
  const isTechSlide = currentSlide.titleFa.includes("مهندسی نرم‌افزار");

  // Automatic slideshow timer: 5.5s per slide with graceful crossfade
  useEffect(() => {
    if (prefersReducedMotion || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, slides.length]);

  return (
    <section
      aria-label={isRtl ? "نمایشگاه پروژه‌های منتخب آن‌ساپ" : "OnSupp Portfolio Showcase"}
      aria-roledescription="carousel"
      className="relative w-full h-[85vh] sm:h-[90vh] lg:h-[100dvh] min-h-[560px] max-h-[1080px] overflow-hidden bg-[#38534A] dark:bg-[#17221E] select-none"
    >
      {/* ─── Immersive Slideshow Imagery (Dual Mobile/Desktop Architecture) ─── */}
      <div className="absolute inset-0 w-full h-full">
        {slides.map((slide, index) => {
          const isActive = index === safeCurrentIndex;

          return (
            <div
              key={`${slide.id ?? index}-${slide.src}`}
              aria-hidden={!isActive}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1200 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Desktop / Default Image (or sole image if mobileSrc not explicitly set) */}
              <Image
                src={slide.src}
                alt={isRtl ? slide.altFa : slide.altEn}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="100vw"
                className={`object-cover object-center w-full h-full ${
                  slide.mobileSrc ? "hidden sm:block" : "block"
                }`}
                quality={90}
              />

              {/* Dedicated Mobile Image (Activated automatically when mobileSrc is configured) */}
              {slide.mobileSrc && (
                <Image
                  src={slide.mobileSrc}
                  alt={isRtl ? slide.altFa : slide.altEn}
                  fill
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="100vw"
                  className="block sm:hidden object-cover object-center w-full h-full"
                  quality={90}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Atmospheric Bottom Gradient Overlay (Upward Gradient for Perfect Legibility in Mobile & Desktop) ─── */}
      <div
        aria-hidden="true"
        className="hero-bottom-scrim absolute inset-x-0 bottom-0 h-[68%] sm:h-88 lg:h-[440px] pointer-events-none z-20 transition-all duration-500 bg-gradient-to-t from-[#38534A] via-[#38534A]/85 via-50% to-transparent dark:from-[#17221E] dark:via-[#17221E]/90 dark:via-50% dark:to-transparent"
      />

      {/* ─── Animated Text Overlay (Bottom-Aligned on Mobile, Vertically Centered on Desktop) ─── */}
      <div
        className="absolute inset-0 z-30 pointer-events-none flex items-end sm:items-center pb-16 sm:pb-0"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <div
          className={`mx-auto w-full max-w-[1680px] flex items-center transition-all duration-500 ${
            isRtl
              ? "ps-4 sm:ps-7 md:ps-9 lg:ps-12 xl:ps-14 pe-6 sm:pe-12 lg:pe-20"
              : "px-6 sm:px-12 lg:px-20 xl:px-24"
          }`}
        >
          <div
            className={`max-w-2xl lg:max-w-3xl w-full transition-transform duration-500 ease-out ${
              isRtl ? "text-right me-auto" : "text-left me-auto"
            } ${
              isRtl && isTechSlide
                ? "translate-x-3 sm:translate-x-6 md:translate-x-10 lg:translate-x-16 xl:translate-x-24 2xl:translate-x-32"
                : ""
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`hero-text-${safeCurrentIndex}-${lang}-${currentSlide.id ?? ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  y: prefersReducedMotion ? 0 : -8,
                  transition: { duration: 0.25, ease: "easeIn" },
                }}
                className="space-y-2.5 sm:space-y-3.5"
              >
                {/* Main Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-[44px] xl:text-5xl font-display font-bold text-white leading-[1.25] sm:leading-[1.22] tracking-tight [text-shadow:_0_2px_14px_rgba(0,0,0,0.55)]"
                >
                  {isRtl ? currentSlide.titleFa : currentSlide.titleEn}
                </motion.h1>

                {/* Short Supporting Description */}
                <motion.p
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: 0.16,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`text-sm sm:text-base md:text-lg text-white/90 leading-relaxed font-normal max-w-xl sm:max-w-2xl ms-0 me-auto [text-shadow:_0_1px_8px_rgba(0,0,0,0.45)] ${
                    isRtl ? "text-right" : "text-left"
                  }`}
                >
                  {isRtl ? currentSlide.descFa : currentSlide.descEn}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            {/* ─── Hero Call-To-Action (CTA) Action Buttons ─── */}
            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 pointer-events-auto"
            >
              {/* Primary CTA: Dynamic text or default "مشاهده خدمات" */}
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                className="shrink-0"
              >
                <Link
                  href={currentSlide.ctaLink || "/services"}
                  className={`group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#38534A] hover:bg-[#2C423B] text-[#F8F9FA] border border-[#8AB3A0]/35 shadow-[0_12px_28px_-6px_rgba(56,83,74,0.5),_inset_0_1px_1px_rgba(255,255,255,0.2)] text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  <span>
                    {isRtl
                      ? currentSlide.ctaTextFa || "مشاهده خدمات"
                      : currentSlide.ctaTextEn || "Explore Services"}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>

              {/* Secondary CTA: Dynamic text or default "درباره ما" */}
              <motion.div
                whileHover={prefersReducedMotion ? undefined : { scale: 1.03, y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                className="shrink-0"
              >
                <Link
                  href={currentSlide.ctaLink2 || "/about"}
                  onClick={(e) => {
                    const targetLink = currentSlide.ctaLink2 || "/about";
                    if (targetLink === "#about" || targetLink === "/about" || targetLink === "/#about") {
                      if (scrollToSection("about")) {
                        e.preventDefault();
                      }
                    }
                  }}
                  className={`group inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.16] text-[#F8F9FA] border border-white/22 hover:border-white/40 backdrop-blur-md shadow-sm text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  <span>
                    {isRtl
                      ? currentSlide.ctaText2Fa || "درباره ما"
                      : currentSlide.ctaText2En || "About Us"}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-all duration-300 ${
                      isRtl ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Slide Progress Indicators (Only rendered when > 1 slide) ─── */}
      {slides.length > 1 && (
        <div
          className={`absolute bottom-4 sm:bottom-8 z-30 flex items-center gap-1.5 sm:gap-2 pointer-events-auto ${
            isRtl ? "start-6 sm:start-12 lg:start-20" : "end-6 sm:end-12 lg:end-20"
          }`}
          aria-label={isRtl ? "ناوبری اسلایدهای هیرو" : "Hero slides navigation"}
        >
          {slides.map((slide, idx) => {
            const isSelected = idx === safeCurrentIndex;
            return (
              <button
                key={`indicator-${slide.id ?? idx}`}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={
                  isRtl
                    ? `رفتن به اسلاید ${idx + 1}: ${slide.titleFa || slide.titleEn}`
                    : `Go to slide ${idx + 1}: ${slide.titleEn || slide.titleFa}`
                }
                className={`h-1.5 rounded-full transition-all duration-400 cursor-pointer ${
                  isSelected
                    ? "w-8 sm:w-10 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
                    : "w-2 sm:w-2.5 bg-white/35 hover:bg-white/60"
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
