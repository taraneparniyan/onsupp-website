"use client";

import { MotionConfig } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import type { AboutPageContent } from "@/lib/about";
import AboutHero from "./AboutHero";
import AboutIntro from "./AboutIntro";
import CeoSection from "./CeoSection";
import TeamSection from "./TeamSection";

/**
 * Presentation shell for /about. Receives fully-resolved content from the
 * server page, so swapping the data source (static → CMS) never touches UI.
 */
export default function AboutPageView({ content }: { content: AboutPageContent }) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col w-full bg-background" dir={isRtl ? "rtl" : "ltr"}>
        <Header />
        <main className="flex-1 w-full">
          <AboutHero hero={content.hero} isRtl={isRtl} />
          <AboutIntro intro={content.intro} isRtl={isRtl} />
          <CeoSection ceo={content.ceo} isRtl={isRtl} />
          <TeamSection team={content.team} isRtl={isRtl} />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
