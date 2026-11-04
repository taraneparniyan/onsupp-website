"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import type { MediaAsset, SocialLink, SocialPlatform } from "@/lib/about";
import { EASE_PREMIUM } from "@/lib/motion";

// ─── Eyebrow / Section Label ────────────────────────────────────────────────
// Mirrors the hairline + label language used by the homepage About section.

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#38534A] dark:text-[#8AB3A0] ${className}`}
    >
      <span aria-hidden="true" className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
      <span>{children}</span>
    </div>
  );
}

// ─── Hairline that draws itself in ──────────────────────────────────────────

export function DrawLine({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.span
      aria-hidden="true"
      className={`block h-px w-full bg-foreground/10 ltr:origin-left rtl:origin-right ${className}`}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 1.2, delay, ease: EASE_PREMIUM }}
    />
  );
}

// ─── Word-staggered heading reveal ──────────────────────────────────────────
// Splits by whitespace only, so Persian letter joining inside words is intact.

const wordContainer: Variants = { hidden: {}, visible: {} };

type WordCustom = { i: number; delay: number; stagger: number };

const wordItem: Variants = {
  hidden: { y: "105%" },
  visible: ({ i, delay, stagger }: WordCustom) => ({
    y: "0%",
    transition: { duration: 0.9, ease: EASE_PREMIUM, delay: delay + i * stagger },
  }),
};

type RevealTextProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of on scroll (used in the hero). */
  onMount?: boolean;
};

export function RevealText({ text, as = "h2", className = "", delay = 0, stagger = 0.06, onMount = false }: RevealTextProps) {
  const Tag = motion[as];
  const words = text.split(/\s+/).filter(Boolean);

  const trigger = onMount
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: { once: true, margin: "-60px" } };

  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={wordContainer}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]"
        >
          <motion.span
            className="inline-block will-change-transform"
            variants={wordItem}
            custom={{ i, delay, stagger } satisfies WordCustom}
          >
            {word}
          </motion.span>
          {i < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </Tag>
  );
}

// ─── Media Frame (image or labelled placeholder) ────────────────────────────

type PlaceholderKind = "group" | "portrait";

const PLACEHOLDER_TONES = [
  "bg-[var(--brand-green-surface)]",
  "bg-[var(--accent-burgundy-surface)]",
  "bg-raised",
  "bg-subtle",
] as const;

type MediaFrameProps = {
  media: MediaAsset;
  isRtl: boolean;
  kind?: PlaceholderKind;
  sizes: string;
  priority?: boolean;
  /** Index used to vary placeholder tone / numbering. */
  index?: number;
  className?: string;
  imageClassName?: string;
};

