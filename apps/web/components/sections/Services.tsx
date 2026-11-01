"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";

const AUTOPLAY_INTERVAL_MS = 4000;
const CLONE_COUNT = 4;
const TRANSITION_DURATION_MS = 600;

// Safe SSR layout effect
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// ─── Types ───────────────────────────────────────────────────────────────────

type ServiceItem = {
  id: number;
  slug: string;
  href: string;
  tagFa: string;
  tagEn: string;
  titleFa: string;
  titleEn: string;
  subtitleFa: string;
  subtitleEn: string;
  featuresFa: string[];
  featuresEn: string[];
  iconType: "web" | "seo" | "instagram" | "video" | "animation" | "crm" | "software";
};

// ─── 7 Core Services ─────────────────────────────────────────────────────────

const ALL_SERVICES: ServiceItem[] = [
  {
    id: 1,
    slug: "web-design",
    href: "#contact",
    tagFa: "وبسایت",
    tagEn: "Web Design",
    titleFa: "طراحی سایت و وب‌اپلیکیشن",
    titleEn: "Custom Web Design & Apps",
    subtitleFa: "طراحی و توسعه وب‌سایت‌ها و وب‌اپلیکیشن‌های سریع و واکنش‌گرا با معماری Next.js و تمرکز بر تجربه کاربری روان و بهبود نرخ تبدیل.",
    subtitleEn: "Fast, responsive websites and web applications built with Next.js and React, focused on seamless UX and conversion.",
    featuresFa: ["طراحی رابط کاربری اختصاصی UI/UX", "کدنویسی استاندارد با Next.js و React", "بهینه‌سازی سرعت و شاخص‌های Core Web Vitals"],
    featuresEn: ["Bespoke UI/UX design systems", "Modern Next.js & React stack", "Core Web Vitals optimization"],
    iconType: "web",
  },
  {
    id: 2,
    slug: "seo",
    href: "#contact",
    tagFa: "سئو",
    tagEn: "SEO Growth",
    titleFa: "سئو تکنیکال و رشد ارگانیک",
    titleEn: "Technical SEO & Organic Growth",
    subtitleFa: "بهینه‌سازی ساختار فنی سایت، تدوین استراتژی کلمات کلیدی هدفمند و بهبود جایگاه ارگانیک برای جذب ورودی مرتبط و پایدار.",
    subtitleEn: "Technical audits, structured content strategy, and targeted keyword optimization to grow qualified organic traffic.",
    featuresFa: ["آدیت فنی و اصلاح ساختار سایت", "پژوهش کلمات کلیدی و تحلیل رقبا", "تدوین استراتژی محتوا و اعتبار دامنه"],
    featuresEn: ["Comprehensive technical SEO audits", "Keyword research & competitor analysis", "Content strategy & authority building"],
    iconType: "seo",
  },
  {
    id: 3,
    slug: "instagram",
    href: "#contact",
    tagFa: "فضای مجازی",
    tagEn: "Social & Identity",
    titleFa: "مدیریت و هویت‌سازی فضای مجازی",
    titleEn: "Social Media & Brand Identity",
    subtitleFa: "طراحی برند و مدیریت استراتژی محتوا، طراحی محتوای گرافیکی و سینمایی پویا و مدیریت جامع صفحات مجازی برای رشد هدفمند و تعامل با مخاطب.",
    subtitleEn: "Brand design & strategy, dynamic visual content creation, and comprehensive social media management.",
    featuresFa: ["طراحی برند و مدیریت استراتژی", "طراحی محتوای گرافیکی و سینمایی پویا", "مدیریت و کنترل صفحه مجازی"],
    featuresEn: ["Brand design & strategy management", "Dynamic graphic & cinematic content design", "Social page management & monitoring"],
    iconType: "instagram",
  },
  {
    id: 4,
    slug: "video-production",
    href: "#contact",
    tagFa: "تصویربرداری",
    tagEn: "Studio & Video",
    titleFa: "تصویربرداری و استودیو",
    titleEn: "Studio Production & Videography",
    subtitleFa: "تصویربرداری صنعتی و تبلیغاتی با استانداردهای سینمایی، ساخت پادکست‌های تعاملی و تدوین و پست‌تولید حرفه‌ای.",
    subtitleEn: "Commercial & industrial videography, interactive podcasts, and structured post-production.",
    featuresFa: ["تصویربرداری صنعتی و تبلیغاتی", "ساخت پادکست و محتوای بلند تعاملی", "تدوین و پست‌تولید"],
    featuresEn: ["Commercial & industrial videography", "Podcasts & interactive long-form content", "Editing & advanced post-production"],
    iconType: "video",
  },
  {
    id: 5,
    slug: "animation",
    href: "#contact",
    tagFa: "انیمیشن",
    tagEn: "Animation & Motion",
    titleFa: "انیمیشن و موشن گرافیک",
    titleEn: "Animation & Motion Graphics",
    subtitleFa: "تولید انیمیشن‌های دوبعدی و سه‌بعدی، جلوه‌های ویژه سینمایی و موشن‌گرافیک‌های صنعتی، آموزشی و تعاملی برای معرفی شفاف خدمات و محصولات.",
    subtitleEn: "2D & 3D character animation, cinematic visual effects (VFX), and interactive motion graphics.",
    featuresFa: ["انیمیشن دوبعدی و سه‌بعدی", "جلوه‌های ویژه سینمایی", "موشن گرافیک صنعتی، آموزشی و تعاملی"],
    featuresEn: ["2D & 3D animation", "Cinematic visual effects (VFX)", "Industrial, educational & interactive motion"],
    iconType: "animation",
  },
  {
    id: 6,
    slug: "crm",
    href: "#contact",
    tagFa: "CRM",
    tagEn: "CRM Systems",
    titleFa: "استقرار CRM و اتوماسیون فروش",
    titleEn: "CRM Implementation & Automation",
    subtitleFa: "پیاده‌سازی و سفارشی‌سازی سیستم مدیریت ارتباط با مشتری، ساختاردهی به فرآیند پیگیری سرنخ‌ها و گزارش‌گیری شفاف فروش.",
    subtitleEn: "CRM setup, workflow automation, lead tracking, and structured sales pipeline reporting for growing teams.",
    featuresFa: ["راه‌اندازی و پیکربندی اختصاصی CRM", "اتوماسیون ثبت و پیگیری سرنخ‌های فروش", "داشبوردهای گزارش‌گیری عملکرد تیم فروش"],
    featuresEn: ["Tailored CRM configuration", "Automated lead follow-up workflows", "Sales pipeline & performance reporting"],
    iconType: "crm",
  },
  {
    id: 7,
    slug: "programming",
    href: "#contact",
    tagFa: "برنامه‌نویسی",
    tagEn: "Custom Software",
    titleFa: "برنامه‌نویسی و سامانه‌های اختصاصی",
    titleEn: "Custom Software & Web Systems",
    subtitleFa: "توسعه سامانه‌های تحت وب، پنل‌های مدیریتی اختصاصی و یکپارچه‌سازی امن با وب‌سرویس‌ها و درگاه‌های سازمانی.",
    subtitleEn: "Full-stack web software engineering, custom management portals, database design, and secure API integrations.",
    featuresFa: ["توسعه Full-Stack اختصاصی و مقیاس‌پذیر", "طراحی ساختار دیتابیس و پنل مدیریتی", "اتصال امن به APIها و سرویس‌های بیرونی"],
    featuresEn: ["Scalable full-stack development", "Database & admin portal architecture", "Secure third-party API integrations"],
    iconType: "software",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toFaDigits = (num: number): string => {
  const faDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .padStart(2, "0")
    .replace(/\d/g, (d) => faDigits[parseInt(d, 10)]);
};

// ─── Service Icons ───────────────────────────────────────────────────────────

const ServiceIcon = ({ type }: { type: ServiceItem["iconType"] }) => {
  switch (type) {
    case "web":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <circle cx="6" cy="7" r="1" fill="currentColor" />
          <circle cx="9" cy="7" r="1" fill="currentColor" />
        </svg>
      );
    case "seo":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <polyline points="11 8 13 10 11 14" />
        </svg>
      );
    case "instagram":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "video":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "animation":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "crm":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "software":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" strokeWidth="1.5" />
        </svg>
      );
  }
};

