"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { staggerContainer, staggerItem, EASE_PREMIUM } from "@/lib/motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiStat = {
  kind?: string;
  valueFa?: string;
  valueEn?: string;
  labelFa?: string;
  labelEn?: string;
  descFa?: string;
  descEn?: string;
};

type Stat = {
  id?: number;
  kind: string;
  fa: string;
  en: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
};

// ─── Icon mapping ─────────────────────────────────────────────────────────────
// Inline SVG icons that mirror the Material Symbols used in the reference file:
// trending_up → ROI / investment
// schedule    → years experience
// task_alt    → projects delivered
// loyalty     → satisfaction

type IconKey = "trending_up" | "schedule" | "task_alt" | "loyalty" | "bolt";

const ICONS: Record<IconKey, React.ReactElement> = {
  trending_up: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  task_alt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  loyalty: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
};

const getIcon = (labelEn: string, labelFa: string): React.ReactElement => {
  const text = (labelEn + " " + labelFa).toLowerCase();
  if (text.includes("invest") || text.includes("roi") || text.includes("سرمایه") || text.includes("رشد")) return ICONS.trending_up;
  if (text.includes("experience") || text.includes("year") || text.includes("تجربه") || text.includes("سال")) return ICONS.schedule;
  if (text.includes("project") || text.includes("deliver") || text.includes("پروژه") || text.includes("موفق")) return ICONS.task_alt;
  if (text.includes("satisfaction") || text.includes("loyal") || text.includes("رضایت") || text.includes("وفا")) return ICONS.loyalty;
  return ICONS.bolt;
};

// ─── Number animation helpers ─────────────────────────────────────────────────

const PFA = ["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"] as const;
const ENA = ["0","1","2","3","4","5","6","7","8","9"] as const;

const toEn = (s: string) => {
  let r = s;
  PFA.forEach((p, i) => { r = r.replaceAll(p, ENA[i]); });
  return r.replaceAll("٫", ".");
};

const toFa = (s: string) => {
  let r = s;
  ENA.forEach((e, i) => { r = r.replaceAll(e, PFA[i]); });
  return r.replaceAll(".", "٫");
};

const parseValue = (raw: string) => {
  const en = toEn(raw);
  const m = en.match(/^([^\d]*)(\d+(?:\.\d+)?)([^\d]*)$/);
  if (m) return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3], isFloat: m[2].includes("."), isNumber: true as const };
  return { isNumber: false as const, original: raw };
};

// ─── AnimatedNumber ───────────────────────────────────────────────────────────

function AnimatedNumber({ value, isRtl }: { value: string; isRtl: boolean }) {
  const parsed = parseValue(value);
  const [display, setDisplay] = useState(() => {
    if (!parsed.isNumber) return isRtl ? toFa(value) : value;
    const zero = `${parsed.prefix}${parsed.isFloat ? "0.0" : "0"}${parsed.suffix}`;
    return isRtl ? toFa(zero) : zero;
  });
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!parsed.isNumber || done) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(isRtl ? toFa(value) : value);
      setDone(true);
      return;
    }

    const duration = 1800;
    const target = parsed.num;
    let rafId: number;
    let start: number | null = null;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      setDone(true);

      const tick = (now: number) => {
        if (!start) start = now;
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo
        const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        const cur = target * ease;
        const fmt = parsed.isFloat ? cur.toFixed(1) : String(Math.floor(cur));
        let str = `${parsed.prefix}${fmt}${parsed.suffix}`;
        setDisplay(isRtl ? toFa(str) : str);
        if (t < 1) rafId = requestAnimationFrame(tick);
        else setDisplay(isRtl ? toFa(value) : value);
      };
      rafId = requestAnimationFrame(tick);
    }, { threshold: 0.15 });

    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); cancelAnimationFrame(rafId); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span ref={ref}>{display}</span>;
}

// ─── Defaults & config ────────────────────────────────────────────────────────

const DEFAULT_STATS: Stat[] = [
  { kind: "number", fa: "۳.۲×", en: "3.2x",  label: "بازگشت سرمایه",  labelEn: "Return on investment",  desc: "", descEn: "" },
  { kind: "number", fa: "۸+",   en: "8+",    label: "سال تجربه",       labelEn: "Years of experience",    desc: "", descEn: "" },
  { kind: "number", fa: "۲۰۰+", en: "200+",  label: "پروژه موفق",      labelEn: "Projects delivered",     desc: "", descEn: "" },
  { kind: "number", fa: "۹۸٪",  en: "98%",   label: "رضایت مشتری",    labelEn: "Client satisfaction",    desc: "", descEn: "" },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// ─── Icon background colours alternating like the reference ──────────────────
// First item uses the accent (lime/primary-fixed) tint; others use the muted surface.
const iconBg = (i: number) =>
  i === 0
    ? "bg-lime/10 text-lime"
    : "bg-white/5 text-foreground/60";

// ─── StatsBanner ─────────────────────────────────────────────────────────────

export default function StatsBanner() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();
  const [stats, setStats] = useState<Stat[]>(DEFAULT_STATS);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/stats`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: ApiStat[] | null) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setStats(
          data.slice(0, 4).map((s) => ({
            kind: s.kind || "number",
            fa: s.valueFa || "",
            en: s.valueEn || "",
            label: s.labelFa || "",
            labelEn: s.labelEn || "",
            desc: s.descFa || "",
            descEn: s.descEn || "",
          }))
        );
      })
      .catch(() => {});
  }, []);

  if (stats.length === 0) return null;

  return (
    /*
     * No outer max-w wrapper here — page.tsx controls the page-level padding.
     * The pill fills the full available width.
     */
    <div className="w-full" dir={isRtl ? "rtl" : "ltr"}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 sm:gap-2 p-4 sm:p-6 rounded-2xl glass-panel shadow-2xl"
      >
        {stats.map((s, i) => {
          const rawValue = isRtl ? s.fa : s.en;
          const label = isRtl ? s.label : s.labelEn;
          const icon = getIcon(s.labelEn, s.label);

          return (
            <React.Fragment key={s.id ?? i}>
              {/* Stat item */}
              <motion.div
                variants={staggerItem}
                whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.015 }}
                className="flex items-center gap-3.5 flex-1 min-w-[calc(50%-1rem)] sm:min-w-0 group"
              >
                {/* Icon box with soft neumorphic indentation */}
                <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center neumorph-concave border border-white/10 ${i === 0 ? "text-lime" : "text-foreground/70"} transition-all duration-300 group-hover:scale-105 group-hover:border-lime/30`}>
                  {icon}
                </div>

                {/* Text column */}
                <div className="flex flex-col" dir={isRtl ? "rtl" : "ltr"}>
                  {/* Number — always LTR per reference */}
                  <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-none" dir="ltr">
                    <AnimatedNumber value={rawValue} isRtl={isRtl} />
                  </div>
                  {/* Label */}
                  <div className="text-[11px] sm:text-xs text-foreground/55 mt-0.5 leading-snug">
                    {label}
                  </div>
                </div>
              </motion.div>

              {/* Vertical divider */}
              {i < stats.length - 1 && (
                <div className="hidden sm:block w-px h-10 bg-white/10 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </motion.div>
    </div>
  );
}
