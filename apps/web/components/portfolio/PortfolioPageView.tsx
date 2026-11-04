"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { CaseStudyItem, SHOWCASE_PROJECTS, getAllCaseStudies } from "@/lib/case-studies";
import { BACKEND_URL } from "@/config/api";
import PortfolioCategoryFilter, {
  PortfolioCategoryKey,
  PORTFOLIO_CATEGORY_TABS,
  matchesCategory,
} from "./PortfolioCategoryFilter";
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
  const router = useRouter();

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
            if (match) {
              return {
                ...match,
                titleFa: item.titleFa || match.titleFa,
                titleEn: item.titleEn || match.titleEn,
                client: item.client || match.client,
                clientEn: item.clientEn || match.clientEn,
                taglineFa: item.taglineFa || match.taglineFa,
                taglineEn: item.taglineEn || match.taglineEn,
                categoryFa: item.categoryFa || match.categoryFa,
                categoryEn: item.categoryEn || match.categoryEn,
                image: item.imageUrl || match.image,
                secondaryImage: item.secondaryImage || match.secondaryImage,
                liveUrl: item.liveUrl || match.liveUrl,
                position: item.position ?? match.position ?? idx,
                featured: item.featured ?? match.featured,
                year: item.year || match.year,
              };
            }

            const previewType: "mobile" | "web" | "platform" =
              item.projectType === "app"
                ? "mobile"
                : item.projectType === "instagram"
                ? "platform"
                : "web";

            return {
              id: item.slug || `project-${item.id}`,
              slug: item.slug || `project-${item.id}`,
              client: item.client || item.titleFa || "مشتری سازمانی",
              clientEn: item.clientEn || item.titleEn || "Enterprise Client",
              titleFa: item.titleFa || "",
              titleEn: item.titleEn || "",
              taglineFa: item.taglineFa || item.descriptionFa || "",
              taglineEn: item.taglineEn || item.descriptionEn || "",
              categoryFa: item.categoryFa || "دیجیتال",
              categoryEn: item.categoryEn || "Digital",
              servicesFa: [item.categoryFa || "توسعه محصول"],
              servicesEn: [item.categoryEn || "Product Development"],
              metricsFa: [{ value: "۱۰۰٪", label: "رضایت کارفرما" }],
              metricsEn: [{ value: "100%", label: "Client Satisfaction" }],
              colorGradient: "from-[#0d1620] via-[#112338] to-[#081018]",
              accentColor: "#38bdf8",
              glowColor: "rgba(56, 189, 248, 0.15)",
              previewType,
              image: item.imageUrl || "/case_study_1.jpg",
              secondaryImage: item.secondaryImage || undefined,
              liveUrl: item.liveUrl || "#",
              featured: item.featured !== false,
              position: item.position ?? idx,
              year: item.year || "۲۰۲۵",
            };
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

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#F8F9FA] dark:bg-[#111416] text-[#1F1F1E] dark:text-[#EAEAEA] antialiased selection:bg-[#B7FF00] selection:text-black transition-colors"
    >
      <Header />

      <main className="relative flex flex-col w-full overflow-hidden">
        {/* ── 1. Showcase & Projects Archive Directory (Filtered by Category) ── */}
        <section
          id="showcase"
          aria-label={isRtl ? "آرشیو پروژه‌ها و نمونه‌کارها" : "Projects Archive & Portfolio Directory"}
          className="relative w-full pt-28 sm:pt-36 pb-16 sm:pb-24 border-b border-black/[0.06] dark:border-white/[0.08]"
        >
          <div className="mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 xl:px-14">
            {/* Category Filter Pills */}
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
                  {/* Section Eyebrow - Matching About Us Pattern */}
                  <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-2">
                    <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
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

              {/* Editorial List / Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.slug || project.id}
                    href={`/portfolio/${project.slug}`}
                    className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-3xl bg-white/70 dark:bg-[#1A1A19]/80 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-[#38534A]/50 dark:hover:border-[#8AB3A0]/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div>
                      {/* Media Thumbnail */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/10 dark:bg-white/[0.04] mb-5">
                        <Image
                          src={project.image || "/case_study_1.jpg"}
                          alt={isRtl ? project.titleFa : project.titleEn}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        
                        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-white tracking-wider">
                            {project.year}
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-md text-[10px] font-bold text-foreground">
                            {isRtl ? project.categoryFa : project.categoryEn}
                          </span>
                        </div>
                      </div>

                      {/* Client & Title */}
                      <span className="text-[11px] font-semibold text-[#38534A] dark:text-[#8AB3A0] block mb-1">
                        {isRtl ? project.client : project.clientEn}
                      </span>
                      <h4 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors leading-snug">
                        {isRtl ? project.titleFa : project.titleEn}
                      </h4>
                      <p className="text-xs text-foreground/70 line-clamp-2 leading-relaxed mb-4">
                        {isRtl ? project.taglineFa : project.taglineEn}
                      </p>
                    </div>

                    {/* Card Bottom: Metric Highlight + Explore Link */}
                    <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
                      {project.metricsFa && project.metricsFa[0] && (
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-bold text-foreground font-mono">
                            {isRtl ? project.metricsFa[0].value : project.metricsEn?.[0]?.value || project.metricsFa[0].value}
                          </span>
                          <span className="text-[10px] text-foreground/50">
                            {isRtl ? project.metricsFa[0].label : project.metricsEn?.[0]?.label || project.metricsFa[0].label}
                          </span>
                        </div>
                      )}

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
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
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. Creative Philosophy & Engineering Pillars ── */}
        <PortfolioCreativeApproach isRtl={isRtl} />

        {/* ── 3. Sector & Industries Breakdown ── */}
        <PortfolioIndustriesSection isRtl={isRtl} />

        {/* ── 4. Closing Consultation CTA ── */}
        <PortfolioCTASection isRtl={isRtl} />
      </main>

      <Footer />
    </div>
  );
}