// ─── Service Card Component ──────────────────────────────────────────────────

const ServiceCard = React.memo(function ServiceCard({
  service,
  isRtl,
}: {
  service: ServiceItem;
  isRtl: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.28, ease: EASE_PREMIUM },
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      className="w-full h-full relative z-10 hover:z-20"
    >
      <Link
        href={service.href}
        onClick={(e) => {
          if (service.href.includes("#") && scrollToSection(service.href)) {
            e.preventDefault();
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col justify-between min-h-[360px] sm:min-h-[380px] h-full rounded-2xl sm:rounded-3xl glass-panel glass-panel-hover p-6 sm:p-7 overflow-hidden block w-full transition-all duration-300"
      >
        {/* Subtle Ambient Background Glow on Hover */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.2 : 0.9,
          }}
          transition={{ duration: 0.45, ease: EASE_PREMIUM }}
          className={`absolute -top-20 ${
            isRtl ? "-left-20" : "-right-20"
          } w-48 h-48 rounded-full bg-lime/[0.08] blur-3xl pointer-events-none`}
        />

        {/* Top Accent Beam Line (Glass light edge) */}
        <motion.div
          initial={false}
          animate={{
            opacity: isHovered ? 1 : 0.4,
            scaleX: isHovered ? 1 : 0.6,
          }}
          transition={{ duration: 0.35, ease: EASE_PREMIUM }}
          className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-lime/50 to-transparent pointer-events-none origin-center"
        />

        <div>
          {/* Top Meta Bar */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              {/* Icon Container with Soft Neumorphic Inset / Bevel & Micro-interaction */}
              <motion.div
                animate={
                  isHovered && !prefersReducedMotion
                    ? { scale: 1.08, rotate: [0, -2, 2, 0] }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 0.35, ease: EASE_PREMIUM }}
                className="flex h-11 w-11 items-center justify-center rounded-xl neumorph-convex border border-white/10 text-white transition-all duration-300 group-hover:border-lime/40 group-hover:text-lime shadow-md"
              >
                <ServiceIcon type={service.iconType} />
              </motion.div>

              {/* Category Pill with Frosted Glass Pill */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.05] backdrop-blur-md border border-white/10 text-[11px] font-semibold text-white/60 group-hover:text-white/90 group-hover:border-white/20 shadow-inner transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-lime/60 group-hover:bg-lime transition-colors" />
                {isRtl ? service.tagFa : service.tagEn}
              </span>
            </div>

            {/* Corner Arrow Link Icon with soft Neumorphic Convex style */}
            <motion.div
              animate={
                isHovered && !prefersReducedMotion
                  ? { x: isRtl ? -2 : 2, y: -2 }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 0.25, ease: EASE_PREMIUM }}
              className="flex h-8 w-8 items-center justify-center rounded-lg neumorph-concave border border-white/10 text-white/50 transition-all duration-300 group-hover:text-lime group-hover:border-lime/40 shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7m10 0v10" />
              </svg>
            </motion.div>
          </div>

          {/* Bold Service Title */}
          <h3 className="font-display text-lg sm:text-xl lg:text-[22px] font-bold leading-tight text-white transition-colors duration-300 group-hover:text-white">
            {isRtl ? service.titleFa : service.titleEn}
          </h3>

          {/* Description */}
          <p className="mt-2.5 text-xs sm:text-[13px] leading-relaxed text-foreground/65 transition-colors duration-300 group-hover:text-foreground/80 line-clamp-2">
            {isRtl ? service.subtitleFa : service.subtitleEn}
          </p>

          {/* 3 Compact Feature Bullets */}
          <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col gap-2">
            {(isRtl ? service.featuresFa : service.featuresEn).map((feat, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-[11px] sm:text-xs text-foreground/60 group-hover:text-foreground/80 transition-colors"
              >
                <svg className="w-3.5 h-3.5 text-lime/80 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Action Strip */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/50 group-hover:text-lime transition-colors">
            {isRtl ? "بررسی و ثبت سفارش" : "Explore Service"}
          </span>

          <motion.span
            animate={
              isHovered && !prefersReducedMotion
                ? { x: isRtl ? -3 : 3 }
                : { x: 0 }
            }
            transition={{ duration: 0.25, ease: EASE_PREMIUM }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-lime"
          >
            <svg
              className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
});

// ─── Main Services Component ─────────────────────────────────────────────────

export default function Services() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isInView, setIsInView] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetSafetyTimeout = useRef<NodeJS.Timeout | null>(null);

  const totalServices = ALL_SERVICES.length;

  // Build the circular track with clones: [CLONE_COUNT at start, 7 real items, CLONE_COUNT at end]
  const trackItems = useMemo(() => {
    const clonesBefore = ALL_SERVICES.slice(-CLONE_COUNT);
    const clonesAfter = ALL_SERVICES.slice(0, CLONE_COUNT);
    return [
      ...clonesBefore.map((s, i) => ({ ...s, trackKey: `clone-start-${i}-${s.id}` })),
      ...ALL_SERVICES.map((s, i) => ({ ...s, trackKey: `real-${i}-${s.id}` })),
      ...clonesAfter.map((s, i) => ({ ...s, trackKey: `clone-end-${i}-${s.id}` })),
    ];
  }, []);

  // Track state: trackIndex starts at CLONE_COUNT (4) which points to real item 0
  const [trackIndex, setTrackIndex] = useState(CLONE_COUNT);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isTransitioningRef = useRef(false);

  // Active logical service index (0..6)
  const activeIndex = ((trackIndex - CLONE_COUNT) % totalServices + totalServices) % totalServices;

  // Measured width of one slide + gap (the exact horizontal step per card)
  const [step, setStep] = useState(0);

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
      24;

    const newStep = slideWidth + gap;
    if (newStep > 0) {
      setStep(newStep);
    }
  }, []);

  // Measure on layout / resize
  useIsomorphicLayoutEffect(() => {
    updateDimensions();
  }, [updateDimensions]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => {
      // Temporarily disable transition during resize to prevent animation artifacts
      setIsTransitioning(false);
      isTransitioningRef.current = false;
      updateDimensions();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [updateDimensions]);

  // Clean transition reset when language/direction switches
  useEffect(() => {
    setIsTransitioning(false);
    isTransitioningRef.current = false;
  }, [isRtl]);

  // Transition handlers
  const nextSlide = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev + 1);

    if (resetSafetyTimeout.current) clearTimeout(resetSafetyTimeout.current);
    resetSafetyTimeout.current = setTimeout(() => {
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION_MS + 150);
  }, []);

  const prevSlide = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev - 1);

    if (resetSafetyTimeout.current) clearTimeout(resetSafetyTimeout.current);
    resetSafetyTimeout.current = setTimeout(() => {
      isTransitioningRef.current = false;
    }, TRANSITION_DURATION_MS + 150);
  }, []);

  const goToSlide = useCallback((targetIndex: number) => {
    if (isTransitioningRef.current) return;
    const targetTrackIndex = CLONE_COUNT + targetIndex;
    if (targetTrackIndex === trackIndex) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);
    setTrackIndex(targetTrackIndex);
  }, [trackIndex]);

  // Seamless boundary wrap when transition finishes
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;

    isTransitioningRef.current = false;

    setTrackIndex((current) => {
      if (current >= CLONE_COUNT + totalServices) {
        // Slid past the last real item into the clones: snap back to the start clones seamlessly
        setIsTransitioning(false);
        return current - totalServices;
      } else if (current < CLONE_COUNT) {
        // Slid before the first real item into the leading clones: snap forward to matching real item
        setIsTransitioning(false);
        return current + totalServices;
      }
      setIsTransitioning(false);
      return current;
    });
  };

  // Touch Swipe handlers
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
    setIsTouching(true);
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current !== null) {
      const delta = touchDeltaX.current;
      const swipeThreshold = 40;
      if (isRtl) {
        if (delta > swipeThreshold) {
          nextSlide();
        } else if (delta < -swipeThreshold) {
          prevSlide();
        }
      } else {
        if (delta < -swipeThreshold) {
          nextSlide();
        } else if (delta > swipeThreshold) {
          prevSlide();
        }
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;

    touchTimeoutRef.current = setTimeout(() => {
      setIsTouching(false);
    }, 500);
  }, [nextSlide, prevSlide, isRtl]);

  // IntersectionObserver to pause autoplay when scrolled out of view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Main Autoplay Effect: slides by exactly 1 card every 4s, pauses on hover, touch, or reduced motion
  useEffect(() => {
    if (prefersReducedMotion || !isInView || isHovered || isTouching) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      nextSlide();
    }, AUTOPLAY_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    prefersReducedMotion,
    isInView,
    isHovered,
    isTouching,
    trackIndex,
    nextSlide,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (touchTimeoutRef.current) clearTimeout(touchTimeoutRef.current);
      if (resetSafetyTimeout.current) clearTimeout(resetSafetyTimeout.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="w-full px-2 sm:px-[10px] py-16 sm:py-20 lg:py-24 relative overflow-hidden bg-[#141719] border-b border-white/5"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setIsHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") setIsHovered(false);
      }}
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 start-1/6 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 end-1/6 w-[350px] h-[350px] bg-mint/5 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">
        <ScrollReveal>
          {/* ── Section Header ───────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
            <div>
              <div className="inline-flex items-center gap-3 text-sm font-bold tracking-widest text-mint uppercase">
                <span className="h-px w-10 bg-mint/50" />
                <span>{isRtl ? "خدمات تخصصی آن‌ساپ" : "Core Capabilities"}</span>
              </div>
              <h2 className="mt-4 sm:mt-6 font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                {isRtl ? "معماری جامع خدمات دیجیتال" : "Engineered for Digital Growth"}
              </h2>
            </div>

            {/* Desktop Navigation Controls (Slide Dots & Arrows) */}
            <div
              className="hidden lg:flex items-center gap-4 self-end"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="flex items-center gap-2">
                {Array.from({ length: totalServices }).map((_, idx) => (
                  <motion.button
                    key={idx}
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => goToSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      activeIndex === idx
                        ? "w-8 bg-lime shadow-[0_0_10px_rgba(178,248,0,0.4)]"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                  onClick={prevSlide}
                  aria-label={isRtl ? "اسلاید قبلی" : "Previous slide"}
                  className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl glass-panel text-white/75 transition-all duration-200 hover:border-lime/40 hover:text-lime shadow-lg cursor-pointer"
                >
                  <svg className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
                  onClick={nextSlide}
                  aria-label={isRtl ? "اسلاید بعدی" : "Next slide"}
                  className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl glass-panel text-white/75 transition-all duration-200 hover:border-lime/40 hover:text-lime shadow-lg cursor-pointer"
                >
                  <svg className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          {/* ── Continuous Horizontal Carousel Track (Digikala Style) ── */}
          <div
            ref={containerRef}
            className="w-full overflow-hidden pt-3.5 pb-2 -mt-3.5 select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
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
                    ? `transform ${TRANSITION_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                    : "none",
              }}
              className="flex w-full items-stretch gap-6 xl:gap-8 will-change-transform"
              dir={isRtl ? "rtl" : "ltr"}
            >
              {trackItems.map((service) => (
                <div
                  key={service.trackKey}
                  className="shrink-0 flex-shrink-0 w-full lg:w-[calc((100%-2*1.5rem)/3)] xl:w-[calc((100%-2*2rem)/3)] flex flex-col relative hover:z-20 transition-all duration-200"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  <ServiceCard service={service} isRtl={isRtl} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Mobile Navigation Strip (Counter 01 / 07 + Left/Right Buttons) ── */}
          <div className="flex lg:hidden items-center justify-between mt-5 pt-4 border-t border-white/10">
            {/* Counter 01 / 07 */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-lime tracking-wider" dir="ltr">
                {isRtl
                  ? `${toFaDigits(activeIndex + 1)} / ${toFaDigits(totalServices)}`
                  : `${String(activeIndex + 1).padStart(2, "0")} / ${String(totalServices).padStart(2, "0")}`}
              </span>
              <span className="text-xs text-white/40">
                {isRtl ? "خدمات" : "Services"}
              </span>
            </div>

            {/* Clear, Prominent Mobile Navigation Buttons */}
            <div className="flex items-center gap-2.5">
              <motion.button
                type="button"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                onClick={prevSlide}
                aria-label={isRtl ? "خدمت قبلی" : "Previous service"}
                className="flex h-11 w-11 items-center justify-center rounded-2xl glass-panel text-white shadow-lg hover:border-lime/40 hover:text-lime transition-all cursor-pointer"
              >
                <svg className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                type="button"
                whileTap={prefersReducedMotion ? undefined : { scale: 0.88 }}
                onClick={nextSlide}
                aria-label={isRtl ? "خدمت بعدی" : "Next service"}
                className="flex h-11 w-11 items-center justify-center rounded-2xl glass-panel text-white shadow-lg hover:border-lime/40 hover:text-lime transition-all cursor-pointer"
              >
                <svg className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}