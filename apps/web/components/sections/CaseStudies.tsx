"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM } from "@/lib/motion";

import {
  type CaseStudyItem,
  SHOWCASE_PROJECTS,
  getAllCaseStudies,
} from "@/lib/case-studies";
import { scrollToSection } from "@/lib/scroll";

export type { CaseStudyItem };
export { SHOWCASE_PROJECTS };

// ─── Number Localization ───────────────────────────────────────────────────

const toFaDigits = (val: string | number): string =>
  String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

// ─── Project Type Icon ───────────────────────────────────────────────────────

const ProjectTypeIcon = React.memo(function ProjectTypeIcon({
  previewType,
}: {
  previewType: "mobile" | "web" | "platform";
}) {
  if (previewType === "mobile") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (previewType === "web") {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
});

// ─── Bespoke Interactive Visual Mockups ─────────────────────────────────────

const DeviceMockup = React.memo(function DeviceMockup({
  project,
  isRtl,
}: {
  project: CaseStudyItem;
  isRtl: boolean;
}) {
  if (project.previewType === "mobile") {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none">
        {/* Ambient backlight - optimized blur */}
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-[48px] pointer-events-none transition-all duration-500"
          style={{ backgroundColor: project.glowColor }}
        />

        {/* Floating background auxiliary pill */}
        <div
          className="hidden xl:flex absolute top-6 end-6 items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl text-[11px] font-mono text-white/80"
          dir="ltr"
        >
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span>Vitals: 98 BPM • Stable</span>
        </div>

        {/* Centerpiece Phone Frame */}
        <div className="relative w-[220px] sm:w-[245px] lg:w-[260px] h-[310px] sm:h-[360px] lg:h-[440px] rounded-[36px] bg-[#0c1218] border-[6px] border-[#1c2834] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Dynamic Island / Speaker Notch */}
          <div className="w-20 h-3.5 bg-black rounded-full mx-auto mt-2 z-20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1c2834] ml-auto mr-1.5" />
          </div>

          {/* App UI Header */}
          <div className="px-4 pt-2.5 pb-1.5 flex items-center justify-between text-white border-b border-white/5">
            <div className="flex flex-col">
              <span className="text-[9px] text-white/40 font-mono">Telemetry</span>
              <span className="text-[11px] font-bold font-sans">ICU Cardiology</span>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] text-[9px] font-bold">
              LIVE
            </div>
          </div>

          {/* Biometric Heartbeat Waveform */}
          <div className="px-3.5 py-2.5 flex-1 flex flex-col justify-between">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-white/50">Heart Rate Telemetry</span>
                <span className="text-xs font-bold text-[#38bdf8] font-mono">74 BPM</span>
              </div>
              <svg className="w-full h-11" viewBox="0 0 240 60" fill="none">
                <path
                  d="M0,30 L40,30 L50,15 L60,45 L70,10 L80,50 L90,30 L130,30 L140,18 L150,42 L160,30 L240,30"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-1.5">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[8px] text-white/40 block">Oxygen Sat</span>
                <span className="text-[11px] font-bold text-white font-mono">99% SpO2</span>
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-[8px] text-white/40 block">Blood Press.</span>
                <span className="text-[11px] font-bold text-white font-mono">118 / 78</span>
              </div>
            </div>

            {/* AI Diagnosis Pill */}
            <div className="p-2.5 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/25 flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#38bdf8] text-black flex items-center justify-center font-bold text-[10px] shrink-0">
                ✓
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-white truncate">Autonomous Protocol</span>
                <span className="text-[8px] text-white/60 truncate">Zero arrhythmia anomalies</span>
              </div>
            </div>

            {/* Bottom Nav Bar */}
            <div className="h-6 border-t border-white/5 flex items-center justify-around text-white/30 text-[10px] pt-0.5">
              <span className="text-[#38bdf8]">●</span>
              <span>■</span>
              <span>▲</span>
            </div>
          </div>
        </div>

        {/* Floating secondary badge */}
        <div
          className="hidden xl:flex absolute bottom-6 start-6 items-center gap-2.5 px-3 py-2 rounded-xl bg-[#091520]/80 backdrop-blur-xl border border-white/10 shadow-xl"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="w-6 h-6 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white">پردازش نانوثانیه‌ای</span>
            <span className="text-[9px] text-white/50">Zero packet drop</span>
          </div>
        </div>
      </div>
    );
  }

  if (project.previewType === "web") {
    return (
      <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none">
        {/* Ambient backlight - optimized blur */}
        <div
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-[48px] pointer-events-none transition-all duration-500"
          style={{ backgroundColor: project.glowColor }}
        />

        {/* Desktop Browser Window Mockup */}
        <div className="relative w-full max-w-[460px] xl:max-w-[500px] rounded-2xl bg-[#0e1713] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-transform duration-500 group-hover:scale-[1.02]">
          {/* Browser Header Bar */}
          <div className="w-full h-8 bg-[#08100c] border-b border-white/5 flex items-center justify-between px-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ff5f56]/80" />
              <div className="w-2 h-2 rounded-full bg-[#ffbd2e]/80" />
              <div className="w-2 h-2 rounded-full bg-[#27c93f]/80" />
              <span className="ml-2 text-[9px] font-mono text-white/40">app.finalytix.com/treasury</span>
            </div>
            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-lime/10 text-lime border border-lime/20">
              NEXT 16 READY
            </span>
          </div>

          {/* Browser Body / Dashboard */}
          <div className="p-4 sm:p-5 flex flex-col gap-3 font-sans">
            {/* KPI Top Strip */}
            <div className="flex items-end justify-between border-b border-white/5 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/40 block">Net Liquidity Yield</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
                  $84,290,140<span className="text-lime text-[11px] ml-1 font-normal">+18.4%</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/70 font-mono">1D</span>
                <span className="px-2 py-0.5 rounded bg-lime text-[9px] text-black font-bold font-mono">1W</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-white/70 font-mono">1Y</span>
              </div>
            </div>

            {/* Multi-tier Bar Chart */}
            <div className="h-24 sm:h-28 flex items-end gap-2 pt-1">
              {[45, 62, 50, 88, 70, 95, 82, 100, 78, 92].map((height, idx) => (
                <div key={idx} className="flex-1 bg-white/[0.04] rounded-t-sm h-full flex items-end">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-700 ${
                      idx === 7 ? "bg-lime shadow-[0_0_12px_#b2f800]" : "bg-white/20 group-hover:bg-white/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Insight Feed */}
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                <span className="text-white/80">AI Real-time Risk Mitigation Active</span>
              </div>
              <span className="text-white/40 font-mono text-[9px]">0.02ms latency</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // "platform" / logistics view
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden select-none">
      {/* Ambient backlight - optimized blur */}
      <div
        className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full blur-[48px] pointer-events-none transition-all duration-500"
        style={{ backgroundColor: project.glowColor }}
      />

      {/* Modern Fleet Portal Window */}
      <div className="relative w-full max-w-[460px] xl:max-w-[500px] rounded-2xl bg-[#160d1f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transition-transform duration-500 group-hover:scale-[1.02]">
        {/* Top Header */}
        <div className="w-full h-8 bg-[#0f0717] border-b border-white/5 flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#c084fc]" />
            <span className="text-[10px] font-bold text-white">Nova Fleet Commander</span>
          </div>
          <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/30">
            2,410 FLEET ACTIVE
          </span>
        </div>

        {/* Map / Dispatch Simulation */}
        <div className="p-4 sm:p-5 flex flex-col gap-3 font-sans">
          {/* Simulated Node Grid */}
          <div className="relative h-28 sm:h-32 rounded-xl bg-[#0d0515] border border-white/5 overflow-hidden flex items-center justify-center">
            {/* Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* Pulse Route Nodes */}
            <div className="relative z-10 flex items-center gap-6 sm:gap-10">
              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-[#c084fc] shadow-[0_0_12px_#c084fc] flex items-center justify-center text-[7px] text-black font-bold">
                  A
                </span>
                <span className="text-[8px] font-mono text-white/60">Dispatch</span>
              </div>

              <div className="w-16 sm:w-24 h-0.5 bg-gradient-to-r from-[#c084fc] to-lime relative">
                <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-ping" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-lime shadow-[0_0_12px_#b2f800] flex items-center justify-center text-[7px] text-black font-bold">
                  B
                </span>
                <span className="text-[8px] font-mono text-white/60">Delivered</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[8px] text-white/40 block">Dispatch Speed</span>
              <span className="text-xs font-bold text-white font-mono">14.2 min</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[8px] text-white/40 block">SLA Compliance</span>
              <span className="text-xs font-bold text-lime font-mono">99.8%</span>
            </div>
            <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5 text-center">
              <span className="text-[8px] text-white/40 block">Daily Jobs</span>
              <span className="text-xs font-bold text-[#c084fc] font-mono">18,400+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// ─── Main Case Studies Section ───────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const ROTATION_INTERVAL_MS = 4000;

// ─── Sequential Enter/Exit & Stagger Animation Variants (Matching Services) ───

const portfolioContainerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
      duration: 0.25,
      ease: EASE_PREMIUM,
    },
  },
};

const portfolioCardVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: EASE_PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transition: {
      duration: 0.2,
      ease: EASE_PREMIUM,
    },
  },
};

type FilterCategoryKey =
  | "all"
  | "web-design"
  | "instagram"
  | "seo"
  | "video"
  | "animation"
  | "coding"
  | "other";

const FILTER_CATEGORIES: {
  id: FilterCategoryKey;
  labelFa: string;
  labelEn: string;
}[] = [
  { id: "all", labelFa: "همه", labelEn: "All" },
  { id: "web-design", labelFa: "طراحی سایت", labelEn: "Web Design" },
  { id: "instagram", labelFa: "اینستاگرام", labelEn: "Instagram" },
  { id: "seo", labelFa: "سئو", labelEn: "SEO" },
  { id: "video", labelFa: "فیلمبرداری", labelEn: "Videography" },
  { id: "animation", labelFa: "انیمیشن", labelEn: "Animation" },
  { id: "coding", labelFa: "برنامه‌نویسی", labelEn: "Programming" },
  { id: "other", labelFa: "سایر خدمات", labelEn: "Other Services" },
];

function getProjectSearchableText(project: CaseStudyItem): string {
  return [
    project.categoryFa,
    project.categoryEn,
    project.titleFa,
    project.titleEn,
    project.taglineFa,
    project.taglineEn,
    ...(project.servicesFa || []),
    ...(project.servicesEn || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

function isWebDesignProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "website") return true;
  return hasAnyKeyword(text, [
    "طراحی سایت",
    "طراحی وب",
    "وب‌سایت",
    "وبسایت",
    "طراحی رابط کاربری",
    "طراحی ui/ux",
    "پلتفرم تحلیلی",
    "داشبورد",
    "next.js",
    "web design",
    "website",
    "dark ui/ux",
  ]);
}

function isInstagramProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "instagram") return true;
  return hasAnyKeyword(text, [
    "اینستاگرام",
    "سوشال",
    "سوشیال",
    "شبکه‌های اجتماعی",
    "ریلز",
    "instagram",
    "social media",
    "reels",
  ]);
}

function isSeoProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "seo") return true;
  return hasAnyKeyword(text, [
    "سئو",
    "بهینه‌سازی موتور",
    "رتبه گوگل",
    "رتبه‌بندی گوگل",
    "ترافیک ارگانیک",
    "کیوورد",
    "seo",
    "search engine",
    "organic search",
  ]);
}

function isVideoProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "video") return true;
  return hasAnyKeyword(text, [
    "فیلمبرداری",
    "فیلم‌برداری",
    "تیزر تبلیغاتی",
    "تیزر صنعتی",
    "تدوین",
    "ویدیو",
    "ویدئو",
    "سینمایی",
    "videography",
    "video production",
    "cinematography",
  ]);
}

function isAnimationProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "animation") return true;
  return hasAnyKeyword(text, [
    "انیمیشن",
    "موشن گرافیک",
    "موشن‌گرافیک",
    "سه‌بعدی",
    "animation",
    "motion graphics",
    "3d modeling",
  ]);
}

function isCodingProject(project: CaseStudyItem, text: string): boolean {
  if (project.projectType === "app" || project.projectType === "software") {
    return true;
  }
  return hasAnyKeyword(text, [
    "برنامه‌نویسی",
    "توسعه",
    "اپلیکیشن",
    "نرم‌افزار",
    "معماری",
    "میکروسرویس",
    "کلود",
    "کلاود",
    "کوبرنتیز",
    "هوش مصنوعی",
    "یادگیری عمیق",
    "ترنسفورمر",
    "سوکت",
    "react",
    "next.js",
    "ios",
    "engineering",
    "kubernetes",
    "websocket",
    "transformers",
  ]);
}

