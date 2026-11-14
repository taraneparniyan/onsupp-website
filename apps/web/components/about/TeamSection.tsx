"use client";

import { useEffect, useState } from "react";
import { getVisibleMembers, type AboutPageContent } from "@/lib/about";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { Eyebrow, RevealText, gendyClass, toFaDigits } from "./primitives";
import TeamMemberCard from "./TeamMemberCard";

type Props = { team: AboutPageContent["team"]; isRtl: boolean };

/** Mirrors the grid breakpoints so cards entering on the same row stagger together. */
function useGridColumns() {
  const [columns, setColumns] = useState(1);
  useEffect(() => {
    const queries: [number, MediaQueryList][] = [
      [4, window.matchMedia("(min-width: 1280px)")],
      [3, window.matchMedia("(min-width: 1024px)")],
      [2, window.matchMedia("(min-width: 640px)")],
    ];
    const update = () => setColumns(queries.find(([, q]) => q.matches)?.[0] ?? 1);
    update();
    queries.forEach(([, q]) => q.addEventListener("change", update));
    return () => queries.forEach(([, q]) => q.removeEventListener("change", update));
  }, []);
  return columns;
}

export default function TeamSection({ team, isRtl }: Props) {
  const members = getVisibleMembers(team.members);
  const columns = useGridColumns();
  const count = String(members.length).padStart(2, "0");

  return (
    <section
      id="team"
      aria-labelledby="team-title"
      className="relative w-full bg-background py-20 sm:py-28 lg:py-36"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-10 lg:px-16">
        {/* ─── Section header ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 lg:items-end">
          <div className="lg:col-span-7">
            <ScrollReveal animation="fadeIn" duration={0.8}>
              <Eyebrow>{isRtl ? team.eyebrowFa : team.eyebrowEn}</Eyebrow>
            </ScrollReveal>
            <div id="team-title">
              <RevealText
                as="h2"
                text={isRtl ? team.titleFa : team.titleEn}
                delay={0.1}
                className="mt-5 sm:mt-6 font-display font-bold text-foreground text-3xl sm:text-4xl lg:text-4xl xl:text-[44px] lg:whitespace-nowrap leading-[1.3] lg:leading-[1.25] tracking-tight"
              />
            </div>
          </div>
          <div className="lg:col-span-5">
            <ScrollReveal animation="slideUp" delay={0.2}>
              <p className="text-base sm:text-[17px] leading-[2] text-muted">
                {isRtl ? team.descriptionFa : team.descriptionEn}
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className={`${gendyClass} text-4xl sm:text-5xl text-foreground leading-none`}>
                  {isRtl ? toFaDigits(count) : count}
                </span>
                <span aria-hidden="true" className="h-px w-10 bg-foreground/25" />
                <span className="text-sm text-foreground/60">
                  {isRtl ? "عضو در تیم آن‌ساپ" : "people at OnSupp"}
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* ─── Members grid (editorial offset rhythm on large screens) ─── */}
        <div className="mt-14 sm:mt-20 lg:mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-14 sm:gap-y-16">
          {members.map((member, i) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              index={i}
              isRtl={isRtl}
              column={i % columns}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
