"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { scrollToSection } from "@/lib/scroll";

const WHY_US_PILLARS = [
  {
    id: "strategy",
    num: "۰۱",
    titleFa: "استراتژی اختصاصی و هدفمند",
    titleEn: "Tailored Strategic Roadmaps",
    descFa: "طراحی مسیر رشد بر پایه تحلیل داده‌های واقعی بازار و رفتار کاربران هدف بدون راهکارهای عمومی.",
    descEn: "Bespoke growth blueprints anchored in empirical market analysis, eliminating generic solutions.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24" />
        <path d="m14.83 9.17 4.24-4.24" />
        <path d="m14.83 14.83 4.24 4.24" />
        <path d="m9.17 14.83-4.24 4.24" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: "quality",
    num: "۰۲",
    titleFa: "تولید با بالاترین استاندارد سینمایی و فنی",
    titleEn: "Cinema & Engineering Standards",
    descFa: "به‌کارگیری تجهیزات روز سینمایی، معماری مدرن کد Next.js و تست‌های دقیق سرعت و پایداری.",
    descEn: "Broadcast-grade cinematography, modern Next.js clean codebases, and rigorous performance audits.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    id: "synergy",
    num: "۰۳",
    titleFa: "یکپارچگی کامل ۷ دپارتمان",
    titleEn: "Cross-Departmental Synergy",
    descFa: "هم‌افزایی بی‌نقص میان استودیو، هویت بصری، سئو، توسعه وب و اتوماسیون فروش در یک پلتفرم منسجم.",
    descEn: "Seamless harmony across studio, branding, SEO, web engineering, and automated sales operations.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    id: "commitment",
    num: "۰۴",
    titleFa: "تعهد به بازگشت سرمایه و شفافیت",
    titleEn: "ROI Commitment & Transparency",
    descFa: "ارائه داشبوردهای شفاف عملکرد، زمان‌بندی دقیق پروژه‌ها و پیگیری پیوسته تا تحقق نتایج مطلوب.",
    descEn: "Transparent reporting dashboards, strict project milestones, and sustained performance tracking.",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
];

export default function ServicesWhyUsSection({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  return (
    <section
      id="services-why-us"
      aria-label={isRtl ? "چرا خدمات آن‌ساپ؟" : "Why Choose OnSupp"}
      className="relative w-full lg:min-h-[100vh] lg:min-h-[100svh] flex flex-col justify-center py-10 sm:py-14 lg:py-16 bg-background border-b border-border/60 overflow-hidden"
    >
      {/* Full-Width Container (width: 100%, no max-width constraint) */}
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Full-Width Banner Wrapper with Design System Panel Radius */}
        <div
          className="relative w-full rounded-panel sm:rounded-[32px] overflow-hidden px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 xl:px-20 xl:py-20 border border-border shadow-xl text-white bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/hero-tech-engineering.webp')",
            backgroundAttachment: isDesktop ? "fixed" : "scroll",
          }}
        >
          {/* Deep Dark Overlay for Flawless Readability in both Light & Dark Theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#17221E]/95 via-[#1f1f1e]/92 to-[#17221E]/88 pointer-events-none" />

          {/* Subtle Architectural Grid Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />

          <div className="relative z-10 w-full">
            {/* Header / Intro */}
            <ScrollReveal once viewportMargin="0px">
              <div className="w-full mb-10 sm:mb-14 space-y-4">
                <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#8AB3A0] uppercase">
                  <span className="h-0.5 w-8 bg-[#8AB3A0]" />
                  <span>{isRtl ? "چرا آن‌ساپ؟" : "WHY ONSUPP?"}</span>
                </div>

                <h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl lg:whitespace-nowrap font-extrabold tracking-tight text-white ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  {isRtl
                    ? "تجربه، تخصص و تعهد به تمایز برند شما"
                    : "Experience, Expertise & Commitment to Excellence"}
                </h2>

                <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
                  {isRtl
                    ? "ما در آن‌ساپ با تکیه بر سال‌ها تجربه در مدیریت پروژه‌های بزرگ سازمانی و تلفیق هنر، فناوری و اتوماسیون، نتایجی پایدار و قابل اندازه‌گیری خلق می‌کنیم."
                    : "Backed by years of proven enterprise execution, we unite creative direction, modern engineering, and automation to build enduring commercial authority."}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection("services-cta")}
                    className="px-7 py-3.5 rounded-full bg-[#38534A] hover:bg-[#2B4039] text-[#F8F9FA] border border-[#8AB3A0]/40 font-semibold text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2.5 cursor-pointer"
                  >
                    <span>{isRtl ? "درخواست جلسه ارزیابی" : "Request Discovery Session"}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${
                        isRtl ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </ScrollReveal>

            {/* Why Us 4 Pillars Grid (Rounded Glassmorphic Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full">
              {WHY_US_PILLARS.map((pillar, idx) => (
                <motion.div
                  key={pillar.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="p-6 sm:p-7 rounded-card sm:rounded-card-lg bg-white/[0.08] dark:bg-black/35 backdrop-blur-md border border-white/15 hover:border-[#8AB3A0]/50 transition-all hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-11 h-11 rounded-card-sm bg-[#38534A]/60 border border-[#8AB3A0]/35 text-white flex items-center justify-center">
                        {pillar.icon}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8AB3A0]">
                        {pillar.num}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2.5 leading-snug">
                      {isRtl ? pillar.titleFa : pillar.titleEn}
                    </h3>
                  </div>

                  <p className="text-xs text-white/75 leading-relaxed">
                    {isRtl ? pillar.descFa : pillar.descEn}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