function matchesFilterCategory(
  project: CaseStudyItem,
  filterKey: FilterCategoryKey
): boolean {
  if (filterKey === "all") return true;
  const text = getProjectSearchableText(project);

  switch (filterKey) {
    case "web-design":
      return isWebDesignProject(project, text);
    case "instagram":
      return isInstagramProject(project, text);
    case "seo":
      return isSeoProject(project, text);
    case "video":
      return isVideoProject(project, text);
    case "animation":
      return isAnimationProject(project, text);
    case "coding":
      return isCodingProject(project, text);
    case "other": {
      const hasSpecializedService = hasAnyKeyword(text, [
        "crm",
        "اتوماسیون",
        "استراتژی محصول",
        "دیزاین سیستم",
        "لجستیک",
        "اومنی‌چنل",
        "زیرساخت ابری",
        "دواپس",
        "مراکز تماس",
        "تله‌متری",
        "برندینگ",
        "هویت بصری",
        "automation",
        "devops",
        "omni-channel",
        "design system",
        "call mesh",
        "telemetry",
      ]);
      const matchesPrimarySix =
        isWebDesignProject(project, text) ||
        isInstagramProject(project, text) ||
        isSeoProject(project, text) ||
        isVideoProject(project, text) ||
        isAnimationProject(project, text) ||
        isCodingProject(project, text);
      return hasSpecializedService || !matchesPrimarySix;
    }
    default:
      return true;
  }
}

