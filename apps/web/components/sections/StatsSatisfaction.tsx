"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { EASE_PREMIUM, statStaggerContainer, statItemReveal } from "@/lib/motion";
import { BACKEND_URL } from "@/config/api";

// ─── Number Animation Helpers ──────────────────────────────────────────────────

const PFA = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"] as const;
const ENA = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"] as const;

const toEn = (s: string) => {
  let r = s;
  PFA.forEach((p, i) => {
    r = r.replaceAll(p, ENA[i]);
  });
  return r.replaceAll("٫", ".");
};

const toFa = (s: string) => {
  let r = s;
  ENA.forEach((e, i) => {
    r = r.replaceAll(e, PFA[i]);
  });
  return r;
};

type ParsedValue =
  | {
      isNumber: true;
      prefix: string;
      num: number;
      suffix: string;
      isFloat: boolean;
    }
  | {
      isNumber: false;
      original: string;
    };

const parseValue = (raw: string): ParsedValue => {
  const en = toEn(raw);
  const m = en.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
  if (m) {
    return {
      isNumber: true,
      prefix: m[1],
      num: parseFloat(m[2]),
      suffix: m[3],
      isFloat: m[2].includes("."),
    };
  }
  return { isNumber: false, original: raw };
};

function AnimatedNumber({
  value,
  isRtl,
  shouldAnimate,
}: {
  value: string;
  isRtl: boolean;
  shouldAnimate: boolean;
}) {
  const [display, setDisplay] = useState(() => (isRtl ? toFa(value) : toEn(value)));
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (hasAnimatedRef.current) {
      setDisplay(isRtl ? toFa(value) : toEn(value));
      return;
    }

    const parsed = parseValue(value);
    if (!parsed.isNumber) {
      setDisplay(isRtl ? toFa(value) : toEn(value));
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(isRtl ? toFa(value) : toEn(value));
      return;
    }

    if (!shouldAnimate) return;
    hasAnimatedRef.current = true;

    const duration = 1400; // 1.4s smooth count up
    const target = parsed.num;
    let rafId: number;
    let start: number | null = null;

    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo (no bounce, settles smoothly)
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const cur = target * ease;
      const fmt = parsed.isFloat ? cur.toFixed(1) : String(Math.floor(cur));
      const str = `${parsed.prefix}${fmt}${parsed.suffix}`;
      setDisplay(isRtl ? toFa(str) : toEn(str));

      if (t < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplay(isRtl ? toFa(value) : toEn(value));
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [shouldAnimate, value, isRtl]);

  return <span>{display}</span>;
}

