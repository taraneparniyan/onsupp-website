"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { scrollToSection } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";

const CLONE_COUNT = 7;
const TRANSITION_DURATION_MS = 550;
const STEP_INTERVAL_MS = 2500; // Rhythmic pause between automatic transitions

// Safe SSR layout effect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Service Definition & Canonical Data ───────────────────────────────────────

export interface ServiceItem {
  id: number;
  slug: string;
  href: string;
  tagFa: string;
  tagEn: string;
  titleFa: string;
  titleEn: string;
  image: string;
  objectPosition?: string;
}

const SERVICES_DATA: ServiceItem[] = [
  {
    id: 1,
    slug: "social-identity",
    href: "/services?category=social-identity",
    tagFa: "فضای مجازی و هویت",
    tagEn: "Social & Identity",
    titleFa: "مدیریت و هویت‌سازی فضای مجازی",
    titleEn: "Social Media & Brand Identity",
    image: "/images/services/social-identity.webp",
    objectPosition: "center center",
  },
  {
    id: 2,
    slug: "studio-production",
    href: "/services?category=studio-production",
    tagFa: "استودیو و تیزر",
    tagEn: "Studio & Film",
    titleFa: "تصویربرداری و استودیو",
    titleEn: "Studio Production & Videography",
    image: "/images/services/studio-production.webp",
    objectPosition: "center center",
  },
  {
    id: 3,
    slug: "animation-motion",
    href: "/services?category=animation-motion",
    tagFa: "انیمیشن و VFX",
    tagEn: "Dynamic Motion",
    titleFa: "انیمیشن و موشن گرافیک",
    titleEn: "Animation & Motion Graphics",
    image: "/images/services/animation-motion.webp",
    objectPosition: "center center",
  },
  {
    id: 4,
    slug: "web-development",
    href: "/services?category=web-development",
    tagFa: "تکنولوژی و وب",
    tagEn: "Web Engineering",
    titleFa: "طراحی سایت و وب‌اپلیکیشن",
    titleEn: "Custom Web Design & Apps",
    image: "/images/services/web-development.webp",
    objectPosition: "center center",
  },
  {
    id: 5,
    slug: "technical-seo",
    href: "/services?category=technical-seo",
    tagFa: "سئو و رشد ارگانیک",
    tagEn: "Technical SEO",
    titleFa: "سئو تکنیکال و رشد ارگانیک",
    titleEn: "Technical SEO & Organic Growth",
    image: "/images/services/technical-seo.webp",
    objectPosition: "center center",
  },
  {
    id: 6,
    slug: "crm-automation",
    href: "/services?category=crm-automation",
    tagFa: "اتوماسیون و فروش",
    tagEn: "CRM & Systems",
    titleFa: "استقرار CRM و اتوماسیون فروش",
    titleEn: "CRM Implementation & Automation",
    image: "/images/services/crm-automation.webp",
    objectPosition: "center center",
  },
  {
    id: 7,
    slug: "custom-software",
    href: "/services?category=custom-software",
    tagFa: "سامانه‌های سفارشی",
    tagEn: "Custom Software",
    titleFa: "برنامه‌نویسی و سامانه‌های اختصاصی",
    titleEn: "Custom Software & Web Systems",
    image: "/images/services/custom-software.webp",
    objectPosition: "center center",
  },
];

// ─── Rectangular Editorial Service Card with 20% Gray Gradient ───────────────

