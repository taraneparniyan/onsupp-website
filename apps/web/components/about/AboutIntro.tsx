"use client";

import { motion } from "framer-motion";
import type { AboutPageContent } from "@/lib/about";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EASE_PREMIUM } from "@/lib/motion";
import { DrawLine, Eyebrow, RevealText, gendyClass } from "./primitives";

type Props = { intro: AboutPageContent["intro"]; isRtl: boolean };

export default function AboutIntro({ intro, isRtl }: Props) {

  return (
    <section
      id="about-onsupp"
      aria-labelledby="about-intro-title"
      className="relative w-full bg-background pt-12 sm:pt-16 lg:pt-20 pb-20 sm:pb-28 lg:pb-36"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Heading column */}
          <div className="lg:col-span-5">
            <ScrollReveal animation="fadeIn" duration={0.8}>
              <Eyebrow>{isRtl ? intro.eyebrowFa : intro.eyebrowEn}</Eyebrow>
            </ScrollReveal>
            <div id="about-intro-title">
              <RevealText
                as="h2"
                text={isRtl ? intro.titleFa : intro.titleEn}
                delay={0.1}
                className="mt-5 sm:mt-6 font-display font-bold text-foreground text-3xl sm:text-4xl lg:text-5xl leading-[1.3] lg:leading-[1.25] tracking-tight"
              />
            </div>
          </div>

          {/* Narrative column */}
          <div className="lg:col-span-7 lg:pt-12">
            <ScrollReveal animation="blur" duration={0.9} delay={0.15} yOffset={16}>
              <p className="text-lg sm:text-xl lg:text-2xl leading-[1.9] lg:leading-[1.85] text-foreground font-medium">
                {isRtl ? intro.leadFa : intro.leadEn}
              </p>
            </ScrollReveal>
            <ScrollReveal animation="slideUp" duration={0.8} delay={0.3}>
              <p className="mt-6 sm:mt-8 text-base sm:text-[17px] leading-[2] text-muted max-w-2xl">
                {isRtl ? intro.approachFa : intro.approachEn}
              </p>
            </ScrollReveal>
          </div>
        </div>

        {/* ─── Values: numbered editorial columns, not cards ─── */}
        <div className="mt-16 sm:mt-20 lg:mt-28">
          <DrawLine />
          <ul className="grid grid-cols-1 md:grid-cols-3">
            {intro.values.map((value, i) => (
              <motion.li
                key={value.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: EASE_PREMIUM }}
                className={`group relative pt-8 pb-8 md:pb-0 md:pt-10 md:px-8 lg:px-10 first:md:ps-0 last:md:pe-0 ${
                  i > 0 ? "border-t md:border-t-0 md:border-s border-foreground/10" : ""
                }`}
              >
                <span className={`${gendyClass} block text-sm tracking-[0.2em] text-burgundy`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-xl sm:text-2xl font-bold text-foreground">
                  {isRtl ? value.titleFa : value.titleEn}
                </h3>
                <p className="mt-3 text-[15px] sm:text-base leading-[1.95] text-muted max-w-sm">
                  {isRtl ? value.descriptionFa : value.descriptionEn}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
