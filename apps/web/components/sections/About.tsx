"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { buttonHover, tapFeedback } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";

const ICONS: Record<string, React.ReactNode> = {
  team: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197"
      />
    </svg>
  ),
  data: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  support: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m9.9 2.829a5 5 0 010 7.07m-7.07 0a5 5 0 010-7.07M12 12h.01"
      />
    </svg>
  ),
  results: (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const DEFAULT_FEATURES: { fa: string; en: string; icon: string }[] = [
  { fa: "تیم متخصص", en: "Expert team", icon: "team" },
  { fa: "استراتژی داده", en: "Data-driven", icon: "data" },
  { fa: "پشتیبانی مستمر", en: "Full support", icon: "support" },
  { fa: "نتایج ملموس", en: "Measurable results", icon: "results" },
];

// Mobile Reference Design Features (matching layout in reference image)
const MOBILE_FEATURES = [
  {
    id: "team",
    titleFa: "تیم متخصص",
    titleEn: "Expert Team",
    icon: (
      <svg className="w-5 h-5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    id: "data",
    titleFa: "استراتژی داده",
    titleEn: "Data Strategy",
    icon: (
      <svg className="w-5 h-5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    id: "support",
    titleFa: "پشتیبانی مستمر",
    titleEn: "Continuous Support",
    icon: (
      <svg className="w-5 h-5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 11a7 7 0 00-14 0m14 0a2 2 0 012 2v3a2 2 0 01-2 2h-1a1 1 0 01-1-1v-4a1 1 0 011-1h1zm-14 0a2 2 0 00-2 2v3a2 2 0 002 2h1a1 1 0 001-1v-4a1 1 0 00-1-1H5z"
        />
      </svg>
    ),
  },
  {
    id: "results",
    titleFa: "نتایج ملموس",
    titleEn: "Tangible Results",
    icon: (
      <svg className="w-5 h-5 text-[#38534A] dark:text-[#8AB3A0] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8.5" strokeWidth={1.8} />
        <circle cx="12" cy="12" r="4.5" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 6l-3.5 3.5" />
      </svg>
    ),
  },
];

type ApiFeature = {
  titleFa?: string;
  titleEn?: string;
  icon?: string;
};

const DEFAULT_CONTENT = {
  eyebrowFa: "درباره ما",
  eyebrowEn: "About Us",
  titleFa: "آنساپ؛ فراتر از یک تیم دیجیتال",
  titleEn: "OnSupp; Beyond a digital team",
  ctaFa: "شروع همکاری",
  ctaEn: "Get Started",
  ctaLink: "#contact",
  imageUrl:
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&q=80&auto=format&fit=crop",
  imageAlt: "تیم ما",
  subTitleFa: "شریک راهبردی شما",
  subTitleEn: "Your strategic partner",
  paragraphFa:
    "تیمی از متخصصان دیجیتال مارکتینگ که استراتژی، فناوری و خلاقیت را ترکیب می‌کنیم تا برند شما را به دنیای دیجیتال برسانند.",
  paragraphEn:
    "A team of digital marketing specialists who combine strategy, technology, and creativity to make your brand shine online.",
};



export default function About() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/about`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        if (data.content) {
          // If the backend sends the old title, we still want to use the new requested title for Persian
          const newContent = { ...DEFAULT_CONTENT, ...data.content };
          if (newContent.titleFa === "ما با داده و خلاقیت، برندها را رشد می‌دهیم" || newContent.eyebrowFa === "درباره ما") {
             newContent.titleFa = "آنساپ؛ فراتر از یک تیم دیجیتال";
          }
          setContent(newContent);
        }
        if (Array.isArray(data.features) && data.features.length > 0) {
          setFeatures(
            data.features.map((f: ApiFeature) => ({
              fa: f.titleFa || "",
              en: f.titleEn || "",
              icon: f.icon || "team",
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const imageSrc = content.imageUrl
    ? content.imageUrl.startsWith("http")
      ? content.imageUrl
      : `${BACKEND_URL}${content.imageUrl}`
    : DEFAULT_CONTENT.imageUrl;

  return (
    <section id="about" className="section-viewport-balanced w-full relative overflow-hidden bg-background">
      {/* ─── Mobile Version (Reference Design - lg:hidden) ─── */}
      <div className="lg:hidden w-full px-4 sm:px-6 py-10 max-w-lg mx-auto my-auto" dir={isRtl ? "rtl" : "ltr"}>
        {/* Team Photo with rounded corners and scale reveal */}
        <ScrollReveal animation="scaleUp" delay={0.1} duration={0.6}>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-card border border-foreground/10 bg-raised shadow-xl mb-4 xs:mb-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageSrc}
              alt={content.imageAlt || (isRtl ? "تیم ما" : "Our Team")}
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>
        </ScrollReveal>

        {/* Four Feature Cards in 2-Column Grid */}
        <ScrollReveal animation="slideUp" delay={0.15} duration={0.55}>
          <div className="grid grid-cols-2 gap-2.5 xs:gap-3 mb-6 xs:mb-7">
            {MOBILE_FEATURES.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-start gap-2 xs:gap-2.5 rounded-card-sm border border-foreground/10 bg-raised px-3 py-3.5 xs:px-3.5 xs:py-4 transition-all duration-200 active:scale-[0.98]"
              >
                <span className="text-mint shrink-0">
                  {item.icon}
                </span>
                <span className="text-[12px] xs:text-[13px] font-bold text-foreground tracking-tight select-none truncate">
                  {isRtl ? item.titleFa : item.titleEn}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Subtitle & Introduction Text & Full-Width Action CTA Button */}
        <ScrollReveal animation="slideUp" delay={0.2} duration={0.55}>
          <div className="text-start mb-6 xs:mb-7">
            <h3 className="font-display font-bold text-xl xs:text-[22px] text-foreground tracking-tight mb-2.5">
              {isRtl ? content.subTitleFa || "شریک راهبردی شما" : content.subTitleEn || "Your Strategic Partner"}
            </h3>
            <p className="text-xs xs:text-sm text-foreground/75 leading-[1.8]">
              {isRtl ? content.paragraphFa : content.paragraphEn}
            </p>
          </div>

          <motion.div
            whileHover={prefersReducedMotion ? undefined : buttonHover}
            whileTap={prefersReducedMotion ? undefined : tapFeedback}
          >
            <Link
              href={content.ctaLink || "#contact"}
              onClick={(e) => {
                const target = content.ctaLink || "#contact";
                if (target.includes("#") && scrollToSection(target)) {
                  e.preventDefault();
                }
              }}
              className={`group flex w-full h-12 xs:h-13 items-center justify-center gap-2.5 rounded-card-sm bg-[#38534A] hover:bg-[#2C423B] text-[#F8F9FA] border border-[#8AB3A0]/30 px-6 text-sm xs:text-base font-semibold shadow-[0_4px_16px_rgba(56,83,74,0.25)] active:scale-[0.98] transition-all duration-200 ${
                isRtl
                  ? "font-[family-name:var(--font-vazirmatn)]"
                  : "font-[family-name:var(--font-gendy)]"
              }`}
            >
              <svg className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isRtl ? "rotate-0 group-hover:-translate-x-1" : "rotate-180 group-hover:translate-x-1"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l6-6m-6 6l6 6" />
              </svg>
              <span>{isRtl ? content.ctaFa || "شروع همکاری" : content.ctaEn || "Get Started"}</span>
            </Link>
          </motion.div>
        </ScrollReveal>
      </div>

      {/* ─── Desktop Version (Strictly Preserved - hidden lg:block) ─── */}
      <div className="hidden lg:block w-full">
        <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
          <div className="section-viewport-balanced w-full border-y border-foreground/10 bg-panel px-6 sm:px-12 lg:px-24 py-12 sm:py-16 lg:py-24 relative overflow-hidden shadow-2xl">
            {/* Subtle background glow */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] pointer-events-none" />

            {/* Inner content constrained to max-w for readability */}
            <div className="relative z-10 mx-auto max-w-[1600px]">
              {/* Middle Row: Image and Text Content (Balanced vertical alignment and natural fill) */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
                {/* Text & Features (Placed first in DOM so it appears on the Right in RTL) */}
                <div className="col-span-1 lg:col-span-6 order-2 lg:order-1 flex flex-col justify-center">
                  <ScrollReveal animation="slideUp" delay={0.15} duration={0.7}>
                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5">
                      {features.map((f, i) => (
                        <motion.div
                          key={i}
                          whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }}
                          className="flex items-center gap-3.5 sm:gap-4 rounded-card border border-foreground/10 bg-raised/60 px-5 py-4 sm:py-4.5 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-[#38534A]/30 dark:hover:border-[#8AB3A0]/30 hover:bg-raised"
                        >
                          <span className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-control bg-panel text-[#38534A] dark:text-[#8AB3A0] shadow-inner border border-foreground/10">
                            {ICONS[f.icon] || ICONS.team}
                          </span>
                          <span className="text-sm sm:text-base font-bold text-foreground">
                            {isRtl ? f.fa : f.en}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Subtitle & Paragraph */}
                    <div className="mt-8 sm:mt-9 lg:mt-10">
                      <h3 className="font-display text-2xl sm:text-[26px] lg:text-[28px] font-bold tracking-tight text-foreground">
                        {isRtl ? content.subTitleFa : content.subTitleEn}
                      </h3>
                      <p className="mt-4 text-base sm:text-[17px] lg:text-[18px] leading-relaxed sm:leading-[1.9] text-foreground/75">
                        {isRtl ? content.paragraphFa : content.paragraphEn}
                      </p>
                    </div>
                    {/* CTA Button placed under paragraph */}
                    <div className="mt-8 pt-2">
                      <motion.div
                        whileHover={prefersReducedMotion ? undefined : buttonHover}
                        whileTap={prefersReducedMotion ? undefined : tapFeedback}
                        className="inline-block"
                      >
                        <Link
                          href={content.ctaLink || "#contact"}
                          onClick={(e) => {
                            const target = content.ctaLink || "#contact";
                            if (target.includes("#") && scrollToSection(target)) {
                              e.preventDefault();
                            }
                          }}
                          className={`group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-card-sm bg-[#38534A] hover:bg-[#2C423B] text-[#F8F9FA] border border-[#8AB3A0]/30 px-7 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold shadow-[0_8px_20px_-4px_rgba(56,83,74,0.3)] transition-all duration-300 cursor-pointer ${
                            isRtl
                              ? "font-[family-name:var(--font-vazirmatn)]"
                              : "font-[family-name:var(--font-gendy)]"
                          }`}
                        >
                          <span>{isRtl ? content.ctaFa : content.ctaEn}</span>
                          <svg className={`w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </motion.div>
                    </div>
                  </ScrollReveal>
                </div>

                {/* Image Presentation (Placed second in DOM so it appears on the Left in RTL) */}
                <div className="col-span-1 lg:col-span-6 order-1 lg:order-2 flex items-center">
                  <ScrollReveal animation="scaleUp" delay={0.25} duration={0.8} className="w-full">
                    <div className="group relative w-full aspect-[16/10.2] overflow-hidden rounded-card sm:rounded-panel border border-foreground/10 bg-raised shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent z-10 pointer-events-none" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={content.imageAlt || (isRtl ? "درباره ما" : "About us")}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 border border-foreground/10 rounded-card sm:rounded-panel z-20 pointer-events-none" />
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>{/* end inner max-w wrapper */}
          </div>{/* end panel */}
        </div>
      </div>
    </section>
  );
}