// Icons matching Dr. Miresmaeili reference architecture & specific metric concepts
const STAT_ICONS = [
  // 1. پروژه‌های موفق (Briefcase / Completed Projects)
  (
    <svg key="projects" className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  // 2. رضایت مشتریان (Star / Satisfaction)
  (
    <svg key="satisfaction" className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  // 3. سال تجربه تخصصی (Clock / Experience & History)
  (
    <svg key="experience" className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  // 4. خدمات تخصصی (Layers / Specialized Services)
  (
    <svg key="services" className="w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  ),
];

const DEFAULT_METRICS = [
  {
    id: "projects",
    valFa: "+۲۰۰",
    valEn: "+200",
    titleFa: "پروژه‌های موفق",
    titleEn: "Successful Projects",
    icon: STAT_ICONS[0],
  },
  {
    id: "satisfaction",
    valFa: "۴.۹ / ۵",
    valEn: "4.9 / 5",
    titleFa: "رضایت مشتریان",
    titleEn: "Client Satisfaction",
    icon: STAT_ICONS[1],
  },
  {
    id: "experience",
    valFa: "۸ سال",
    valEn: "8 Years",
    titleFa: "سال تجربه تخصصی",
    titleEn: "Years of Specialized Rigor",
    icon: STAT_ICONS[2],
  },
  {
    id: "services",
    valFa: "۷ حوزه",
    valEn: "7 Disciplines",
    titleFa: "خدمات تخصصی",
    titleEn: "Specialized Services",
    icon: STAT_ICONS[3],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StatsSatisfaction() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  const metrics = DEFAULT_METRICS;

  return (
    <section
      id="statistics"
      aria-label={isRtl ? "آمار و دستاوردهای آن‌ساپ" : "OnSupp Statistics & Achievements"}
      className="relative w-full py-16 sm:py-20 lg:py-24 bg-[#F8F9FA] dark:bg-[#121413] border-y border-[#1F1F1E]/[0.08] dark:border-white/[0.08] transition-colors duration-500 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Subtle Atmospheric Ambient Glows (Inspired by Dr. Miresmaeili Reference) ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 -translate-y-1/2 start-[-10%] w-[550px] h-[550px] rounded-full bg-[#4F0001]/[0.04] dark:bg-[#4F0001]/[0.16] blur-[150px]" />
        <div className="absolute top-1/2 -translate-y-1/2 end-[-10%] w-[500px] h-[500px] rounded-full bg-[#38534A]/[0.04] dark:bg-[#38534A]/[0.18] blur-[160px]" />
      </div>

      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12"
      >
        {/* ── TWO-COLUMN ASYMMETRIC LAYOUT (MATCHING DR. MIRESMAEILI REFERENCE ARCHITECTURE) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-20 items-center">
          
          {/* ── RIGHT COLUMN (in RTL): EDITORIAL HEADLINE & STORYTELLING STATEMENT ── */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
            animate={
              prefersReducedMotion
                ? undefined
                : isInView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 24 }
            }
            transition={{ duration: 0.65, ease: EASE_PREMIUM }}
            className={`lg:col-span-6 flex flex-col justify-center space-y-4 sm:space-y-6 ${
              isRtl ? "text-right" : "text-left"
            }`}
          >
            {/* Category Eyebrow - Matching About Us Section Pattern */}
            <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-1 sm:mb-2">
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
              <span
                className={
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }
              >
                {isRtl ? "شاخص‌های عملکرد و تعهد آن‌ساپ" : "ONSUPP PERFORMANCE & IMPACT"}
              </span>
            </div>

            {/* Commanding Headline */}
            <h2
              className={`text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-bold text-[#1F1F1E] dark:text-[#F8F9FA] tracking-tight leading-[1.3] ${
                isRtl ? "font-[family-name:var(--font-vazirmatn)]" : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl ? (
                <>
                  ۸ سال تجربه تخصصی و نوآوری؛{" "}
                  <span className="text-[#4F0001] dark:text-[#D9757A]">
                    در خدمت تمایز و رشد برند شما
                  </span>
                </>
              ) : (
                <>
                  8 Years of Digital Rigor;{" "}
                  <span className="text-[#4F0001] dark:text-[#D9757A]">
                    Dedicated to Your Brand’s Scale
                  </span>
                </>
              )}
            </h2>

            {/* Narrative Subtitle / Philosophy (Inspired by Dr. Miresmaeili Subtitle) */}
            <p
              className={`text-sm sm:text-base text-[#575A59] dark:text-[#9BA09D] leading-[1.8] sm:leading-[1.9] max-w-xl ${
                isRtl ? "font-[family-name:var(--font-vazirmatn)]" : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl
                ? "با تکیه بر استراتژی داده‌محور، مهندسی نرم‌افزار پیشرفته و ظرافت طراحی مدرن، ما علم و تجربه را در هم آمیخته‌ایم تا پلتفرم‌هایی ماندگار، کارآمد و تحول‌آفرین خلق کنیم. اعداد تنها گوشه‌ای از تعهد پایدار ما به پیشرفت و درخشش کسب‌وکار شماست."
                : "Backed by data-driven growth strategies, enterprise software engineering, and modern design precision, we craft enduring digital platforms. Numbers are only a reflection of our deep commitment to your brand's lasting success."}
            </p>
          </motion.div>

          {/* ── LEFT COLUMN (in RTL): 2×2 GRID OF METRICS (MATCHING DR. MIRESMAEILI REFERENCE - NO CARD BOX) ── */}
          <div className="lg:col-span-6 w-full flex items-center justify-center">
            <motion.div
              variants={prefersReducedMotion ? undefined : statStaggerContainer}
              initial={prefersReducedMotion ? undefined : "hidden"}
              animate={
                prefersReducedMotion
                  ? undefined
                  : isInView
                  ? "visible"
                  : "hidden"
              }
              className="grid grid-cols-2 gap-x-8 sm:gap-x-12 lg:gap-x-14 gap-y-10 sm:gap-y-12 lg:gap-y-14 w-full max-w-lg"
            >
              {metrics.map((m) => {
                const val = isRtl ? m.valFa : m.valEn;
                const title = isRtl ? m.titleFa : m.titleEn;

                return (
                  <motion.div
                    key={m.id}
                    variants={prefersReducedMotion ? undefined : statItemReveal}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -4, transition: { duration: 0.25, ease: EASE_PREMIUM } }
                    }
                    className="group flex flex-col items-center text-center cursor-default"
                  >
                    {/* Outline Vector Icon */}
                    <div className="mb-3 sm:mb-4 text-[#4F0001] dark:text-[#D9757A] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      {m.icon}
                    </div>

                    {/* Prominent Number */}
                    <div
                      className={`text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-[#1F1F1E] dark:text-[#F8F9FA] mb-2 sm:mb-2.5 leading-none transition-colors duration-300 group-hover:text-[#4F0001] dark:group-hover:text-[#D9757A] ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                      dir="ltr"
                    >
                      <AnimatedNumber
                        value={val}
                        isRtl={isRtl}
                        shouldAnimate={isInView}
                      />
                    </div>

                    {/* Metric Label */}
                    <h3
                      className={`text-xs sm:text-sm font-medium text-[#575A59] dark:text-[#9BA09D] leading-snug max-w-[160px] ${
                        isRtl
                          ? "font-[family-name:var(--font-vazirmatn)]"
                          : "font-[family-name:var(--font-gendy)]"
                      }`}
                    >
                      {title}
                    </h3>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
