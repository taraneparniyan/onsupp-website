"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

interface IndustryItem {
  id: string;
  badgeFa: string;
  badgeEn: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  highlightFa: string;
  highlightEn: string;
  icon: (props: { className?: string }) => React.ReactElement;
}

const INDUSTRIES: IndustryItem[] = [
  {
    id: "healthtech",
    badgeFa: "پزشکی و سلامت",
    badgeEn: "HealthTech & Aesthetics",
    titleFa: "کلینیک‌های تخصصی، پزشکی و سلامت دیجیتال",
    titleEn: "Specialized Clinics & Digital Healthcare",
    descFa:
      "توسعه پلتفرم‌های نوبت‌دهی آنلاین، پرونده الکترونیک، سئو کلمات کلیدی پزشکی و هویت بصری لوکس متناسب با استانداردهای درمانی.",
    descEn:
      "Telemetry portals, HIPAA-conscious patient dashboards, medical SEO supremacy, and elevated clinic branding.",
    highlightFa: "سامانه‌های تله‌مدیسین و کلینیک‌های پیشرو",
    highlightEn: "Telemedicine & Premium Aesthetics",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    id: "fintech",
    badgeFa: "فین‌تک و پرداخت",
    badgeEn: "FinTech & Banking",
    titleFa: "سامانه‌های مالی، صرافی‌ها و درگاه‌های پرداخت",
    titleEn: "Decentralized Finance & Enterprise Gateways",
    descFa:
      "طراحی داشبوردهای معاملاتی بدون تاخیر (Low-Latency)، احراز هویت دوعاملی سخت‌گیرانه، امنیت سایبری چندلایه و رابط‌های کاربری چشم‌نواز.",
    descEn:
      "Sub-millisecond data feeds, hardened multi-layer security, intuitive trading desks, and resilient fiat-crypto rails.",
    highlightFa: "درگاه‌های پرداخت مقیاس‌پذیر و پنل‌های صرافی",
    highlightEn: "High-Throughput Financial Interfaces",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "saas",
    badgeFa: "نرم‌افزار ابری",
    badgeEn: "SaaS & Cloud Workflows",
    titleFa: "پلتفرم‌های داده‌محور، CRM و اتوماسیون",
    titleEn: "B2B SaaS, CRM Workflows & Cloud Analytics",
    descFa:
      "معماری میکروسرویس‌های منعطف، خطوط لوله فروش خودکار، سیستم‌های گزارش‌گیری ریل‌تایم و یکپارچه‌سازی سامانه‌های یکپارچه سازمانی.",
    descEn:
      "Modular cloud microservices, automated marketing pipelines, real-time telemetry dashboards, and multi-tenant architectures.",
    highlightFa: "اتوماسیون هوشمند و کاهش ۴۰٪ هزینه فرآیندها",
    highlightEn: "Intelligent Workflows & Data Pipelines",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
  {
    id: "ecommerce",
    badgeFa: "تجارت الکترونیک",
    badgeEn: "Luxury E-Commerce & Retail",
    titleFa: "فروشگاه‌های آنلاین لوکس و پلتفرم‌های چندفروشندگی",
    titleEn: "Direct-to-Consumer & Multi-Vendor Marketplaces",
    descFa:
      "تجربه خرید فوق‌سریع بدون بارگذاری مجدد (Headless Commerce)، سبد خرید بهینه‌سازی‌شده برای نرخ تبدیل و هویت بصری پرمیوم.",
    descEn:
      "Headless checkout architectures, conversion-optimized shopping flows, inventory synchronizers, and luxury brand aesthetics.",
    highlightFa: "افزایش میانگین نرخ تبدیل تا ۳۵٪",
    highlightEn: "+35% Verified Conversion Uplift",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: "media",
    badgeFa: "سینما و استودیو",
    badgeEn: "Media & Commercial Cinema",
    titleFa: "استودیوهای رسانه، پادکست و تولیدات سینمایی",
    titleEn: "Industrial Media, Podcast Hubs & Commercials",
    descFa:
      "تولید محتوای ویدئویی ۴K، تدوین اختصاصی، انیمیشن‌های سه‌بعدی صنعتی و بسته‌بندی فاخر برای حضور قدرتمند در کمپین‌های ملی.",
    descEn:
      "4K cinematography, motion brand identities, acoustic podcast mastering, and high-impact commercial campaigns.",
    highlightFa: "تولید تیزر و هویت رسانه‌ای شاخص",
    highlightEn: "Cinema-Grade Commercial Storytelling",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "corporate",
    badgeFa: "سازمان‌ها و هلدینگ‌ها",
    badgeEn: "Enterprise & Conglomerates",
    titleFa: "هلدینگ‌های بزرگ، روابط عمومی و پورتال‌های شرکتی",
    titleEn: "Conglomerate Portals & Investor Relations",
    descFa:
      "ارائه ساختار چندزبانه بین‌المللی، تطبیق با هویت‌های برند چندملیتی، آرشیو دیجیتال گزارش‌ها و طراحی اعتبارمحور.",
    descEn:
      "Multi-lingual governance architectures, unified brand compliance, investor relations hubs, and corporate credibility.",
    highlightFa: "معماری مقیاس‌پذیر و استانداردهای جهانی وب",
    highlightEn: "Enterprise Scale & Global Web Standards",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default function PortfolioIndustriesSection({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label={isRtl ? "صنایع و حوزه‌های تخصصی فعالیت آن‌ساپ" : "Industries We Transform"}
      className="relative w-full py-16 sm:py-24 border-b border-black/[0.06] dark:border-white/[0.08] overflow-hidden"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE_PREMIUM }}
              className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4"
            >
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
              <span>{isRtl ? "حوزه‌های تخصصی" : "SECTOR EXPERTISE"}</span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
              className={`text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.25] ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              {isRtl
                ? "توانمندسازی برندها در صنایع استراتژیک و رقابتی"
                : "Transforming Visionaries Across Competitive Sectors"}
            </motion.h2>
          </div>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.16 }}
            className="text-xs sm:text-sm text-foreground/70 max-w-md"
          >
            {isRtl
              ? "راهکارهای آن‌ساپ به‌گونه‌ای سفارشی‌سازی می‌شوند که الزامات فنی و هویت منحصربه‌فرد هر صنعت را پاسخ دهند."
              : "Every solution is tailored to the compliance, velocity, and distinct competitive dynamics of each domain."}
          </motion.p>
        </div>

        {/* ── 6-Card Industry Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {INDUSTRIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  ease: EASE_PREMIUM,
                  delay: idx * 0.08,
                }}
                className="group relative p-6 sm:p-7 rounded-3xl bg-white/60 dark:bg-[#1A1A19]/60 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-[#38534A]/10 dark:bg-white/[0.06] text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#38534A] dark:text-[#8AB3A0] px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06]">
                    {isRtl ? item.badgeFa : item.badgeEn}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors leading-snug">
                  {isRtl ? item.titleFa : item.titleEn}
                </h3>

                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-4">
                  {isRtl ? item.descFa : item.descEn}
                </p>

                <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2 text-[11px] font-semibold text-foreground/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B7FF00]" />
                  <span>{isRtl ? item.highlightFa : item.highlightEn}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
