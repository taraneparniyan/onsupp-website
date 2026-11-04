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
    id: "healthcare",
    badgeFa: "پزشکی و سلامت تخصصی",
    badgeEn: "Healthcare & Aesthetics",
    titleFa: "مطب‌های تخصصی، کلینیک‌های زیبایی و سامانه‌های درمان",
    titleEn: "Specialized Clinics, Aesthetic Medicine & Patient Portals",
    descFa:
      "طراحی پرتال‌های آنلاین با سرعت فوق‌العاده، رزرواسیون بدون وقفه، گالری قبل و بعد و استراتژی سئو محتوایی برای کلمات تخصصی سلامت.",
    descEn:
      "Enterprise patient booking platforms, treatment showcase galleries, and specialized medical SEO architectures for premier practices.",
    highlightFa: "رزرواسیون بدون تماس و رشد مراجعین",
    highlightEn: "Automated Intake & Practice Growth",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "construction",
    badgeFa: "ساختمان و معماری لوکس",
    badgeEn: "Architecture & Construction",
    titleFa: "شرکت‌های ساختمانی، انبوه‌سازان و پروژه‌های بین‌المللی",
    titleEn: "High-End Architectural Practices & Global Developers",
    descFa:
      "پرتال‌های مهندسی با امکان نمایش سه‌بعدی پروژه‌ها، محاسبه‌گر آنلاین هزینه ساخت و سئو هدفمند در بازارهای بین‌المللی مانند کانادا.",
    descEn:
      "Architectural portfolio platforms, online estimation funnels, and international SEO tailored to luxury North American markets.",
    highlightFa: "محاسبه‌گر آنلاین و جذب لید خارجی",
    highlightEn: "Interactive Estimation & Global Inquiries",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "fintech",
    badgeFa: "فین‌تک و خدمات مالی",
    badgeEn: "FinTech & Wealth",
    titleFa: "داشبوردهای سرمایه‌گذاری، مدیریت دارایی و پلتفرم‌های داده",
    titleEn: "Investment Portals, Asset Dashboards & Data Analytics",
    descFa:
      "رندر لحظه‌ای صدها ردیف داده مالی، نمودارهای تعاملی پرسرعت بر پایه وب و رعایت بالاترین پروتکل‌های امنیت سایبری.",
    descEn:
      "Real-time streaming ledger visualization, GPU-accelerated financial charts, and role-based multi-tenant architectures.",
    highlightFa: "داشبورد تحلیلی با بارگذاری زیر ۰.۵ ثانیه",
    highlightEn: "Sub-Second Multi-Asset Analytics",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "logistics",
    badgeFa: "لجستیک و خدمات میدانی",
    badgeEn: "Field Service & Mobility",
    titleFa: "اتوماسیون خدمات پس از فروش، رهگیری و مدیریت ناوگان",
    titleEn: "Fleet Operations, Field Dispatch & Service Automation",
    descFa:
      "پایپ‌لاین هوشمند ثبت تیکت، تخصیص مکانیزه نزدیک‌ترین تکنسین و گزارش‌های آماری مدیریتی در پنل‌های تحت وب ریسپانسیو.",
    descEn:
      "Automated dispatch routing, real-time job milestone tracking, and executive telemetry dashboards on responsive web architectures.",
    highlightFa: "کاهش ۶۰ درصدی زمان پاسخگویی به مشتری",
    highlightEn: "60% Reduction in Ticket Response Latency",
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "media",
    badgeFa: "استودیو و تولید محتوا",
    badgeEn: "Studio & Cinema",
    titleFa: "تولید تیزر صنعتی، سینمایی، موشن گرافیک و مدیریت شبکه‌های اجتماعی",
    titleEn: "Cinematic Commercials, Brand Motion & Social Content",
    descFa:
      "سناریونویسی دقیق متناسب با ادبیات برند، فیلم‌برداری سینمایی با تجهیزات 4K و تدوین استودیویی ریلزهای اینستاگرام با تعامل بالا.",
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
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function PortfolioIndustriesSection({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label={isRtl ? "صنایع و حوزه‌های تخصصی فعالیت آن‌ساپ" : "Industries We Transform"}
      className="relative w-full py-20 sm:py-28 border-b border-[#1F1F1E]/10 dark:border-white/10 overflow-hidden bg-[#F4F5F2] dark:bg-[#121413] transition-colors"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header ── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: EASE_PREMIUM }}
              className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4"
            >
              <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
              <span>{isRtl ? "حوزه‌های تخصصی" : "SECTOR EXPERTISE"}</span>
            </motion.div>

            <motion.h2
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
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
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
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

        {/* ── 6-Card Industry Grid - Sharp Rectangular Architecture ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {INDUSTRIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.55,
                  ease: EASE_PREMIUM,
                  delay: idx * 0.08,
                }}
                className="group relative p-6 sm:p-7 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-11 h-11 rounded-none bg-[#38534A]/10 dark:bg-white/[0.06] text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center border border-[#38534A]/20 dark:border-white/10 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-[#38534A] dark:text-[#8AB3A0] px-2.5 py-1 rounded-none bg-black/[0.04] dark:bg-white/[0.06] border border-[#1F1F1E]/10 dark:border-white/10">
                    {isRtl ? item.badgeFa : item.badgeEn}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors leading-snug">
                  {isRtl ? item.titleFa : item.titleEn}
                </h3>

                <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-4">
                  {isRtl ? item.descFa : item.descEn}
                </p>

                <div className="pt-3 border-t border-[#1F1F1E]/10 dark:border-white/10 flex items-center gap-2 text-[11px] font-semibold text-foreground/60">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#38534A] dark:bg-[#8AB3A0]" />
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
