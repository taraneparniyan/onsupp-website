"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { AboutPageContent } from "@/lib/about";
import { EASE_PREMIUM } from "@/lib/motion";
import { MediaFrame, RevealText, gendyClass } from "./primitives";

type Props = { hero: AboutPageContent["hero"]; isRtl: boolean };

export default function AboutHero({ hero, isRtl }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Gentle parallax drift while the hero scrolls away
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      ref={ref}
      aria-label={isRtl ? hero.eyebrowFa : hero.eyebrowEn}
      className="relative w-full pt-16 bg-background overflow-hidden"
    >
      <div className="relative w-full h-[72svh] sm:h-[80svh] lg:h-[calc(100svh-4rem)] min-h-[460px] max-h-[980px]">
        {/* ─── Cinematic image entrance: frame opens from an inset card to full bleed ─── */}
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ clipPath: "inset(7% 5% 7% 5% round 32px)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0% round 0px)" }}
          transition={{ duration: 1.5, ease: EASE_PREMIUM, delay: 0.1 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ y: imageY }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.14 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 2.2, ease: EASE_PREMIUM, delay: 0.1 }}
            >
              <MediaFrame
                media={hero.photo}
                isRtl={isRtl}
                kind="group"
                sizes="100vw"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Top shade for header legibility and depth */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/25 to-transparent pointer-events-none"
          />
        </motion.div>

        {/* ─── Bottom scrim (same multi-stop curve as homepage Hero, resolves into the page background) ─── */}
        <div
          aria-hidden="true"
          className="about-hero-scrim absolute inset-x-0 bottom-0 h-[62%] pointer-events-none z-10"
        />

        {/* ─── Title block ─── */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-20"
          style={{ y: textY }}
        >
          <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16 pb-10 sm:pb-14 lg:pb-20">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-12">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_PREMIUM, delay: 0.7 }}
                  className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest uppercase text-[#38534A] dark:text-[#8AB3A0]"
                >
                  <span aria-hidden="true" className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                  <span>{isRtl ? hero.eyebrowFa : hero.eyebrowEn}</span>
                </motion.div>

                <RevealText
                  as="h1"
                  onMount
                  delay={0.8}
                  stagger={0.07}
                  text={isRtl ? hero.titleFa : hero.titleEn}
                  className="mt-4 sm:mt-5 font-display font-bold text-foreground text-[2.1rem] leading-[1.25] sm:text-5xl lg:text-6xl xl:text-7xl lg:leading-[1.15] tracking-tight"
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: EASE_PREMIUM, delay: 1.3 }}
                className="flex items-center gap-4 text-foreground/60 shrink-0"
              >
                <span className={`${gendyClass} text-sm tracking-[0.2em]`}>(OS)</span>
                <span aria-hidden="true" className="h-px w-12 bg-foreground/25" />
                <span className="text-sm">{isRtl ? hero.captionFa : hero.captionEn}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