function RectangularServiceCard({
  service,
  isRtl,
  wasDraggedRef,
}: {
  service: ServiceItem;
  isRtl: boolean;
  wasDraggedRef?: React.MutableRefObject<boolean>;
}) {
  return (
    <div className="group relative h-full w-full select-none">
      <Link
        href={service.href}
        onClick={(e) => {
          if (wasDraggedRef?.current) {
            e.preventDefault();
            return;
          }
          if (service.href.includes("#") && scrollToSection(service.href)) {
            e.preventDefault();
          }
        }}
        className="relative flex flex-col justify-end h-[255px] sm:h-[270px] lg:h-[285px] xl:h-[295px] rounded-2xl sm:rounded-[22px] overflow-hidden border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.45)] hover:shadow-[0_16px_45px_rgba(0,0,0,0.65)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer block"
      >
        {/* Full-bleed background 3D image (80% completely clear and unobstructed) */}
        <Image
          src={service.image}
          alt={isRtl ? service.titleFa : service.titleEn}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 32vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ objectPosition: service.objectPosition || "center center" }}
          loading="eager"
        />

        {/* ── Gray Gradient covering approximately 20% of the rectangle ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28%] sm:h-[24%] lg:h-[21%] bg-gradient-to-t from-[#1A1D20]/95 via-[#2A2E32]/70 via-50% to-transparent"
        />

        {/* Card Content within the 20% gray gradient zone */}
        <div className="relative z-10 p-4 sm:p-5 flex items-end justify-between gap-3 w-full">
          <div className="min-w-0 flex-1">
            {/* Category Tag */}
            <span
              className={`block text-[10px] sm:text-[11px] font-semibold text-white/75 uppercase mb-1 tracking-wider ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? service.tagFa : service.tagEn}
            </span>

            {/* Service Title */}
            <h3
              className={`text-base sm:text-lg lg:text-[19px] font-bold text-white leading-snug tracking-tight drop-shadow-md group-hover:text-mint transition-colors line-clamp-2 ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? service.titleFa : service.titleEn}
            </h3>
          </div>

          {/* Minimalist Circular Arrow Button (Bottom-left in RTL) */}
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white shadow-md transition-all duration-300 group-hover:bg-white group-hover:text-black group-hover:scale-105">
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${
                isRtl
                  ? "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
                  : "rotate-90 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  isRtl
                    ? "M17 17L7 7M7 7H17M7 7V17"
                    : "M7 17L17 7M17 7H7M17 7V17"
                }
              />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Main Services Component ─────────────────────────────────────────────────

