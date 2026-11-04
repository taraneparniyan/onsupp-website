"use client";

import { motion, type Variants } from "framer-motion";
import type { TeamMember } from "@/lib/about";
import { EASE_PREMIUM } from "@/lib/motion";
import { MediaFrame, SocialLinks, gendyClass } from "./primitives";

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (column: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.95, ease: EASE_PREMIUM, delay: column * 0.1 },
  }),
};

const imageVariants: Variants = {
  hidden: { clipPath: "inset(18% 0% 0% 0% round 24px)", scale: 1.12 },
  visible: (column: number) => ({
    clipPath: "inset(0% 0% 0% 0% round 24px)",
    scale: 1,
    transition: { duration: 1.3, ease: EASE_PREMIUM, delay: column * 0.1 + 0.05 },
  }),
};

type Props = {
  member: TeamMember;
  index: number;
  isRtl: boolean;
  /** Visual column within the row – staggers cards that enter together. */
  column: number;
};

export default function TeamMemberCard({ member, index, isRtl, column }: Props) {
  const name = isRtl ? member.nameFa : member.nameEn;
  const number = String(index + 1).padStart(2, "0");

  return (
    <motion.article
      custom={column}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="group relative lg:max-xl:nth-[3n+2]:mt-16 xl:nth-[4n+2]:mt-16 xl:nth-[4n+4]:mt-16"
    >
      {/* ─── Photograph ─── */}
      <motion.div
        custom={column}
        variants={imageVariants}
        className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-raised"
      >
        <div className="absolute inset-0 transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
          <MediaFrame
            media={member.photo}
            isRtl={isRtl}
            kind="portrait"
            index={index}
            sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          />
        </div>

        {/* Soft bottom shade that deepens on hover so links stay legible over any photo */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1F1F1E]/45 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        />

        <span
          aria-hidden="true"
          className={`${gendyClass} absolute top-4 start-4 inline-flex items-center rounded-full bg-[#F8F9FA]/80 dark:bg-[#1F1F1E]/70 backdrop-blur-md px-3 py-1 text-[11px] tracking-[0.2em] text-[#1F1F1E] dark:text-[#F8F9FA]`}
        >
          {number}
        </span>

        {/* Links: always visible on touch, revealed on hover / keyboard focus on pointer devices */}
        <div className="absolute bottom-4 start-4 end-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:translate-y-2 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
          <SocialLinks links={member.links} personName={name} variant="glass" />
        </div>
      </motion.div>

      {/* ─── Identity ─── */}
      <div className="pt-5 sm:pt-6">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-mint">
          {isRtl ? member.departmentFa : member.departmentEn}
        </p>
        <h3 className="mt-2.5 text-xl sm:text-[1.35rem] font-bold text-foreground leading-snug">
          {name}
        </h3>
        <p className="mt-1 text-sm sm:text-[15px] text-foreground/70">
          {isRtl ? member.roleFa : member.roleEn}
        </p>
        <span
          aria-hidden="true"
          className="mt-4 block h-px w-8 bg-burgundy transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-16"
        />
        <p className="mt-4 text-sm leading-[1.95] text-muted line-clamp-4">
          {isRtl ? member.bioFa : member.bioEn}
        </p>
      </div>
    </motion.article>
  );
}
