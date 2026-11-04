"use client";

import { motion } from "framer-motion";
import type { CeoProfile } from "@/lib/about";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM } from "@/lib/motion";
import { DrawLine, Eyebrow, MaskReveal, MediaFrame, RevealText, SocialLinks } from "./primitives";

type Props = { ceo: CeoProfile; isRtl: boolean };

export default function CeoSection({ ceo, isRtl }: Props) {
  const name = isRtl ? ceo.nameFa : ceo.nameEn;
  const bio = isRtl ? ceo.bioFa : ceo.bioEn;

  return (
    <section
      id="ceo"
      aria-label={isRtl ? "معرفی مدیرعامل" : "Meet our CEO"}
      className="relative w-full bg-panel border-y border-foreground/[0.06] py-20 sm:py-28 lg:py-36 overflow-hidden"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* ─── Portrait ─── */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Offset hairline frame for editorial depth */}
              <motion.div
                aria-hidden="true"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 1.2, delay: 0.6, ease: EASE_PREMIUM }}
                className="absolute inset-0 translate-x-3 translate-y-3 sm:translate-x-5 sm:translate-y-5 rtl:-translate-x-3 rtl:sm:-translate-x-5 rounded-[28px] border border-[var(--brand-green-border)]"
              />
              <MaskReveal className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-raised">
                <MediaFrame
                  media={ceo.photo}
                  isRtl={isRtl}
                  kind="portrait"
                  index={2}
                  sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 90vw"
                />
              </MaskReveal>

              <ScrollReveal animation="slideUp" delay={0.5} className="absolute bottom-5 start-5">
                <span className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-2 text-xs font-medium text-foreground">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]" />
                  {isRtl ? ceo.roleFa : ceo.roleEn}
                </span>
              </ScrollReveal>
            </div>
          </div>

          {/* ─── Name, role, quote, biography ─── */}
          <div className="lg:col-span-7">
            <ScrollReveal animation="fadeIn" duration={0.8}>
              <Eyebrow>{isRtl ? "مدیرعامل" : "Leadership"}</Eyebrow>
            </ScrollReveal>

            <RevealText
              as="h2"
              text={name}
              delay={0.1}
              className="mt-5 font-display font-bold text-foreground text-4xl sm:text-5xl lg:text-6xl leading-[1.2] tracking-tight"
            />

            <ScrollReveal animation="slideUp" delay={0.25}>
              <p className="mt-3 text-base sm:text-lg font-semibold text-mint">
                {isRtl ? ceo.roleFa : ceo.roleEn}
              </p>
            </ScrollReveal>

            <DrawLine className="mt-8 sm:mt-10" delay={0.2} />

            <ScrollReveal animation="blur" delay={0.3} duration={0.9}>
              <blockquote className="relative mt-8 sm:mt-10">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8 sm:h-10 sm:w-10 text-burgundy rtl:-scale-x-100"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                >
                  <path d="M13 8C7.5 9.5 4 13.6 4 19.2V24h8v-8H8.3c.3-3.2 2.3-5.4 5.7-6.4L13 8zm15 0c-5.5 1.5-9 5.6-9 11.2V24h8v-8h-3.7c.3-3.2 2.3-5.4 5.7-6.4L28 8z" />
                </svg>
                <p className="mt-4 text-xl sm:text-2xl lg:text-[1.75rem] leading-[1.75] lg:leading-[1.7] font-medium text-foreground max-w-2xl">
                  {isRtl ? ceo.quoteFa : ceo.quoteEn}
                </p>
              </blockquote>
            </ScrollReveal>

            <div className="mt-8 sm:mt-10 space-y-5 max-w-2xl">
              {bio.map((paragraph, i) => (
                <ScrollReveal key={i} animation="slideUp" delay={0.35 + i * 0.1}>
                  <p className="text-base sm:text-[17px] leading-[2] text-muted">{paragraph}</p>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal animation="slideUp" delay={0.5}>
              <div className="mt-10">
                <SocialLinks links={ceo.links} personName={name} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
