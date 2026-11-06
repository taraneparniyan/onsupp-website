"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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

  // Client-side detection for desktop viewport (md/lg: 768px+)
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
      aria-label={isRtl ? "چرا خدمات آن‌ساپ؟" : "Why Choose OnSupp"}
      className="relative w-full my-12 sm:my-20 overflow-hidden"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12 xl:px-14">
        
        {/* 
          Banner Wrapper with background-attachment: fixed on desktop (>=768px)
          and regular background-attachment: scroll on mobile (<768px) to eliminate jitter/stutter.
        */}
        <div
          className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden p-8 sm:p-12 lg:p-16 border border-border shadow-xl text-white bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero/hero-tech-engineering.webp')",
            backgroundAttachment: isDesktop ? "fixed" : "scroll",
          }}
        >
          {/* Deep Dark Overlay for Flawless Readability in both Light & Dark Theme */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#17221E]/95 via-[#1f1f1e]/90 to-[#17221E]/85 pointer-events-none" />

          {/* Decorative Subtle Glow Accents (Official Brand Dark Green & Burgundy) */}
          <div className="absolute -top-24 -start-24 w-72 h-72 rounded-full bg-[#38534a]/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -end-24 w-72 h-72 rounded-full bg-[#4f0001]/30 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Header / Intro */}
            <ScrollReveal once viewportMargin="0px">
              <div className="max-w-2xl mb-12 sm:mb-16 space-y-4">
                <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#8bb3a4] uppercase">
                  <span className="h-0.5 w-6 bg-[#8bb3a4]" />
                  <span>{isRtl ? "چرا آن‌ساپ؟" : "WHY ONSUPP?"}</span>
                </div>

                <h2
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-extrabold tracking-tight text-white ${
                    isRtl
                      ? "font-[family-name:var(--font-vazirmatn)]"
                      : "font-[family-name:var(--font-gendy)]"
                  }`}
                >
                  {isRtl ? "تجربه، تخصص و تعهد به تمایز برند شما" : "Experience, Expertise & Commitment to Excellence"}
                </h2>

                <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                  {isRtl
                    ? "ما در آن‌ساپ با تکیه بر سال‌ها تجربه در مدیریت پروژه‌های بزرگ سازمانی و تلفیق هنر، فناوری و اتوماسیون، نتایجی پایدار و قابل اندازه‌گیری خلق می‌کنیم."
                    : "Backed by years of proven enterprise execution, we unite creative direction, modern engineering, and automation to build enduring commercial authority."}
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection("services-cta")}
                    className="px-6 py-3 rounded-full bg-white text-[#1f1f1e] hover:bg-white/90 font-semibold text-xs sm:text-sm active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>{isRtl ? "درخواست جلسه ارزیابی" : "Request Discovery Session"}</span>
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${isRtl ? "rotate-180" : ""}`}
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

            {/* Why Us 4 Pillars Grid (Glassmorphism on top of fixed background) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {WHY_US_PILLARS.map((pillar, idx) => (
                <motion.div
                  key={pillar.id}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="p-5 sm:p-6 rounded-2xl bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/15 hover:border-white/30 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center">
                      {pillar.icon}
                    </div>
                    <span className="text-xs font-mono text-white/50">{pillar.num}</span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2">
                    {isRtl ? pillar.titleFa : pillar.titleEn}
                  </h3>

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