export function MediaFrame({
  media,
  isRtl,
  kind = "portrait",
  sizes,
  priority = false,
  index = 0,
  className = "",
  imageClassName = "",
}: MediaFrameProps) {
  const alt = isRtl ? media.altFa : media.altEn;

  if (media.src) {
    return (
      <div className={`absolute inset-0 ${className}`}>
        <Image
          src={media.src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          unoptimized={media.src.startsWith("http")}
          className={`object-cover ${imageClassName}`}
          style={media.focalPoint ? { objectPosition: media.focalPoint } : undefined}
        />
      </div>
    );
  }

  const label =
    kind === "group"
      ? isRtl ? "جای عکس گروهی تیم" : "Team photo placeholder"
      : isRtl ? "جای عکس پروفایل" : "Portrait placeholder";

  return (
    <div
      role="img"
      aria-label={`${alt} — ${label}`}
      className={`absolute inset-0 overflow-hidden ${
        kind === "group" ? "bg-[#253430] dark:bg-[#18201d]" : PLACEHOLDER_TONES[index % PLACEHOLDER_TONES.length]
      } ${className}`}
    >
      {/* Fine editorial hatch so the placeholder reads as intentional, not broken */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 ${imageClassName}`}
        style={{
          backgroundImage:
            kind === "group"
              ? "linear-gradient(to right, rgba(248,249,250,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(248,249,250,0.05) 1px, transparent 1px), radial-gradient(ellipse at 50% 35%, rgba(139,179,164,0.22), transparent 60%)"
              : "repeating-linear-gradient(135deg, var(--border-subtle) 0 1px, transparent 1px 14px)",
          backgroundSize: kind === "group" ? "72px 72px, 72px 72px, 100% 100%" : undefined,
        }}
      />

      <div
        aria-hidden="true"
        className={`absolute inset-0 flex flex-col items-center justify-center gap-3 ${
          kind === "group" ? "text-[#F8F9FA]/45 pb-[18%]" : "text-foreground/30"
        }`}
      >
        {kind === "group" ? (
          <svg className="h-14 w-14 sm:h-16 sm:w-16" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="24" cy="16" r="6" />
            <circle cx="11" cy="20" r="4.5" />
            <circle cx="37" cy="20" r="4.5" />
            <path d="M13 40c0-6.1 4.9-11 11-11s11 4.9 11 11" />
            <path d="M3 38c0-4.4 3.6-8 8-8 1.6 0 3.1.5 4.4 1.3M45 38c0-4.4-3.6-8-8-8-1.6 0-3.1.5-4.4 1.3" />
          </svg>
        ) : (
          <svg className="h-12 w-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="24" cy="18" r="7.5" />
            <path d="M10 42c0-7.7 6.3-14 14-14s14 6.3 14 14" />
          </svg>
        )}
        <span className="text-[11px] sm:text-xs font-medium tracking-[0.14em] uppercase">{label}</span>
      </div>
    </div>
  );
}

// ─── Mask (clip-path) image reveal ──────────────────────────────────────────

type MaskRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "inline";
  isRtl?: boolean;
};

export function MaskReveal({ children, className = "", delay = 0, direction = "up", isRtl = false }: MaskRevealProps) {
  const hiddenClip =
    direction === "up"
      ? "inset(100% 0% 0% 0%)"
      : isRtl
        ? "inset(0% 0% 0% 100%)"
        : "inset(0% 100% 0% 0%)";

  return (
    <motion.div
      className={className}
      initial={{ clipPath: hiddenClip }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0%)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.25, delay, ease: EASE_PREMIUM }}
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.6, delay, ease: EASE_PREMIUM }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── Social / professional links ────────────────────────────────────────────

const SOCIAL_LABELS: Record<SocialPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  x: "X",
  telegram: "Telegram",
  behance: "Behance",
  dribbble: "Dribbble",
  github: "GitHub",
  website: "Website",
  email: "Email",
};

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  const common = { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (platform) {
    case "linkedin":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5v.01" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M4 4l16 16M20 4L4 20" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common}>
          <path d="M21 4L3 11l6 2 2 6 3-4 5 4 2-15z" />
          <path d="M9 13l8-6" />
        </svg>
      );
    case "behance":
      return (
        <svg {...common}>
          <path d="M3 7h5a2.5 2.5 0 0 1 0 5H3V7zM3 12h5.5a2.5 2.5 0 0 1 0 5H3v-5zM14 8h5M14 14h7a3.5 3.5 0 1 0-1 2.5" />
        </svg>
      );
    case "dribbble":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 3.8c4 5 6 10 7 16.4M3.2 10.5c6 .5 11-.8 15-4.3M5 18c3-4 8-6 15.5-4.5" />
        </svg>
      );
    case "github":
      return (
        <svg {...common}>
          <path d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
        </svg>
      );
    case "email":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "website":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
  }
}

type SocialLinksProps = {
  links: SocialLink[];
  personName: string;
  className?: string;
  variant?: "glass" | "outline";
};

/**
 * Links whose `url` is "#" are treated as unfilled CMS placeholders and render
 * as inert (non-focusable) chips so they never navigate anywhere.
 */
export function SocialLinks({ links, personName, className = "", variant = "outline" }: SocialLinksProps) {
  if (!links.length) return null;
  const base =
    variant === "glass"
      ? "bg-[#1F1F1E]/45 text-[#F8F9FA] border-[#F8F9FA]/20 backdrop-blur-md hover:bg-[#F8F9FA] hover:text-[#1F1F1E]"
      : "bg-transparent text-foreground/70 border-foreground/15 hover:text-[var(--action-primary-text)] hover:bg-[var(--action-primary-bg)] hover:border-transparent";

  return (
    <ul className={`flex items-center gap-2 ${className}`}>
      {links.map((link) => {
        const label = `${personName} — ${SOCIAL_LABELS[link.platform]}`;
        const isPlaceholder = !link.url || link.url === "#";
        const cls = `inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)] ${base}`;
        return (
          <li key={link.platform}>
            {isPlaceholder ? (
              <a aria-label={label} title={label} className={`${cls} cursor-default`}>
                <SocialIcon platform={link.platform} />
              </a>
            ) : (
              <a
                href={link.url}
                aria-label={label}
                title={label}
                className={cls}
                {...(link.platform === "email" ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              >
                <SocialIcon platform={link.platform} />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Utilities ──────────────────────────────────────────────────────────────

export const toFaDigits = (value: string) => value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

export const gendyClass = "font-[family-name:var(--font-gendy)]";
