"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_PREMIUM } from "@/lib/motion";

interface Pillar {
  number: string;
  badgeFa: string;
  badgeEn: string;
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  icon: (props: { className?: string }) => React.ReactElement;
  featuresFa: string[];
  featuresEn: string[];
}

const PILLARS: Pillar[] = [
  {
    number: "01",
    badgeFa: "گام اول: استراتژی و ارزش",
    badgeEn: "Phase 01: Strategic Core",
    titleFa: "کشف استراتژیک و معماری تمایز",
    titleEn: "Deep Discovery & Distinctive Architecture",
    descFa:
      "هیچ پروژه‌ای بدون درک عمیق ماهیت برند و تحلیل موشکافانه رفتار بازار شکل نمی‌گیرد. ما پیش از نوشتن اولین خط کد، نقشه ارزش کسب‌وکار شما را ترسیم می‌کنیم.",
    descEn:
      "No milestone is built without deeply dissecting your market positioning and audience psychology. We architect the value roadmap before authoring a single line of code.",
    featuresFa: [
      "تحلیل نیچ بازار و رقبا",
      "تعریف پرسونای مخاطبان تراز اول",
      "نقشه جامع تجربه کاربری (User Journey)",
    ],
    featuresEn: [
      "Competitive Niche Analysis",
      "High-Value Audience Personas",
      "End-to-End User Journey Mapping",
    ],
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: "02",
    badgeFa: "گام دوم: دیزاین و هویت",
    badgeEn: "Phase 02: Visual Identity",
    titleFa: "طراحی سیستم‌محور و زیبایی‌شناسی ماندگار",
    titleEn: "Systemic Aesthetics & Emotional Resonance",
    descFa:
      "دیزاین برای ما صرفاً زیبایی ظاهری نیست؛ خلق زبانی ملموس و شگفت‌انگیز است که اعتبار، لوکس بودن و حس اطمینان را در تک‌تک تعاملات به کاربر منتقل می‌کند.",
    descEn:
      "Design is more than skin-deep aesthetics; it is crafting an intuitive, emotionally evocative language that breathes authority, luxury, and clarity into every interaction.",
    featuresFa: [
      "دیزاین سیستم اختصاصی بر پایه توکن‌ها",
      "تایپوگرافی دقیق و میکرو‌اینتراکشن‌های روان",
      "کنتراست حساب‌شده و گلس‌مورفیسم کنترل‌شده",
    ],
    featuresEn: [
      "Token-Driven Design Systems",
      "Refined Typography & Micro-Motions",
      "Controlled Translucency & Contrast",
    ],
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    number: "03",
    badgeFa: "گام سوم: مهندسی و بازدهی",
    badgeEn: "Phase 03: Scalable Engineering",
    titleFa: "کدنویسی بدون مصالحه و عملکرد فوق‌سریع",
    titleEn: "Rigorous Engineering & Blazing Speed",
    descFa:
      "پیاده‌سازی با مدرن‌ترین استک‌های وب (Next.js، رندرینگ بهینه، معماری ماژولار و سئو ساختاری) تضمین می‌کند که پروژه شما در ترافیک‌های سنگین همواره پایدار و سریع بماند.",
    descEn:
      "Engineered with cutting-edge stacks (Next.js App Router, SSR, modular architecture, and technical SEO) ensuring blistering sub-second response times under enterprise scale.",
    featuresFa: [
      "امتیاز Core Web Vitals بالای ۹۵",
      "معماری کلود و امنیت چندلایه‌ای",
      "یکپارچگی با سیستم‌های CRM و دیتابیس اختصاصی",
    ],
    featuresEn: [
      "95+ Core Web Vitals Performance",
      "Enterprise Cloud Security & Resilience",
      "Seamless CRM & Custom Database Integrations",
    ],
    icon: ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
];

export default function PortfolioCreativeApproach({ isRtl }: { isRtl: boolean }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label={isRtl ? "رویکرد مهندسی و خلق پروژه" : "Engineering & Creative Manifesto"}
      className="relative w-full py-20 sm:py-28 border-b border-[#1F1F1E]/10 dark:border-white/10 overflow-hidden bg-[#F4F5F2] dark:bg-[#121413] transition-colors"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* ── Section Header ── */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: EASE_PREMIUM }}
            className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4"
          >
            <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
            <span>{isRtl ? "فلسفه خلق پروژه" : "OUR CREATIVE MANIFESTO"}</span>
          </motion.div>

          <motion.h2
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.1 }}
            className={`text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-[1.25] mb-5 ${
              isRtl
                ? "font-[family-name:var(--font-vazirmatn)]"
                : "font-[family-name:var(--font-gendy)]"
            }`}
          >
            {isRtl
              ? "چرا پروژه‌های آن‌ساپ ماندگار و نتیجه‌بخش هستند؟"
              : "Why OnSupp Projects Deliver Measurable Impact"}
          </motion.h2>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.18 }}
            className="text-sm sm:text-base text-foreground/75 leading-relaxed"
          >
            {isRtl
              ? "ما در آن‌ساپ پروژه‌ها را صرفاً تحویل یک فایل طراحی یا مخزن کد نمی‌بینیم؛ بلکه پیوند مستحکمی از تفکر استراتژیک، هنر بصری و مهندسی داده‌محور بنا می‌کنیم تا کسب‌وکار شما رهبری بازار خود را به‌دست گیرد."
              : "We do not treat deliverables as isolated designs or codebases. Every engagement is a cohesive symbiosis of strategic foresight, bespoke aesthetic craft, and mission-critical engineering."}
          </motion.p>
        </div>

        {/* ── 3 Sharp Editorial Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.article
                key={pillar.number}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.6,
                  ease: EASE_PREMIUM,
                  delay: idx * 0.1,
                }}
                className="group relative flex flex-col justify-between p-7 sm:p-8 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 shadow-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  {/* Card Top: Number + Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] px-2.5 py-1 rounded-none bg-black/[0.04] dark:bg-white/[0.06] border border-[#1F1F1E]/10 dark:border-white/10">
                      {pillar.number}
                    </span>
                    <div className="w-10 h-10 rounded-none bg-[#38534A]/10 dark:bg-white/[0.08] text-[#38534A] dark:text-[#8AB3A0] flex items-center justify-center group-hover:bg-[#38534A] group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-[#1F1F1E] transition-all duration-300 border border-[#38534A]/20 dark:border-white/10">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Badge & Title */}
                  <span className="text-[11px] font-bold text-[#38534A] dark:text-[#8AB3A0] block mb-2 tracking-wide">
                    {isRtl ? pillar.badgeFa : pillar.badgeEn}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug">
                    {isRtl ? pillar.titleFa : pillar.titleEn}
                  </h3>

                  {/* Prose */}
                  <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-6">
                    {isRtl ? pillar.descFa : pillar.descEn}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="pt-5 border-t border-[#1F1F1E]/10 dark:border-white/10 space-y-2.5">
                  {(isRtl ? pillar.featuresFa : pillar.featuresEn).map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-none bg-[#38534A] dark:bg-[#8AB3A0] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
