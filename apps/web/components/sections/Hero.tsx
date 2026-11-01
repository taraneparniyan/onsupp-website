"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { fadeInUp, staggerContainer, buttonHover, tapFeedback } from "@/lib/motion";
import { scrollToSection } from "@/lib/scroll";

type HeroSettings = {
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaText2: string;
  ctaText2En: string;
  ctaLink2: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const FALLBACK: HeroSettings = {
  title: "رشد دیجیتال شما، افقی نو می‌شود",
  titleEn: "Your Digital Growth, A New Horizon",
  subtitle:
    "طراحی و اجرای راهکارهای وب، سئو، تولید محتوا و نرم‌افزارهای اختصاصی متناسب با اهداف کسب‌وکار شما.",
  subtitleEn:
    "Tailored web engineering, technical SEO, content production, and custom software aligned with your business goals.",
  ctaText: "درخواست مشاوره",
  ctaTextEn: "Request Consultation",
  ctaLink: "#contact",
  ctaText2: "خدمات ما",
  ctaText2En: "Our Services",
  ctaLink2: "#services",
  imageUrl: null,
  imageAlt: null,
};

// ─── Desktop 3D Parallax Visual (Hidden on Mobile) ───────────────────────────

const PremiumDigitalVisual = ({
  smoothX,
  smoothY,
  isRtl,
}: {
  smoothX: any;
  smoothY: any;
  isRtl: boolean;
}) => {
  // Parallax transforms for depth layers
  const x1 = useTransform(smoothX, [-1, 1], [-12, 12]);
  const y1 = useTransform(smoothY, [-1, 1], [-12, 12]);

  const x2 = useTransform(smoothX, [-1, 1], [-28, 28]);
  const y2 = useTransform(smoothY, [-1, 1], [-28, 28]);

  const x3 = useTransform(smoothX, [-1, 1], [-20, 20]);
  const y3 = useTransform(smoothY, [-1, 1], [-20, 20]);

  const xLight = useTransform(smoothX, [-1, 1], [-30, 30]);
  const yLight = useTransform(smoothY, [-1, 1], [-18, 18]);

  const rotateSvg = useTransform(smoothX, [-1, 1], [-8, 8]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#111416]">
      {/* Refined Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_80%)] pointer-events-none" />

      {/* Very Soft Ambient Glows */}
      <div className="absolute top-[10%] left-[30%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-white/[0.02] rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div
        className={`absolute top-[35%] ${
          isRtl ? "left-[10%]" : "right-[10%]"
        } w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-lime/[0.04] rounded-full blur-[100px] mix-blend-screen pointer-events-none`}
      />

      {/* Subtle Animated Light Lines / Light Trails */}
      <motion.div
        style={{ x: xLight, y: yLight }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1600 900"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lightTrail1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="30%" stopColor="rgba(255, 255, 255, 0.08)" />
              <stop offset="50%" stopColor="rgba(178, 248, 0, 0.22)" />
              <stop offset="70%" stopColor="rgba(255, 255, 255, 0.06)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            <linearGradient id="lightTrail2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="40%" stopColor="rgba(194, 202, 173, 0.15)" />
              <stop offset="60%" stopColor="rgba(178, 248, 0, 0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* Flowing curve 1 */}
          <path
            d="M -100,200 C 300,100 600,450 1100,250 C 1400,120 1600,380 1800,320"
            fill="none"
            stroke="url(#lightTrail1)"
            strokeWidth="1.2"
            strokeDasharray="180 320"
            className="animate-light-flow-1"
          />

          {/* Flowing curve 2 */}
          <path
            d="M -50,600 C 450,500 800,750 1250,550 C 1500,420 1700,680 1900,580"
            fill="none"
            stroke="url(#lightTrail2)"
            strokeWidth="1"
            strokeDasharray="140 280"
            className="animate-light-flow-2"
          />

          {/* Subtle node intersections */}
          <circle cx="1100" cy="250" r="2" fill="#b2f800" className="opacity-40 animate-pulse" />
          <circle cx="800" cy="750" r="1.5" fill="#ffffff" className="opacity-30 animate-pulse" />
        </svg>
      </motion.div>

      {/* Abstract Digital UI & Code Composition - Desktop Only */}
      <div
        className={`absolute top-[50%] -translate-y-1/2 ${
          isRtl
            ? "left-[0%] lg:left-[5%] xl:left-[8%]"
            : "right-[0%] lg:right-[5%] xl:right-[8%]"
        } w-[620px] h-[520px] hidden lg:block pointer-events-none`}
      >
        {/* Layer 1: Developer Code & UI Editor Panel */}
        <motion.div
          style={{ x: x1, y: y1 }}
          className={`absolute top-[4%] ${
            isRtl ? "left-[10%]" : "right-[8%]"
          } w-[450px] rounded-[22px] glass-panel shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col font-mono`}
          dir="ltr"
        >
          {/* Editor Header Bar */}
          <div className="w-full h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/70 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/70 shadow-sm" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/70 shadow-sm" />
              <span className="ml-2 text-[11px] font-medium text-white/40 tracking-wider">
                HeroExperience.tsx
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md neumorph-concave border border-white/5 text-[10px] text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              <span>compiled 12ms</span>
            </div>
          </div>

          {/* Code Snippet Content */}
          <div className="p-4 sm:p-5 text-[11px] leading-[20px] text-white/80 overflow-hidden select-none">
            <div className="flex gap-3">
              {/* Line numbers */}
              <div className="flex flex-col text-white/20 select-none text-right pr-1">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <span>09</span>
              </div>

              {/* Code lines with syntax highlighting */}
              <div className="flex-1 font-mono">
                <div>
                  <span className="text-purple-400">export default</span>{" "}
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-mint font-semibold">WebExperience</span>() &#123;
                </div>
                <div className="pl-3">
                  <span className="text-purple-400">return</span> (
                </div>
                <div className="pl-6">
                  <span className="text-sky-300">&lt;</span>
                  <span className="text-mint font-medium">DigitalProduct</span>
                </div>
                <div className="pl-9 text-white/60">
                  <span>performance</span>=
                  <span className="text-lime/90">&quot;99.9%&quot;</span>
                </div>
                <div className="pl-9 text-white/60">
                  <span>speed</span>=&#123;<span className="text-amber-300">ultra</span>&#125;
                </div>
                <div className="pl-6">
                  <span className="text-sky-300">&gt;</span>
                </div>
                <div className="pl-9">
                  <span className="text-sky-300">&lt;</span>
                  <span className="text-mint">UIArchitecture</span>{" "}
                  <span className="text-lime">ready</span>=&#123;<span className="text-purple-300">true</span>&#125;{" "}
                  <span className="text-sky-300">/&gt;</span>
                  <span className="inline-block w-1.5 h-3.5 bg-lime ml-1 -mb-0.5 animate-pulse shadow-[0_0_8px_#b2f800]" />
                </div>
                <div className="pl-6">
                  <span className="text-sky-300">&lt;/</span>
                  <span className="text-mint font-medium">DigitalProduct</span>
                  <span className="text-sky-300">&gt;</span>
                </div>
                <div className="pl-3">);</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>

          {/* Status bottom bar */}
          <div className="h-6 border-t border-white/5 bg-black/40 flex items-center justify-between px-3 text-[9px] text-white/30">
            <div className="flex items-center gap-2">
              <span>TypeScript 5.0</span>
              <span>•</span>
              <span>Next.js App Router</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lime">●</span>
              <span>Ready</span>
            </div>
          </div>
        </motion.div>

        {/* Layer 2: Foreground Widget (Data & Performance Metrics) */}
        <motion.div
          style={{ x: x2, y: y2 }}
          className={`absolute bottom-[6%] ${
            isRtl ? "right-[2%]" : "left-[2%]"
          } w-[290px] h-[210px] rounded-[24px] glass-panel shadow-[0_24px_60px_rgba(0,0,0,0.65)] p-5 flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">
                {isRtl ? "شاخص عملکرد فنی" : "Technical Performance"}
              </span>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Core Web
                <span className="text-[11px] font-normal text-lime">Vitals</span>
              </span>
            </div>
            {/* Pulsing status indicator */}
            <div className="w-8 h-8 rounded-full neumorph-concave flex items-center justify-center border border-lime/20 shadow-[0_0_12px_rgba(178,248,0,0.15)]">
              <div className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_#b2f800] animate-pulse" />
            </div>
          </div>

          {/* Abstract Performance Chart Bars */}
          <div className="w-full h-20 flex items-end gap-2 mt-1">
            {[30, 48, 38, 75, 52, 95, 68].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/[0.06] rounded-sm relative transition-all duration-700 overflow-hidden"
                style={{ height: `${h}%` }}
              >
                {i === 5 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-lime/20 to-lime/90 rounded-sm">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.9)]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Layer 3: Floating Action Pill */}
        <motion.div
          style={{ x: x3, y: y3 }}
          className={`absolute top-[42%] ${
            isRtl ? "right-[-6%]" : "left-[-6%]"
          } w-[210px] h-[64px] rounded-2xl glass-panel shadow-2xl flex items-center px-3.5 gap-3`}
        >
          <div className="w-10 h-10 rounded-xl neumorph-convex border border-white/10 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-lime"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <span className="text-[11px] font-semibold text-white/90 truncate">
              {isRtl ? "طراحی و توسعه وب" : "Web Architecture"}
            </span>
            <span className="text-[10px] text-white/40 truncate">
              {isRtl ? "نسل نوین پلتفرم‌ها" : "Enterprise Next.js"}
            </span>
          </div>
        </motion.div>

        {/* Subtle Tech Vector Dial */}
        <motion.svg
          style={{ x: x1, y: y1, rotate: rotateSvg }}
          className={`absolute top-[0%] ${
            isRtl ? "left-[2%]" : "right-[16%]"
          } w-28 h-28 text-white/[0.04] pointer-events-none`}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="currentColor" strokeWidth="0.5" />
        </motion.svg>
      </div>

      <style jsx>{`
        @keyframes lightFlow1 {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -1000;
          }
        }
        @keyframes lightFlow2 {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 840;
          }
        }
        .animate-light-flow-1 {
          animation: lightFlow1 32s linear infinite;
        }
        .animate-light-flow-2 {
          animation: lightFlow2 26s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-light-flow-1,
          .animate-light-flow-2 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// ─── Dedicated Mobile Hero Composition (Reference Design Mockup) ────────────

const MobileHeroVisual = ({ isRtl }: { isRtl: boolean }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeInUp}
      className="w-full relative z-10 select-none flex items-center justify-center my-2 sm:my-3"
      dir="ltr"
    >
      {/* Ambient background soft neon glows matching the reference mockup */}
      <div className="absolute top-[10%] left-[8%] w-44 h-44 bg-lime/[0.07] rounded-full blur-[65px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[8%] w-48 h-48 bg-mint/[0.06] rounded-full blur-[70px] pointer-events-none" />

      {/* Decorative curved SVG light trail */}
      <svg
        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
        viewBox="0 0 360 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -30,70 C 70,15 180,135 390,75"
          stroke="url(#mobileGlowTrail)"
          strokeWidth="1.2"
          strokeDasharray="140 180"
        />
        <defs>
          <linearGradient id="mobileGlowTrail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="45%" stopColor="#b2f800" stopOpacity="0.45" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>

      {/* Visual Cluster Container (Responsive scaled for 320px – 480px) */}
      <div className="relative w-full max-w-[340px] xs:max-w-[365px] sm:max-w-[390px] h-[230px] sm:h-[245px] mx-auto">
        {/* ─── 1. Code Editor Card (HeroExperience.tsx) ─── */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-3, 3, -3] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
          className="absolute top-0 left-0 w-[73%] max-w-[265px] rounded-2xl bg-[#0f1214]/95 backdrop-blur-2xl border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.85)] overflow-hidden font-mono text-[9px] xs:text-[9.5px] leading-[15px] xs:leading-[16px] z-10"
        >
          {/* Editor Header Bar */}
          <div className="w-full h-8 border-b border-white/10 flex items-center justify-between px-3 bg-white/[0.03]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ff5f56]/85" />
              <div className="w-2 h-2 rounded-full bg-[#ffbd2e]/85" />
              <div className="w-2 h-2 rounded-full bg-[#27c93f]/85" />
              <span className="ml-1.5 text-[9px] font-medium text-white/50 tracking-wider">
                HeroExperience.tsx
              </span>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[8px] text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              <span>compiled 12ms</span>
            </div>
          </div>

          {/* Code Lines with Syntax Highlighting */}
          <div className="p-2.5 xs:p-3 text-white/90 select-none">
            <div className="flex gap-2">
              {/* Line Numbers 1 to 10 */}
              <div className="flex flex-col text-white/25 select-none text-right pr-1 font-mono text-[8.5px] xs:text-[9px]">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>6</span>
                <span>7</span>
                <span>8</span>
                <span>9</span>
                <span>10</span>
              </div>

              {/* Code Snippet */}
              <div className="flex-1 font-mono text-[8.5px] xs:text-[9.5px] whitespace-pre">
                <div>
                  <span className="text-purple-400">export default</span>{" "}
                  <span className="text-blue-400">function</span>{" "}
                  <span className="text-mint font-semibold">WebExperience</span> () &#123;
                </div>
                <div className="pl-2">
                  <span className="text-purple-400">return</span> (
                </div>
                <div className="pl-4">
                  <span className="text-sky-300">&lt;</span>
                  <span className="text-mint font-medium">DigitalProduct</span>
                </div>
                <div className="pl-6 text-white/60">
                  <span>performance</span>=
                  <span className="text-lime font-medium">&quot;99.9%&quot;</span>
                </div>
                <div className="pl-6 text-white/60">
                  <span>speed</span>=&#123;<span className="text-amber-300">ultra</span>&#125;
                </div>
                <div className="pl-4">
                  <span className="text-sky-300">&gt;</span>
                </div>
                <div className="pl-6">
                  <span className="text-sky-300">&lt;</span>
                  <span className="text-mint">UIArchitecture</span>{" "}
                  <span className="text-lime">ready</span>=&#123;<span className="text-purple-300">true</span>&#125;{" "}
                  <span className="text-sky-300">/&gt;</span>
                  <span className="inline-block w-1.5 h-3 bg-lime ml-0.5 align-middle animate-pulse shadow-[0_0_6px_#b2f800]" />
                </div>
                <div className="pl-4">
                  <span className="text-sky-300">&lt;/</span>
                  <span className="text-mint font-medium">DigitalProduct</span>
                  <span className="text-sky-300">&gt;</span>
                </div>
                <div className="pl-2">);</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>

          {/* Status Bottom Bar */}
          <div className="h-5 border-t border-white/5 bg-black/40 flex items-center px-2.5 text-[8px] text-white/35 font-mono">
            TypeScript 5.0 • Next.js App Router
          </div>
        </motion.div>

        {/* ─── 2. Service Badge Card (Positioned lower in the open space) ─── */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [3, -3, 3] }}
          transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.35 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
          className="absolute top-11 xs:top-12 right-0 z-20 w-[138px] xs:w-[148px] rounded-xl xs:rounded-2xl bg-[#131618]/95 backdrop-blur-xl border border-white/10 p-2 xs:p-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div className="flex flex-col text-start min-w-0">
            <span className="text-[10px] xs:text-[11px] font-bold text-white leading-tight truncate">
              {isRtl ? "طراحی و توسعه وب" : "Web Architecture"}
            </span>
            <span className="text-[8.5px] xs:text-[9px] text-white/50 leading-tight truncate mt-0.5">
              {isRtl ? "تحویل سریع و حرفه‌ای" : "High Performance"}
            </span>
          </div>

          <div className="w-7 h-7 xs:w-8 xs:h-8 rounded-lg bg-lime/10 border border-lime/30 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(178,248,0,0.15)]">
            <svg
              className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-lime"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </motion.div>

        {/* ─── 3. Performance Analytics Card (Core Web Vitals - Bottom Right) ─── */}
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [-2, 4, -2] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
          className="absolute bottom-1 right-0 z-20 w-[165px] xs:w-[185px] h-[112px] xs:h-[118px] rounded-2xl bg-[#121517]/95 backdrop-blur-xl border border-white/10 p-2.5 xs:p-3 shadow-[0_20px_45px_rgba(0,0,0,0.85)] flex flex-col justify-between"
        >
          {/* Header Row */}
          <div className="flex items-center justify-between">
            {/* Concentric Radar Pulse */}
            <div className="w-5 h-5 rounded-full border border-lime/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-lime shadow-[0_0_8px_#b2f800] animate-pulse" />
            </div>

            {/* Title / Metric Tag */}
            <div className="flex items-center gap-1.5" dir="ltr">
              <span className="w-1.5 h-1.5 rounded-full bg-lime shadow-[0_0_6px_#b2f800]" />
              <span className="text-[11px] font-bold text-white">Core Web</span>
              <span className="text-[9.5px] font-semibold text-lime">Vitals</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="w-full h-12 flex items-end gap-1.5 pt-1">
            {[28, 92, 42, 65, 48, 38, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-white/[0.08] rounded-sm relative overflow-hidden"
                style={{ height: `${h}%` }}
              >
                {i === 1 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-lime/25 via-lime/70 to-lime rounded-sm">
                    <div className="absolute top-0 inset-x-0 h-1 bg-white rounded-t shadow-[0_0_6px_#ffffff]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ─── Main Hero Component ────────────────────────────────────────────────────

export default function Hero() {
  const { lang } = useLanguage();
  const [heroData, setHeroData] = useState<HeroSettings>(FALLBACK);
  const prefersReducedMotion = useReducedMotion();

  // Mouse parallax state for desktop
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion || window.innerWidth < 1024) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/hero`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const s = data[0];
        setHeroData({
          title: s.title || FALLBACK.title,
          titleEn: s.titleEn || FALLBACK.titleEn,
          subtitle: s.subtitle || FALLBACK.subtitle,
          subtitleEn: s.subtitleEn || FALLBACK.subtitleEn,
          ctaText: s.ctaText || FALLBACK.ctaText,
          ctaTextEn: s.ctaTextEn || FALLBACK.ctaTextEn,
          ctaLink: s.ctaLink || FALLBACK.ctaLink,
          ctaText2: s.ctaText2 || FALLBACK.ctaText2,
          ctaText2En: s.ctaText2En || FALLBACK.ctaText2En,
          ctaLink2: s.ctaLink2 || FALLBACK.ctaLink2,
          imageUrl: s.imageUrl ?? null,
          imageAlt: s.imageAlt ?? null,
        });
      })
      .catch(() => {});
  }, []);

  const isRtl = lang === "fa";

  return (
    // Section spans full viewport width; height is intentionally shorter than 100dvh
    // so the stats strip is immediately visible below without scrolling
    <section
      className="relative w-full overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative w-full bg-background">
        {/* Premium Digital Background with Parallax and Animated Light Trails */}
        <PremiumDigitalVisual smoothX={smoothX} smoothY={smoothY} isRtl={isRtl} />

        {/* Overlay + bottom gradient scrim for text readability */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" aria-hidden="true" />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#111416] via-[#111416]/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* ══════════════════════════════════════════════════════════════════════
            MOBILE HERO LAYOUT (< 1024px) - Matches Reference Design Mockup
            Order: Visual Cluster -> Status Badge -> Headline -> Subtitle -> CTAs
            ══════════════════════════════════════════════════════════════════════ */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="lg:hidden relative z-10 w-full px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-14 flex flex-col items-center text-center max-w-[480px] mx-auto"
        >
          {/* 1. Three Compact Floating Visual Cards (Code, Service, Vitals) */}
          <MobileHeroVisual isRtl={isRtl} />

          {/* 2. Status Pill Badge (Centered) */}
          <motion.div
            variants={fadeInUp}
            className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121618]/90 border border-lime/30 text-lime font-bold text-xs shadow-lg"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse shadow-[0_0_8px_#b2f800]" />
            <span>{isRtl ? "آماده تحول دیجیتال" : "Ready for Digital Transformation"}</span>
          </motion.div>

          {/* 3. Main Headline (Centered) */}
          <motion.h1
            variants={fadeInUp}
            className="mt-4 sm:mt-5 font-display text-[27px] leading-[38px] xs:text-[32px] xs:leading-[42px] sm:text-4xl sm:leading-[48px] font-bold tracking-tight text-white drop-shadow-xl max-w-sm sm:max-w-md mx-auto"
          >
            {isRtl ? (
              heroData.title.includes("،") ? (
                <>
                  <span className="block">{heroData.title.split("،")[0]}،</span>
                  <span className="block mt-1">
                    {heroData.title.split("،").slice(1).join("،").trim()}
                  </span>
                </>
              ) : (
                heroData.title
              )
            ) : (
              heroData.titleEn
            )}
          </motion.h1>

          {/* 4. Subtitle / Description (Centered) */}
          <motion.p
            variants={fadeInUp}
            className="mt-3 sm:mt-4 text-xs xs:text-[13px] sm:text-sm text-foreground/80 leading-relaxed sm:leading-[1.8] max-w-[320px] xs:max-w-[350px] sm:max-w-[390px] mx-auto drop-shadow-md"
          >
            {isRtl ? heroData.subtitle : heroData.subtitleEn}
          </motion.p>

          {/* 5. Dual CTA Buttons (Side-by-Side Horizontal Row) */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 sm:mt-7 flex items-center justify-center gap-3 w-full max-w-[340px] xs:max-w-[360px] mx-auto"
          >
            {/* Primary CTA (Right in RTL): درخواست مشاوره */}
            <motion.div
              whileHover={prefersReducedMotion ? undefined : buttonHover}
              whileTap={prefersReducedMotion ? undefined : tapFeedback}
              className="flex-1"
            >
              <Link
                href={heroData.ctaLink || "#contact"}
                onClick={(e) => {
                  const target = heroData.ctaLink || "#contact";
                  if (target.includes("#") && scrollToSection(target)) {
                    e.preventDefault();
                  }
                }}
                className="inline-flex w-full h-12 items-center justify-center gap-2 rounded-2xl bg-lime px-3 xs:px-4 text-[13px] xs:text-sm font-bold text-ink shadow-[0_0_20px_rgba(178,248,0,0.28)] transition-all duration-300"
              >
                <span>
                  {isRtl
                    ? heroData.ctaText || heroData.ctaTextEn
                    : heroData.ctaTextEn || heroData.ctaText}
                </span>
                <svg
                  className={`w-4 h-4 ${isRtl ? "rotate-180" : "rotate-0"} transition-transform duration-300`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </motion.div>

            {/* Secondary CTA (Left in RTL): خدمات ما */}
            {(heroData.ctaText2 || heroData.ctaText2En) && (
              <motion.div
                whileHover={prefersReducedMotion ? undefined : buttonHover}
                whileTap={prefersReducedMotion ? undefined : tapFeedback}
                className="flex-1"
              >
                <Link
                  href={heroData.ctaLink2 || "#contact"}
                  onClick={(e) => {
                    const target = heroData.ctaLink2 || "#contact";
                    if (target.includes("#") && scrollToSection(target)) {
                      e.preventDefault();
                    }
                  }}
                  className="inline-flex w-full h-12 items-center justify-center gap-1.5 rounded-2xl bg-[#14181a]/90 backdrop-blur-xl border border-white/10 px-3 xs:px-4 text-[13px] xs:text-sm font-bold text-white transition-all duration-300 hover:border-mint/40 hover:text-white"
                >
                  <span>
                    {isRtl
                      ? heroData.ctaText2 || heroData.ctaText2En
                      : heroData.ctaText2En || heroData.ctaText2}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : "rotate-0"} text-white/70`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Content column — same max-width & padding as all other sections */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="hidden lg:flex relative z-10 flex-col justify-end min-h-[75dvh] px-6 sm:px-12 lg:px-24 pb-12 sm:pb-14 pt-28 mx-auto max-w-[1600px] items-start text-start"
        >
          {/* Status Pill */}
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-lime font-bold text-xs sm:text-sm shadow-lg mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-lime animate-pulse"></span>
            <span>{isRtl ? "آماده تحول دیجیتال" : "Ready for Digital Transformation"}</span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="font-display text-[32px] leading-[42px] sm:text-5xl sm:leading-[1.2] lg:text-[56px] lg:leading-[68px] font-bold tracking-tight text-foreground drop-shadow-2xl max-w-2xl relative z-10"
          >
            {isRtl ? (
              heroData.title.includes("،") ? (
                <>
                  <span className="block">{heroData.title.split("،")[0]}،</span>
                  <span className="block mt-1">
                    {heroData.title.split("،").slice(1).join("،").trim()}
                  </span>
                </>
              ) : (
                heroData.title
              )
            ) : (
              heroData.titleEn
            )}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-foreground/80 drop-shadow-lg leading-relaxed sm:leading-[1.8] relative z-10"
          >
            {isRtl ? heroData.subtitle : heroData.subtitleEn}
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10"
          >
            <motion.div
              whileHover={prefersReducedMotion ? undefined : buttonHover}
              whileTap={prefersReducedMotion ? undefined : tapFeedback}
              className="w-full sm:w-auto"
            >
              <Link
                href={heroData.ctaLink || "#contact"}
                onClick={(e) => {
                  const target = heroData.ctaLink || "#contact";
                  if (target.includes("#") && scrollToSection(target)) {
                    e.preventDefault();
                  }
                }}
                className="inline-flex w-full sm:w-auto h-12 sm:h-14 items-center justify-center gap-2 rounded-xl bg-lime px-8 text-sm sm:text-base font-bold text-ink shadow-[0_0_24px_rgba(178,248,0,0.3)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              >
                <span>
                  {isRtl
                    ? heroData.ctaText || heroData.ctaTextEn
                    : heroData.ctaTextEn || heroData.ctaText}
                </span>
                <svg
                  className={`w-5 h-5 ${isRtl ? "rotate-180" : "rotate-0"} transition-transform duration-300`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </motion.div>

            {(heroData.ctaText2 || heroData.ctaText2En) && (
              <motion.div
                whileHover={prefersReducedMotion ? undefined : buttonHover}
                whileTap={prefersReducedMotion ? undefined : tapFeedback}
                className="w-full sm:w-auto"
              >
                <Link
                  href={heroData.ctaLink2 || "#contact"}
                  onClick={(e) => {
                    const target = heroData.ctaLink2 || "#contact";
                    if (target.includes("#") && scrollToSection(target)) {
                      e.preventDefault();
                    }
                  }}
                  className="inline-flex w-full sm:w-auto h-12 sm:h-14 items-center justify-center rounded-xl glass-panel px-8 text-sm sm:text-base font-bold text-foreground transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-mint/50 hover:text-white"
                >
                  {isRtl
                    ? heroData.ctaText2 || heroData.ctaText2En
                    : heroData.ctaText2En || heroData.ctaText2}
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