export default function CaseStudies() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const [projects, setProjects] = useState<CaseStudyItem[]>(() => getAllCaseStudies(SHOWCASE_PROJECTS));
  const [selectedCategory, setSelectedCategory] = useState<FilterCategoryKey>("all");
  const [startIndex, setStartIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [rotationPhase, setRotationPhase] = useState<"idle" | "collapsing" | "sliding">("idle");
  const [slideOffset, setSlideOffset] = useState<number>(0);
  const [isSlideAnimating, setIsSlideAnimating] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  const filteredProjects = useMemo(
    () => projects.filter((p) => matchesFilterCategory(p, selectedCategory)),
    [projects, selectedCategory]
  );

  // Maintain exactly 3 cards visible on the homepage at all times
  const visibleProjects = useMemo(() => {
    const n = filteredProjects.length;
    if (n === 0) return [];
    if (n <= 3) return filteredProjects;
    return [
      filteredProjects[startIndex % n],
      filteredProjects[(startIndex + 1) % n],
      filteredProjects[(startIndex + 2) % n],
    ];
  }, [filteredProjects, startIndex]);

  // Display projects: 4 cards during track slide, exactly 3 cards otherwise
  const displayProjects = useMemo(() => {
    const n = filteredProjects.length;
    if (n === 0) return [];
    if (n <= 3) return filteredProjects;
    if (rotationPhase === "sliding") {
      return [
        filteredProjects[startIndex % n],
        filteredProjects[(startIndex + 1) % n],
        filteredProjects[(startIndex + 2) % n],
        filteredProjects[(startIndex + 3) % n],
      ];
    }
    return [
      filteredProjects[startIndex % n],
      filteredProjects[(startIndex + 1) % n],
      filteredProjects[(startIndex + 2) % n],
    ];
  }, [filteredProjects, startIndex, rotationPhase]);

  // Section reference and in-view state for starting/pausing autoplay
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState<boolean>(true);

  // Touch tracking for mobile/tablet gesture pauses
  const [isTouching, setIsTouching] = useState<boolean>(false);

  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep references to latest values for timer callbacks
  const filteredProjectsRef = useRef(filteredProjects);
  filteredProjectsRef.current = filteredProjects;
  const rotationPhaseRef = useRef(rotationPhase);
  rotationPhaseRef.current = rotationPhase;

  const handleSelectCategory = (categoryKey: FilterCategoryKey) => {
    setSelectedCategory(categoryKey);
    setStartIndex(0);
    setActiveStep(0);
    setRotationPhase("idle");
    setIsSlideAnimating(false);
    setSlideOffset(0);
  };

  // Intersection observer: starts autoplay as soon as section enters view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "100px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sync projects with backend database if available
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/casestudies`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItems) => {
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const merged: CaseStudyItem[] = [...SHOWCASE_PROJECTS];
          for (const item of dbItems) {
            const exists = merged.some(
              (p) => p.id === String(item.id) || p.slug === item.titleEn?.toLowerCase().replace(/\s+/g, "-")
            );
            if (!exists) {
              const previewType: "mobile" | "web" | "platform" =
                item.projectType === "app"
                  ? "mobile"
                  : item.projectType === "instagram"
                  ? "platform"
                  : "web";
              merged.push({
                id: String(item.id),
                slug: `project-${item.id}`,
                client: item.titleFa || "مشتری سازمانی",
                clientEn: item.titleEn || "Enterprise Client",
                titleFa: item.titleFa || "",
                titleEn: item.titleEn || "",
                taglineFa: item.descriptionFa || "",
                taglineEn: item.descriptionEn || "",
                categoryFa: item.categoryFa || "دیجیتال",
                categoryEn: item.categoryEn || "Digital",
                servicesFa: [item.categoryFa || "توسعه محصول"],
                servicesEn: [item.categoryEn || "Product Development"],
                metricsFa: [{ value: "۱۰۰٪", label: "رضایت کارفرما" }],
                metricsEn: [{ value: "100%", label: "Client Satisfaction" }],
                colorGradient: "from-[#0d1620] via-[#112338] to-[#081018]",
                accentColor: "#38bdf8",
                glowColor: "rgba(56, 189, 248, 0.15)",
                previewType,
                projectType: item.projectType || "website",
                liveUrl: item.liveUrl || "#",
                featured: false,
                position: item.position ?? 999,
              });
            }
          }
          const allProjects = getAllCaseStudies(merged);
          setProjects(allProjects);
          setStartIndex(0);
          setActiveStep(0);
        }
      })
      .catch(() => {});
  }, []);

  // ─── Clockwork Autoplay Advance ──────────────────────────────────────────
  // Step 0: Card 1 expands, stays open, collapses
  // Step 1: Card 2 expands, stays open, collapses
  // Step 2: Card 3 expands, stays open, collapses
  // Step 3: Card 3 smoothly collapses completely -> 3-card cycle ends
  // Step 4: Oldest project smoothly exits, next project smoothly enters
  // Step 5: New 3-card window becomes stable -> Next autoplay cycle begins!
  const advanceSequence = useCallback(() => {
    const n = filteredProjectsRef.current.length;
    if (n === 0) return;

    if (n <= 3) {
      setActiveStep((prev) => (prev + 1) % n);
      return;
    }

    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
    } else {
      // Step 2 reached: third card open duration ends!
      // Step 1: Smoothly collapse the third card completely (all 3 cards return to equal rest state)
      setRotationPhase("collapsing");
      setActiveStep(-1);
    }
  }, [activeStep]);

  // Step 2 completed: 3-card cycle ends on collapse completion -> trigger Step 3 & 4 (sliding track)
  const handleCardTransitionEnd = (slotIdx: number, e: React.TransitionEvent<HTMLDivElement>) => {
    if (rotationPhaseRef.current !== "collapsing") return;
    if (e.propertyName !== "flex-grow" && e.propertyName !== "flex-basis") return;
    // Slot 0 transitions from 80px to equal width, marking completion of the collapse
    if (slotIdx !== 0) return;

    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      const gap = window.innerWidth >= 1280 ? 16 : 12;
      const cardW = (width - 2 * gap) / 3;
      setSlideOffset(cardW + gap);
    }
    setRotationPhase("sliding");
  };

  // Trigger slide transform on next animation frame
  useEffect(() => {
    if (rotationPhase === "sliding" && slideOffset > 0 && !isSlideAnimating) {
      const raf = requestAnimationFrame(() => {
        setIsSlideAnimating(true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [rotationPhase, slideOffset, isSlideAnimating]);

  // Step 5: New window becomes stable -> Step 6: Start next autoplay cycle!
  const handleTrackTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== trackRef.current || e.propertyName !== "transform") return;
    if (rotationPhaseRef.current === "sliding") {
      const n = filteredProjectsRef.current.length;
      setStartIndex((prev) => (prev + 1) % n);
      setRotationPhase("idle");
      setIsSlideAnimating(false);
      setSlideOffset(0);
      setActiveStep(0);
    }
  };

  // Safety timeouts in case user backgrounded tab or transition was skipped
  useEffect(() => {
    if (rotationPhase === "collapsing") {
      const safety = setTimeout(() => {
        if (rotationPhaseRef.current === "collapsing") {
          if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const gap = window.innerWidth >= 1280 ? 16 : 12;
            const cardW = (width - 2 * gap) / 3;
            setSlideOffset(cardW + gap);
          }
          setRotationPhase("sliding");
        }
      }, 850);
      return () => clearTimeout(safety);
    }
    if (rotationPhase === "sliding") {
      const safety = setTimeout(() => {
        if (rotationPhaseRef.current === "sliding") {
          const n = filteredProjectsRef.current.length;
          setStartIndex((prev) => (prev + 1) % n);
          setRotationPhase("idle");
          setIsSlideAnimating(false);
          setSlideOffset(0);
          setActiveStep(0);
        }
      }, 750);
      return () => clearTimeout(safety);
    }
  }, [rotationPhase]);

  // Manual card click: immediately expands the clicked card and resets the timer
  const handleCardClick = (project: CaseStudyItem) => {
    if (rotationPhaseRef.current !== "idle") {
      setRotationPhase("idle");
      setIsSlideAnimating(false);
      setSlideOffset(0);
    }
    const slot = visibleProjects.findIndex((p) => p.id === project.id);
    if (slot >= 0 && slot !== activeStep) {
      setActiveStep(slot);
    }
  };

  // Pagination dot click: navigates directly to the target project
  const handleDotClick = (targetIndex: number) => {
    if (rotationPhaseRef.current !== "idle") {
      setRotationPhase("idle");
      setIsSlideAnimating(false);
      setSlideOffset(0);
    }
    const n = filteredProjects.length;
    if (n === 0) return;
    const targetProject = filteredProjects[targetIndex];
    if (!targetProject) return;

    const slot = visibleProjects.findIndex((p) => p.id === targetProject.id);
    if (slot >= 0) {
      setActiveStep(slot);
    } else {
      setStartIndex(targetIndex % n);
      setActiveStep(0);
    }
  };

  // Touch handlers for mobile: pauses briefly on touch gesture, resumes after release
  const handleTouchStartCards = useCallback(() => {
    if (touchResumeTimerRef.current) {
      clearTimeout(touchResumeTimerRef.current);
      touchResumeTimerRef.current = null;
    }
    setIsTouching(true);
  }, []);

  const handleTouchEndCards = useCallback(() => {
    if (touchResumeTimerRef.current) {
      clearTimeout(touchResumeTimerRef.current);
    }
    touchResumeTimerRef.current = setTimeout(() => {
      setIsTouching(false);
    }, 400);
  }, []);

  // Master Auto-play effect:
  // Pure clockwork progression that is NOT disrupted or restarted by hover events.
  // Pauses only when off-screen, when reduced-motion is active, or during active touch gestures.
  useEffect(() => {
    if (shouldReduceMotion || !isInView || isTouching || filteredProjects.length <= 1) {
      if (rotationTimerRef.current) {
        clearTimeout(rotationTimerRef.current);
        rotationTimerRef.current = null;
      }
      return;
    }

    if (rotationPhase !== "idle") {
      return;
    }

    rotationTimerRef.current = setTimeout(() => {
      advanceSequence();
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (rotationTimerRef.current) {
        clearTimeout(rotationTimerRef.current);
        rotationTimerRef.current = null;
      }
    };
  }, [
    shouldReduceMotion,
    isInView,
    isTouching,
    startIndex,
    activeStep,
    rotationPhase,
    filteredProjects.length,
    advanceSequence,
  ]);

  useEffect(() => {
    return () => {
      if (touchResumeTimerRef.current) {
        clearTimeout(touchResumeTimerRef.current);
      }
      if (rotationTimerRef.current) {
        clearTimeout(rotationTimerRef.current);
      }
    };
  }, []);

  const activeCategoryObj = FILTER_CATEGORIES.find(
    (c) => c.id === selectedCategory
  );

  const activeProject = visibleProjects[activeStep] || visibleProjects[0];

  return (
    <section
      ref={sectionRef}
      id="case-studies"
      className="w-full px-2 sm:px-[10px] py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-[#131618] border-b border-white/5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Ambient background glows - optimized blur */}
      <div className="absolute top-1/4 start-1/4 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-[400px] h-[400px] bg-mint/5 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">
        <ScrollReveal>
          {/* ── Section Header ───────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-3 text-sm font-bold tracking-widest text-mint uppercase">
              <span className="h-px w-10 bg-mint/50" />
              <span>{isRtl ? "پرونده پروژه‌های شاخص" : "Selected Case Studies"}</span>
            </div>

            <h2 className="mt-4 sm:mt-6 font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
              {isRtl ? "نمونه‌کارهای ما" : "Our Work"}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed max-w-md">
            {isRtl
              ? "روایت خلق محصولات دیجیتال فراتر از مرزها؛ تلفیق استراتژی عمیق تجاری، دیزاین لوکس و مهندسی نرم‌افزارهای مقیاس‌پذیر."
              : "A showcase of high-impact digital experiences engineered for category leaders — from zero to market dominance."}
          </p>
        </div>

        {/* ── Category Filter Buttons Bar ──────────────────────────────── */}
        <div
          role="tablist"
          aria-label={isRtl ? "فیلتر دسته‌بندی نمونه‌کارها" : "Filter case studies by category"}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mb-8 sm:mb-10"
        >
          {FILTER_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleSelectCategory(cat.id)}
                className={`min-h-[38px] sm:min-h-[42px] px-3.5 sm:px-4 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer select-none inline-flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-[#3f6b59] border-[#8ab3a0]/50 text-white shadow-[0_6px_20px_rgba(63,107,89,0.35)]"
                    : "bg-panel border-white/10 text-foreground/70 hover:text-white hover:border-white/25 hover:bg-raised/80"
                }`}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-mint shrink-0" />
                )}
                <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key={`empty-${selectedCategory}`}
              initial={shouldReduceMotion ? undefined : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
              className="w-full rounded-3xl glass-panel border border-white/10 px-6 py-16 sm:py-20 text-center flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-panel border border-white/10 flex items-center justify-center text-mint mb-1">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white">
                {isRtl
                  ? `در حال حاضر پروژه‌ای در دسته‌بندی «${activeCategoryObj?.labelFa || ""}» ثبت نشده است`
                  : `No projects available in "${activeCategoryObj?.labelEn || ""}" yet`}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/55 max-w-md">
                {isRtl
                  ? "می‌توانید سایر دسته‌بندی‌های تخصصی را بررسی کنید یا همه پروژه‌های شاخص را مشاهده نمایید."
                  : "Explore other specialized categories or view all featured case studies."}
              </p>
              <button
                type="button"
                onClick={() => handleSelectCategory("all")}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#3f6b59] hover:bg-[#4b7d68] border border-[#8ab3a0]/40 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
              >
                {isRtl ? "نمایش همه پروژه‌ها" : "Show All Projects"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`showcase-wrapper-${selectedCategory}`}
              variants={shouldReduceMotion ? undefined : portfolioContainerVariants}
              initial={shouldReduceMotion ? undefined : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
              exit={shouldReduceMotion ? undefined : "exit"}
              className="w-full"
            >
              {/* ── Desktop Horizontal Expand/Collapse Showcase Strip (Exactly 3 Cards) ── */}
              <div
                ref={containerRef}
                className="hidden lg:block w-full h-[560px] xl:h-[580px] overflow-hidden select-none relative"
              >
                <div
                  ref={trackRef}
                  onTransitionEnd={handleTrackTransitionEnd}
                  className="flex flex-row h-full gap-3 xl:gap-4 items-stretch select-none"
                  style={{
                    transform:
                      rotationPhase === "sliding" && isSlideAnimating
                        ? `translateX(${isRtl ? slideOffset : -slideOffset}px)`
                        : "translateX(0px)",
                    transition:
                      rotationPhase === "sliding" && isSlideAnimating
                        ? "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)"
                        : "none",
                  }}
                >
                  {displayProjects.map((project, slotIdx) => {
                    const isAnyExpanded = activeStep >= 0;
                    const isExpanded = slotIdx === activeStep && rotationPhase === "idle";

                    let flexClass = "";
                    let inlineStyle: React.CSSProperties = { transform: "translateZ(0)" };

                    if (rotationPhase === "sliding") {
                      const width = containerRef.current?.offsetWidth || 1200;
                      const gap = typeof window !== "undefined" && window.innerWidth >= 1280 ? 16 : 12;
                      const cardW = (width - 2 * gap) / 3;
                      inlineStyle = {
                        ...inlineStyle,
                        width: `${cardW}px`,
                        flex: `0 0 ${cardW}px`,
                      };
                      flexClass = "border-white/10 hover:border-white/25 hover:bg-raised/80 cursor-pointer";
                    } else if (isAnyExpanded) {
                      if (isExpanded) {
                        flexClass = "flex-[1_1_0%] border-white/20 shadow-[0_25px_60px_rgba(0,0,0,0.7)] cursor-default";
                      } else {
                        flexClass = "flex-[0_0_80px] xl:flex-[0_0_92px] shrink-0 border-white/10 hover:border-white/25 hover:bg-raised/80 cursor-pointer";
                      }
                    } else {
                      flexClass = "flex-[1_1_0%] min-w-0 border-white/10 hover:border-white/25 hover:bg-raised/80 cursor-pointer";
                    }

                    return (
                      <div
                        key={project.id}
                        data-project-id={project.id}
                        onTransitionEnd={(e) => handleCardTransitionEnd(slotIdx, e)}
                        className={`group relative h-full rounded-3xl glass-panel min-w-0 overflow-hidden select-none transition-[flex-grow,flex-basis,border-color,background-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${flexClass}`}
                        style={inlineStyle}
                        onClick={() => handleCardClick(project)}
                      >
                      {/* ── Layer 1: Expanded Detailed Showcase ── */}
                      <div
                        aria-hidden={!isExpanded}
                        className={`absolute inset-0 w-full h-full flex flex-row items-stretch transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isExpanded
                            ? "opacity-100 pointer-events-auto z-10 visible translate-x-0"
                            : "opacity-0 pointer-events-none z-0 invisible " +
                              (isRtl ? "translate-x-4" : "-translate-x-4")
                        }`}
                        style={{ willChange: "opacity, transform" }}
                      >
                        {/* Ambient background glow - optimized blur */}
                        <div
                          className="absolute -top-24 start-1/3 w-[360px] h-[360px] rounded-full blur-[60px] pointer-events-none opacity-40"
                          style={{ backgroundColor: project.glowColor }}
                        />

                        {/* Content Column (Left in LTR, Right in RTL) */}
                        <div
                          className={`w-[48%] xl:w-[45%] shrink-0 p-6 xl:p-8 flex flex-col justify-between h-full relative z-10 overflow-y-auto no-scrollbar transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                            isExpanded
                              ? "translate-x-0"
                              : isRtl
                              ? "translate-x-3"
                              : "-translate-x-3"
                          }`}
                        >
                          <div>
                            {/* Eyebrow & Project Type Badge (No numbers) */}
                            <div className="flex items-center justify-between gap-3 mb-4">
                              <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: project.accentColor }}
                                />
                                {isRtl ? project.categoryFa : project.categoryEn}
                              </span>

                              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 shrink-0">
                                <ProjectTypeIcon previewType={project.previewType} />
                              </div>
                            </div>

                            {/* Client Name */}
                            <span className="text-xs xl:text-sm font-semibold uppercase tracking-widest text-mint block mb-1">
                              {isRtl ? project.client : project.clientEn}
                            </span>

                            {/* Case Study Title */}
                            <h3 className="font-display text-xl xl:text-2xl font-bold tracking-tight text-white leading-tight mb-2.5">
                              {isRtl ? project.titleFa : project.titleEn}
                            </h3>

                            {/* Tagline / Narrative */}
                            <p className="text-xs xl:text-sm text-foreground/75 leading-relaxed mb-4 line-clamp-2 xl:line-clamp-3">
                              {isRtl ? project.taglineFa : project.taglineEn}
                            </p>

                            {/* Services Tags */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {(isRtl ? project.servicesFa : project.servicesEn).map((service, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-0.5 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/70 font-medium"
                                >
                                  {service}
                                </span>
                              ))}
                            </div>

                            {/* Metrics Strip */}
                            <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10 mb-4">
                              {(isRtl ? project.metricsFa : project.metricsEn).map((metric, i) => (
                                <div key={i} className="flex flex-col">
                                  <span
                                    className="font-display text-lg xl:text-xl font-bold tracking-tight"
                                    style={{ color: project.accentColor }}
                                    dir="ltr"
                                  >
                                    {isRtl ? toFaDigits(metric.value) : metric.value}
                                  </span>
                                  <span className="text-[10px] xl:text-[11px] text-white/50 leading-tight mt-0.5">
                                    {metric.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* CTA Action: View Case Study */}
                          <div className="pt-2">
                            {project.liveUrl &&
                            project.liveUrl.startsWith("http") &&
                            !project.liveUrl.includes("example.com") ? (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2.5 rounded-xl bg-white/[0.05] hover:bg-lime border border-white/10 hover:border-lime px-5 py-2.5 text-xs xl:text-sm font-bold text-white hover:text-ink transition-all duration-300 shadow-md hover:shadow-[0_0_24px_rgba(178,248,0,0.3)] active:scale-95 group/btn"
                              >
                                <span>{isRtl ? "مشاهده پرونده پروژه" : "View Case Study"}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                    isRtl ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </a>
                            ) : (
                              <Link
                                href={
                                  project.liveUrl && project.liveUrl.startsWith("/")
                                    ? project.liveUrl
                                    : "/case-studies"
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2.5 rounded-xl bg-white/[0.05] hover:bg-lime border border-white/10 hover:border-lime px-5 py-2.5 text-xs xl:text-sm font-bold text-white hover:text-ink transition-all duration-300 shadow-md hover:shadow-[0_0_24px_rgba(178,248,0,0.3)] active:scale-95 group/btn"
                              >
                                <span>{isRtl ? "مشاهده پرونده پروژه" : "View Case Study"}</span>
                                <svg
                                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                                    isRtl ? "rotate-180 group-hover/btn:-translate-x-1" : "group-hover/btn:translate-x-1"
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2.5"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Visual Showcase Column */}
                        <div
                          className={`flex-1 relative overflow-hidden bg-gradient-to-br ${project.colorGradient} border-s border-white/5 flex items-center justify-center`}
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
                          {isExpanded && <DeviceMockup project={project} isRtl={isRtl} />}
                        </div>
                      </div>

                      {/* ── Layer 2: Narrow Collapsed Strip (No numbers) ── */}
                      <div
                        aria-hidden={isExpanded}
                        className={`absolute inset-0 w-full h-full flex flex-col items-center justify-between py-6 px-2 text-start transition-opacity duration-300 ease-out ${
                          !isExpanded
                            ? "opacity-100 pointer-events-auto z-10"
                            : "opacity-0 pointer-events-none z-0"
                        }`}
                      >
                        {/* Subtle hover tint */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                          style={{ backgroundColor: project.glowColor }}
                        />

                        {/* Top: Accent Dot & Icon */}
                        <div className="flex flex-col items-center gap-3 z-10">
                          <span
                            className="w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125"
                            style={{ backgroundColor: project.accentColor }}
                          />
                          <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/25 flex items-center justify-center text-white/60 group-hover:text-white transition-all">
                            <ProjectTypeIcon previewType={project.previewType} />
                          </div>
                        </div>

                        {/* Middle: Rotated Client Name */}
                        <div className="flex-1 flex items-center justify-center relative my-4 w-full z-10">
                          <span
                            className={`whitespace-nowrap text-xs xl:text-sm font-bold tracking-wider text-white/60 group-hover:text-white transition-colors select-none ${
                              isRtl ? "rotate-90" : "-rotate-90"
                            }`}
                          >
                            {isRtl ? project.client : project.clientEn}
                          </span>
                        </div>

                        {/* Bottom: Expand hint button & accent bar */}
                        <div className="flex flex-col items-center gap-2 z-10">
                          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-lime border border-white/10 group-hover:border-lime flex items-center justify-center text-white/60 group-hover:text-ink transition-all shadow-sm">
                            <svg className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div
                            className="w-6 h-1 rounded-full opacity-30 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: project.accentColor }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>

        {/* ── Mobile Compact Accordion (< 1024px) (Max 3 Cards) ────────── */}
        <div
          className="flex lg:hidden flex-col gap-3 w-full overflow-hidden"
          onTouchStart={handleTouchStartCards}
          onTouchMove={handleTouchStartCards}
          onTouchEnd={handleTouchEndCards}
          onTouchCancel={handleTouchEndCards}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visibleProjects.map((project, slotIdx) => {
              const isExpanded = slotIdx === activeStep;

              return (
                <motion.div
                  key={project.id}
                  layout="position"
                  initial={shouldReduceMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE_PREMIUM }}
                  className="w-full rounded-2xl glass-panel transition-colors duration-300 overflow-hidden shadow-lg"
                  style={{
                    borderColor: isExpanded ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    transform: "translateZ(0)",
                  }}
                >
                  {/* Header: Tap to select and expand (No numbers, always one open) */}
                  <button
                    type="button"
                    onClick={() => handleCardClick(project)}
                    className="w-full flex items-center justify-between p-4 bg-[#141b21]/80 hover:bg-raised/70 text-start cursor-pointer focus:outline-none transition-colors"
                  >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 shrink-0">
                      <ProjectTypeIcon previewType={project.previewType} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: project.accentColor }}
                        />
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {isRtl ? project.client : project.clientEn}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/50 truncate mt-0.5">
                        {isRtl ? project.categoryFa : project.categoryEn}
                      </span>
                    </div>
                  </div>

                  {/* Smooth rotate toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.div
                      animate={{ rotate: isExpanded ? 45 : 0 }}
                      transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                        isExpanded
                          ? "bg-lime text-ink border-lime"
                          : "bg-white/5 text-white/70 border-white/10"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.div>
                  </div>
                </button>

                {/* Animated Body Content with smooth height transition */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="mobile-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                        transition: {
                          height: {
                            duration: shouldReduceMotion ? 0.01 : 0.38,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: {
                            duration: shouldReduceMotion ? 0.01 : 0.28,
                            delay: shouldReduceMotion ? 0 : 0.05,
                          },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: shouldReduceMotion ? 0.01 : 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          },
                          opacity: {
                            duration: shouldReduceMotion ? 0.01 : 0.18,
                          },
                        },
                      }}
                      style={{ willChange: "height, opacity", transform: "translateZ(0)" }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-3.5 sm:p-4 flex flex-col gap-3">
                        {/* Title & Tagline */}
                        <div>
                          <h3 className="font-display text-lg sm:text-xl font-bold text-white leading-tight mb-2">
                            {isRtl ? project.titleFa : project.titleEn}
                          </h3>
                          <p className="text-xs text-foreground/75 leading-relaxed">
                            {isRtl ? project.taglineFa : project.taglineEn}
                          </p>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-1.5">
                          {(isRtl ? project.servicesFa : project.servicesEn).map((service, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/5 text-[10px] text-white/70"
                            >
                              {service}
                            </span>
                          ))}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/10 text-center">
                          {(isRtl ? project.metricsFa : project.metricsEn).map((metric, i) => (
                            <div key={i} className="flex flex-col">
                              <span
                                className="font-display text-base font-bold"
                                style={{ color: project.accentColor }}
                                dir="ltr"
                              >
                                {isRtl ? toFaDigits(metric.value) : metric.value}
                              </span>
                              <span className="text-[10px] text-white/50 leading-tight mt-0.5">
                                {metric.label}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Mockup Container */}
                        <div className={`relative w-full min-h-[250px] sm:min-h-[290px] py-2 flex items-center justify-center rounded-xl bg-gradient-to-br ${project.colorGradient} overflow-hidden border border-white/5`}>
                          <DeviceMockup project={project} isRtl={isRtl} />
                        </div>

                        {/* CTA Button */}
                        <div className="pt-1">
                          {project.liveUrl &&
                          project.liveUrl.startsWith("http") &&
                          !project.liveUrl.includes("example.com") ? (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-xs sm:text-sm font-bold text-ink shadow-md active:scale-95 transition-all"
                            >
                              <span>{isRtl ? "مشاهده پرونده پروژه" : "View Case Study"}</span>
                              <svg
                                className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </a>
                          ) : (
                            <Link
                              href={
                                project.liveUrl && project.liveUrl.startsWith("/")
                                  ? project.liveUrl
                                  : "/case-studies"
                              }
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime px-5 py-3 text-xs sm:text-sm font-bold text-ink shadow-md active:scale-95 transition-all"
                            >
                              <span>{isRtl ? "مشاهده پرونده پروژه" : "View Case Study"}</span>
                              <svg
                                className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>

        {/* ── Indicator Dots for Carousel Progress ──────────────────────── */}
        {filteredProjects.length > 3 && (
          <div
            className="flex items-center justify-center gap-2 mt-6 sm:mt-8"
            dir="ltr"
            aria-label={isRtl ? "پروژه‌های نمونه‌کار" : "Case study pagination"}
          >
            {filteredProjects.map((project, idx) => {
              const isCurrent = activeProject?.id === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => handleDotClick(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? "w-8 bg-lime shadow-[0_0_12px_rgba(178,248,0,0.5)]"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  title={isRtl ? project.titleFa : project.titleEn}
                />
              );
            })}
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>

        {/* ── Bottom Section CTA ───────────────────────────────────────── */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col text-center sm:text-start">
            <span className="font-display text-lg sm:text-xl font-bold text-white">
              {isRtl ? "آماده خلق داستان موفقیت برند خود هستید؟" : "Ready to engineer your next milestone?"}
            </span>
            <span className="text-xs sm:text-sm text-foreground/60 mt-0.5">
              {isRtl ? "بیایید درباره چالش‌ها و چشم‌انداز محصول شما صحبت کنیم." : "Let's explore your product roadmap together."}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mint/30 px-5 py-3 text-xs sm:text-sm font-semibold text-white hover:text-mint transition-all active:scale-95"
            >
              <span>{isRtl ? "مشاهده همه نمونه‌کارها" : "View All Case Studies"}</span>
              <svg
                className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="#contact"
              onClick={(e) => {
                if (scrollToSection("contact")) {
                  e.preventDefault();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-6 py-3 text-xs sm:text-sm font-bold text-ink shadow-[0_0_24px_rgba(178,248,0,0.25)] transition-all hover:scale-105 active:scale-95"
            >
              <span>{isRtl ? "درخواست جلسه مشاوره" : "Start Your Project"}</span>
              <svg
                className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  </section>
);
}