export default function Services({ initialServices }: { initialServices?: any[] }) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    if (Array.isArray(initialServices) && initialServices.length > 0) {
      return initialServices.map((s: any, idx: number) => ({
        id: s.id ?? idx + 1,
        slug: s.slug || `service-${s.id}`,
        href: `/services?category=${s.slug || s.id}`,
        tagFa: s.tagFa || s.title || "خدمات",
        tagEn: s.tagEn || s.titleEn || "Services",
        titleFa: s.title || "",
        titleEn: s.titleEn || "",
        image: s.imageUrl || "/images/services/web-development.webp",
        objectPosition: "center center",
      }));
    }
    return SERVICES_DATA;
  });

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/services`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: ServiceItem[] = data.map((s: any, idx: number) => ({
            id: s.id ?? idx + 1,
            slug: s.slug || `service-${s.id}`,
            href: `/services?category=${s.slug || s.id}`,
            tagFa: s.tagFa || s.title || "خدمات",
            tagEn: s.tagEn || s.titleEn || "Services",
            titleFa: s.title || "",
            titleEn: s.titleEn || "",
            image: s.imageUrl || "/images/services/web-development.webp",
            objectPosition: "center center",
          }));
          setServicesList(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const totalServices = servicesList.length;

  // Cloned items for seamless continuous stepping (1 full clone set before and after)
  const trackItems = useMemo(() => {
    const clonesBefore = servicesList.slice(-CLONE_COUNT);
    const clonesAfter = servicesList.slice(0, CLONE_COUNT);
    return [
      ...clonesBefore.map((s, i) => ({ ...s, trackKey: `clone-start-${i}-${s.id}` })),
      ...servicesList.map((s, i) => ({ ...s, trackKey: `real-${i}-${s.id}` })),
      ...clonesAfter.map((s, i) => ({ ...s, trackKey: `clone-end-${i}-${s.id}` })),
    ];
  }, []);

  const [trackIndex, setTrackIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);
  const transitionSafetyTimer = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Measured width of one slide + gap (exact horizontal step per card)
  const [step, setStep] = useState(0);

  // Pause autoplay on hover or touch
  const [isPaused, setIsPaused] = useState(false);

  const updateDimensions = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;
    const firstSlide = trackRef.current.children[0] as HTMLElement | undefined;
    if (!firstSlide) return;

    const slideRect = firstSlide.getBoundingClientRect();
    const slideWidth = slideRect.width;

    const trackStyle = window.getComputedStyle(trackRef.current);
    const gap =
      parseFloat(trackStyle.gap) ||
      parseFloat(trackStyle.columnGap) ||
      parseFloat(trackStyle.rowGap) ||
      24;

    const newStep = slideWidth + gap;
    if (newStep > 0) {
      setStep(newStep);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    updateDimensions();

    const handleResize = () => {
      updateDimensions();
    };

    window.addEventListener("resize", handleResize, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      ro = new ResizeObserver(() => {
        updateDimensions();
      });
      ro.observe(containerRef.current);
    }

    const timer = setTimeout(updateDimensions, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (ro) ro.disconnect();
      clearTimeout(timer);
    };
  }, [updateDimensions]);

  // Keep ref synchronized
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  // Safe stepping action with debouncing and instant snap protection
  const triggerStep = useCallback(
    (direction: 1 | -1) => {
      if (isTransitioningRef.current) return;

      if (transitionSafetyTimer.current) {
        clearTimeout(transitionSafetyTimer.current);
      }

      setIsTransitioning(true);
      isTransitioningRef.current = true;
      setTrackIndex((prev) => prev + direction);

      transitionSafetyTimer.current = setTimeout(() => {
        setIsTransitioning(false);
        isTransitioningRef.current = false;
      }, TRANSITION_DURATION_MS + 80);
    },
    []
  );

  const nextSlide = useCallback(() => {
    triggerStep(1);
  }, [triggerStep]);

  const prevSlide = useCallback(() => {
    triggerStep(-1);
  }, [triggerStep]);

  // Handle seamless teleporting when stepping into cloned boundaries
  const handleTransitionEnd = useCallback(
    (e?: React.TransitionEvent<HTMLDivElement>) => {
      if (e && e.target !== trackRef.current) return;

      if (transitionSafetyTimer.current) {
        clearTimeout(transitionSafetyTimer.current);
        transitionSafetyTimer.current = null;
      }

      setIsTransitioning(false);
      isTransitioningRef.current = false;

      // Teleport boundaries
      if (trackIndex >= CLONE_COUNT + totalServices) {
        setTrackIndex(CLONE_COUNT);
      } else if (trackIndex < CLONE_COUNT) {
        setTrackIndex(CLONE_COUNT + totalServices - 1);
      }
    },
    [trackIndex, totalServices]
  );

  // Autoplay loop with smooth pause on hover
  useEffect(() => {
    if (prefersReducedMotion || isPaused) return;

    const interval = setInterval(() => {
      triggerStep(1);
    }, STEP_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, isPaused, triggerStep]);

  // Touch Swipe Gesture Support
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const wasDraggedRef = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    wasDraggedRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    if (Math.abs(touchDeltaX.current) > 10) {
      wasDraggedRef.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current !== null) {
      const delta = touchDeltaX.current;
      const threshold = 40;

      if (Math.abs(delta) > threshold) {
        if (delta < 0) {
          if (isRtl) prevSlide();
          else nextSlide();
        } else {
          if (isRtl) nextSlide();
          else prevSlide();
        }
      }

      setTimeout(() => {
        wasDraggedRef.current = false;
      }, 50);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  }, [isRtl, nextSlide, prevSlide]);

  // Pointer / Mouse Drag Support
  const isPointerDown = useRef(false);
  const pointerStartX = useRef<number | null>(null);
  const pointerDeltaX = useRef<number>(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsPaused(true);
    isPointerDown.current = true;
    pointerStartX.current = e.clientX;
    pointerDeltaX.current = 0;
    wasDraggedRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown.current || pointerStartX.current === null) return;
    pointerDeltaX.current = e.clientX - pointerStartX.current;
    if (Math.abs(pointerDeltaX.current) > 10) {
      wasDraggedRef.current = true;
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (isPointerDown.current && pointerStartX.current !== null) {
      const delta = pointerDeltaX.current;
      const threshold = 50;

      if (Math.abs(delta) > threshold) {
        if (delta < 0) {
          if (isRtl) prevSlide();
          else nextSlide();
        } else {
          if (isRtl) nextSlide();
          else prevSlide();
        }
      }

      setTimeout(() => {
        wasDraggedRef.current = false;
      }, 50);
    }
    isPointerDown.current = false;
    pointerStartX.current = null;
    pointerDeltaX.current = 0;
    setIsPaused(false);
  }, [isRtl, nextSlide, prevSlide]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (isRtl) nextSlide();
        else prevSlide();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (isRtl) prevSlide();
        else nextSlide();
      }
    },
    [isRtl, nextSlide, prevSlide]
  );

  return (
    <section
      id="services"
      aria-label={isRtl ? "خدمات تخصصی آن‌ساپ" : "OnSupp Core Capabilities"}
      className="relative w-full py-20 sm:py-24 lg:py-28 overflow-hidden bg-[#160B0E] dark:bg-[#12080B] text-white border-y border-white/[0.08] transition-colors duration-500"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative z-10 w-full max-w-[1520px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header (Editorial High-Contrast Style, Strictly No Star) ── */}
        <ScrollReveal once viewportMargin="0px">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-8 sm:mb-12">
            <div>
              {/* Eyebrow - Matching About Us Section Pattern */}
              <div className="inline-flex items-center gap-3 mb-2 text-xs sm:text-sm font-bold tracking-widest text-[#D4A5A8] uppercase">
                <span className="h-px w-10 bg-[#D4A5A8]/60" />
                <span>{isRtl ? "خدمات تخصصی" : "SELECTED SERVICES"}</span>
              </div>

              {/* Headline (Clean without any star character) */}
              <h2
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-white ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl ? "معماری جامع خدمات دیجیتال" : "CORE CAPABILITIES"}
              </h2>
            </div>

            {/* Trailing View All Link & Navigation Arrows */}
            <div className="flex items-center gap-5 self-start sm:self-end">
              <Link
                href="/services"
                className={`group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wider text-white/80 hover:text-white uppercase transition-colors ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                <span>{isRtl ? "مشاهده همه خدمات" : "VIEW ALL SERVICES"}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    isRtl ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Discreet Prev & Next Navigation Buttons */}
              <div className="flex items-center gap-1.5 border-s border-white/15 ps-4">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label={isRtl ? "خدمت قبلی" : "Previous service"}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-all active:scale-95 cursor-pointer"
                >
                  <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label={isRtl ? "خدمت بعدی" : "Next service"}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white bg-white/10 backdrop-blur-sm hover:bg-white/25 transition-all active:scale-95 cursor-pointer"
                >
                  <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Continuous Horizontal Carousel Track (Stepped 3-Card Window on Desktop) ── */}
        <div
          ref={containerRef}
          className="w-full overflow-hidden pt-2 pb-2 -my-2 select-none cursor-grab active:cursor-grabbing focus:outline-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          role="region"
          aria-label={isRtl ? "اسلایدر خدمات آن‌ساپ" : "OnSupp Services Slider"}
        >
          <div
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform:
                step > 0
                  ? `translateX(${isRtl ? "" : "-"}${trackIndex * step}px)`
                  : undefined,
              transition:
                isTransitioning && !prefersReducedMotion
                  ? `transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                  : "none",
            }}
            className="flex w-full items-stretch gap-5 md:gap-5 lg:gap-6 will-change-transform"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {trackItems.map((service) => (
              <div
                key={service.trackKey}
                className="shrink-0 flex-shrink-0 w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2*1.5rem)/3)] flex flex-col relative"
                dir={isRtl ? "rtl" : "ltr"}
              >
                <RectangularServiceCard
                  service={service}
                  isRtl={isRtl}
                  wasDraggedRef={wasDraggedRef}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
