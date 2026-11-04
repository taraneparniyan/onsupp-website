"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { CaseStudyItem, SHOWCASE_PROJECTS, getAllCaseStudies, normalizeCaseStudy } from "@/lib/case-studies";
import { BACKEND_URL } from "@/config/api";
import PortfolioHero from "./PortfolioHero";
import PortfolioAsymmetricSwiper from "./PortfolioAsymmetricSwiper";
import PortfolioCategoryFilter, {
  PortfolioCategoryKey,
  PORTFOLIO_CATEGORY_TABS,
  matchesCategory,
} from "./PortfolioCategoryFilter";
import ScrollableProjectFrame from "./ScrollableProjectFrame";
import PortfolioCreativeApproach from "./PortfolioCreativeApproach";
import PortfolioIndustriesSection from "./PortfolioIndustriesSection";
import PortfolioCTASection from "./PortfolioCTASection";

export default function PortfolioPageView({
  allProjects,
}: {
  allProjects: CaseStudyItem[];
}) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const searchParams = useSearchParams();

  const [projectList, setProjectList] = useState<CaseStudyItem[]>(allProjects);

  // Sync with backend API if available
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${BACKEND_URL}/api/v1/casestudies`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItems) => {
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const merged: CaseStudyItem[] = dbItems.map((item: any, idx: number) => {
            const match = SHOWCASE_PROJECTS.find(
              (p) => p.slug === item.slug || p.titleFa === item.titleFa || p.id === item.slug
            );
            const normalized = normalizeCaseStudy(item, idx);
            if (match) {
              return {
                ...match,
                ...normalized,
                servicesFa: (Array.isArray(item.servicesFa) && item.servicesFa.length > 0) ? item.servicesFa : match.servicesFa,
                servicesEn: (Array.isArray(item.servicesEn) && item.servicesEn.length > 0) ? item.servicesEn : match.servicesEn,
                metricsFa: (Array.isArray(item.metricsFa) && item.metricsFa.length > 0) ? item.metricsFa : match.metricsFa,
                metricsEn: (Array.isArray(item.metricsEn) && item.metricsEn.length > 0) ? item.metricsEn : match.metricsEn,
                colorGradient: item.colorGradient || match.colorGradient,
                accentColor: item.accentColor || match.accentColor,
                glowColor: item.glowColor || match.glowColor,
                previewType: item.previewType || match.previewType,
              };
            }
            return normalized;
          });

          setProjectList(getAllCaseStudies(merged));
        }
      })
      .catch(() => {
        // Retain initial allProjects
      });

    return () => {
      controller.abort();
    };
  }, []);

  // Initialize category from URL query param if present
  const initialCategory = (searchParams.get("category") as PortfolioCategoryKey) || "all";
  const [activeCategory, setActiveCategory] = useState<PortfolioCategoryKey>(
    PORTFOLIO_CATEGORY_TABS.some((t) => t.id === initialCategory) ? initialCategory : "all"
  );

  // Sync category changes with URL query parameter without full-page reload
  const handleSelectCategory = (catId: PortfolioCategoryKey) => {
    setActiveCategory(catId);
    const params = new URLSearchParams(window.location.search);
    if (catId === "all") {
      params.delete("category");
    } else {
      params.set("category", catId);
    }
    const query = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${query}`);
  };

  // Synchronize if user navigates back/forward
  useEffect(() => {
    const cat = searchParams.get("category") as PortfolioCategoryKey;
    if (cat && PORTFOLIO_CATEGORY_TABS.some((t) => t.id === cat)) {
      setActiveCategory(cat);
    } else if (!cat) {
      setActiveCategory("all");
    }
  }, [searchParams]);

  // Compute category project counts
  const categoryCounts = useMemo(() => {
    const counts: Record<PortfolioCategoryKey, number> = {
      all: projectList.length,
      "web-design": 0,
      instagram: 0,
      coding: 0,
      video: 0,
      animation: 0,
      seo: 0,
    };

    projectList.forEach((proj) => {
      PORTFOLIO_CATEGORY_TABS.forEach((tab) => {
        if (tab.id !== "all" && matchesCategory(proj, tab.id)) {
          counts[tab.id] = (counts[tab.id] || 0) + 1;
        }
      });
    });

    return counts;
  }, [projectList]);

  // Filtered projects for the showcase
  const filteredProjects = useMemo(() => {
    if (activeCategory === "all") return projectList;
    const matched = projectList.filter((p) => matchesCategory(p, activeCategory));
    return matched.length > 0 ? matched : projectList;
  }, [projectList, activeCategory]);

  // Featured flagship projects for Swiper stage
  const featuredProjects = useMemo(() => {
    return projectList.filter((p) => p.featured);
  }, [projectList]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F4F5F2] dark:bg-[#121413] text-[#1F1F1E] dark:text-[#EAEAEA] antialiased selection:bg-[#38534A] selection:text-white transition-colors"
    >
      <Header />

      <main className="relative flex flex-col w-full overflow-hidden">
        {/* ── 1. Editorial Hero ── */}
        <PortfolioHero isRtl={isRtl} />

        {/* ── 2. Asymmetric Swiper Stage (Curated Flagship Spotlight) ── */}
        <section
          aria-label={isRtl ? "ویترین پروژه‌های شاخص" : "Curated Project Stage"}
          className="relative w-full py-14 sm:py-20 border-b border-[#1F1F1E]/10 dark:border-white/10 overflow-hidden"
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
            <PortfolioAsymmetricSwiper
              isRtl={isRtl}
              projects={featuredProjects.length >= 3 ? featuredProjects : projectList}
            />
          </div>
        </section>

        {/* ── 3. Showcase & Projects Archive Directory (Filtered by Category) ── */}
        <section
          id="showcase"
          aria-label={isRtl ? "آرشیو پروژه‌ها و نمونه‌کارها" : "Projects Archive & Portfolio Directory"}
          className="relative w-full py-16 sm:py-24 border-b border-[#1F1F1E]/10 dark:border-white/10"
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
            {/* Category Filter Tabs (Sharp Rectangular Geometry) */}
            <PortfolioCategoryFilter
              isRtl={isRtl}
              activeCategory={activeCategory}
              onSelectCategory={handleSelectCategory}
              counts={categoryCounts}
            />

            {/* Editorial Projects Archive Directory */}
            <div className="mt-12 sm:mt-16">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
                <div>
                  <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-2">
                    <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
                    <span>{isRtl ? "آرشیو مطالعات موردی و پروژه‌ها" : "CASE STUDY ARCHIVES & PORTFOLIO"}</span>
                  </div>
                  <h3
                    className={`text-xl sm:text-3xl font-black text-foreground ${
                      isRtl
                        ? "font-[family-name:var(--font-vazirmatn)]"
                        : "font-[family-name:var(--font-gendy)]"
                    }`}
                  >
                    {isRtl
                      ? "مرور مستقیم پروژه‌ها و جزئیات دستاوردها"
                      : "Direct Case Study Deep-Dives"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-foreground/60 max-w-md">
                  {isRtl
                    ? "برای مطالعه مستندات فنی، متدولوژی اجرا، چالش‌ها و نتایج عددی هر پروژه، روی آن کلیک کنید."
                    : "Explore the architectural challenge, bespoke solution, and verified metrics for each delivered milestone."}
                </p>
              </div>

              {/* ── Editorial Asymmetrical Cards Grid ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {filteredProjects.map((project, idx) => {
                  const cardImage = project.secondaryImage || project.image || "/case_study_1.jpg";
                  // Make the first item span 2 columns on large screens for an editorial magazine rhythm
                  const isLargeSpan = idx === 0 && filteredProjects.length > 2;

                  return (
                    <article
                      key={project.slug || project.id}
                      className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-none bg-[#EAEBE7] dark:bg-[#1A1D1C] border border-[#1F1F1E]/12 dark:border-white/10 hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all duration-300 hover:shadow-md ${
                        isLargeSpan ? "md:col-span-2 lg:col-span-2" : "col-span-1"
                      }`}
                    >
                      <div>
                        {/* Media Frame with Hover Scroll */}
                        <div className="mb-5">
                          <ScrollableProjectFrame
                            src={cardImage}
                            alt={isRtl ? project.titleFa : project.titleEn}
                            isRtl={isRtl}
                            className={
                              isLargeSpan
                                ? "h-[320px] sm:h-[400px] lg:h-[440px]"
                                : "h-[260px] sm:h-[300px] lg:h-[320px]"
                            }
                            previewType={project.previewType}
                            liveUrl={project.liveUrl}
                          />
                        </div>

                        {/* Top Category & Year Row */}
                        <div className="flex items-center justify-between gap-3 mb-2.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#38534A] dark:text-[#8AB3A0]">
                            {isRtl ? project.categoryFa : project.categoryEn}
                          </span>
                          <span className="font-mono text-[11px] text-foreground/50">
                            {project.year || "۲۰۲۵"}
                          </span>
                        </div>

                        {/* Client & Title */}
                        <span className="text-xs font-semibold text-foreground/60 block mb-1">
                          {isRtl ? project.client : project.clientEn}
                        </span>
                        <h4
                          className={`font-bold text-foreground mb-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors leading-snug ${
                            isLargeSpan ? "text-lg sm:text-2xl" : "text-base sm:text-lg"
                          }`}
                        >
                          <Link href={`/portfolio/${project.slug}`}>
                            {isRtl ? project.titleFa : project.titleEn}
                          </Link>
                        </h4>
                        <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed mb-4">
                          {isRtl ? project.taglineFa : project.taglineEn}
                        </p>
                      </div>

                      {/* Card Bottom: Metric Highlight + Detail Link */}
                      <div className="pt-4 border-t border-[#1F1F1E]/10 dark:border-white/10 flex items-center justify-between">
                        {project.metricsFa && project.metricsFa[0] ? (
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="font-bold text-[#38534A] dark:text-[#8AB3A0] font-mono">
                              {isRtl ? project.metricsFa[0].value : project.metricsEn?.[0]?.value || project.metricsFa[0].value}
                            </span>
                            <span className="text-[10px] text-foreground/60">
                              {isRtl ? project.metricsFa[0].label : project.metricsEn?.[0]?.label || project.metricsFa[0].label}
                            </span>
                          </div>
                        ) : (
                          <span />
                        )}

                        <Link
                          href={`/portfolio/${project.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] group-hover:underline cursor-pointer"
                        >
                          <span>{isRtl ? "مطالعه پروژه" : "View Case"}</span>
                          <svg
                            className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. Creative Philosophy & Engineering Pillars ── */}
        <PortfolioCreativeApproach isRtl={isRtl} />

        {/* ── 5. Sector & Industries Breakdown ── */}
        <PortfolioIndustriesSection isRtl={isRtl} />

        {/* ── 6. Closing Consultation CTA ── */}
        <PortfolioCTASection isRtl={isRtl} />
      </main>

      <Footer />
    </div>
  );
}
