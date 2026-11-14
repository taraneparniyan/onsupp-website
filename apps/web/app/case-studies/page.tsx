"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  SHOWCASE_PROJECTS,
  getAllCaseStudies,
  type CaseStudyItem,
} from "@/lib/case-studies";
import { scrollToSection } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";

const ITEMS_PER_PAGE = 12;


// Helper icon for project preview type
function TypeBadgeIcon({ type }: { type: "mobile" | "web" | "platform" }) {
  if (type === "mobile") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (type === "web") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

export default function CaseStudiesArchivePage() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";

  const [projects, setProjects] = useState<CaseStudyItem[]>(() =>
    getAllCaseStudies(SHOWCASE_PROJECTS)
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync with backend database if available
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/casestudies`, { cache: "no-store" })
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

          setProjects(getAllCaseStudies(merged));
        }
      })
      .catch(() => {});
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => {
      const cat = isRtl ? p.categoryFa : p.categoryEn;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [projects, isRtl]);

  // Filter projects by category and search
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const categoryMatch =
        selectedCategory === "all" ||
        (isRtl ? p.categoryFa : p.categoryEn) === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        (p.titleFa && p.titleFa.toLowerCase().includes(q)) ||
        (p.titleEn && p.titleEn.toLowerCase().includes(q)) ||
        (p.client && p.client.toLowerCase().includes(q)) ||
        (p.clientEn && p.clientEn.toLowerCase().includes(q)) ||
        (p.taglineFa && p.taglineFa.toLowerCase().includes(q)) ||
        (p.taglineEn && p.taglineEn.toLowerCase().includes(q));

      return categoryMatch && searchMatch;
    });
  }, [projects, selectedCategory, searchQuery, isRtl]);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Pagination calculation (12 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 pb-20 sm:pb-28">
        {/* ── Hero Section ── */}
        <section className="relative w-full pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden border-b border-black/[0.06] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#111416] mb-10 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
              className="flex items-center gap-2 text-xs font-mono text-foreground/50 mb-6 select-none"
            >
              <Link href="/" className="hover:text-foreground transition-colors">
                {isRtl ? "خانه" : "Home"}
              </Link>
              <span className="opacity-40">/</span>
              <span className="text-foreground/90 font-medium">
                {isRtl ? "مطالعات موردی و پروژه‌ها" : "Case Studies"}
              </span>
            </nav>

            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50 shrink-0" />
                <span>{isRtl ? "آرشیو مطالعات موردی و نتایج • CASE STUDIES" : "ARCHIVE & VERIFIED OUTCOMES"}</span>
              </div>

              <h1
                className={`text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.25] ${
                  isRtl
                    ? "font-[family-name:var(--font-vazirmatn)]"
                    : "font-[family-name:var(--font-gendy)]"
                }`}
              >
                {isRtl
                  ? "بررسی مستند چالش‌ها، راهکارها و نتایج عددی پروژه‌ها"
                  : "In-Depth Architectural Case Studies & Measurable Impact"}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-foreground/75 leading-relaxed font-normal">
                {isRtl
                  ? "مستندات واقعی از فرآیند حل مسئله، مهندسی زیرساخت و رشد پایدار برندهای پیشرو در همکاری با تیم متخصصان آن‌ساپ."
                  : "Real-world engineering documentation, strategic problem-solving, and sustainable growth metrics achieved in partnership with OnSupp."}
              </p>
            </div>
          </div>
        </section>

        {/* ── Filters & Search Bar ────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-panel/70 border border-foreground/10 backdrop-blur-md">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-lime text-ink shadow-[0_0_16px_rgba(178,248,0,0.3)] font-bold"
                    : "bg-raised text-foreground/70 hover:text-foreground hover:bg-panel border border-foreground/10"
                }`}
              >
                {isRtl ? "همه پروژه‌ها" : "All Projects"}
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === category
                      ? "bg-lime text-ink shadow-[0_0_16px_rgba(178,248,0,0.3)] font-bold"
                      : "bg-raised text-foreground/70 hover:text-foreground hover:bg-panel border border-foreground/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px] sm:min-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isRtl ? "جستجوی پروژه یا برند..." : "Search case studies..."}
                className="w-full bg-raised border border-foreground/10 rounded-xl px-4 py-2.5 ps-9 text-xs sm:text-sm text-foreground placeholder-foreground/40 focus:outline-none focus:border-mint focus:ring-1 focus:ring-mint transition-all"
              />
              <svg
                className={`w-4 h-4 text-foreground/40 absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? "right-3" : "left-3"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </section>

        {/* ── Case Studies Grid (12 items per page) ────────────────────── */}
        <section id="archive-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {paginatedProjects.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-panel/50 border border-foreground/10">
              <span className="text-4xl block mb-3">🔍</span>
              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                {isRtl ? "پروژه‌ای با این مشخصات یافت نشد" : "No case studies match your query"}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/50 mb-4">
                {isRtl ? "می‌توانید فیلتر دسته‌بندی را تغییر دهید یا عبارت دیگری جستجو کنید." : "Try adjusting your category filter or search keywords."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="px-4 py-2 rounded-xl bg-raised hover:bg-panel border border-foreground/10 text-xs text-foreground font-semibold transition-all"
              >
                {isRtl ? "پاکسازی فیلترها" : "Clear Filters"}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedProjects.map((project) => (
                <article
                  key={project.id}
                  className="group relative rounded-2xl bg-panel border border-foreground/10 hover:border-mint/30 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_16px_36px_rgba(0,0,0,0.4)]"
                >
                  {/* Top Visual Card Preview */}
                  <div
                    className={`relative h-48 sm:h-52 w-full bg-gradient-to-br ${project.colorGradient} p-5 flex flex-col justify-between overflow-hidden border-b border-foreground/10`}
                  >
                    {/* Ambient Glow */}
                    <div
                      className="absolute -top-12 -end-12 w-48 h-48 rounded-full blur-[60px] pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: project.glowColor }}
                    />

                    {/* Top Row: Category & Preview Type Badge */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-semibold text-white/80">
                        <TypeBadgeIcon type={project.previewType} />
                        <span>{isRtl ? project.categoryFa : project.categoryEn}</span>
                      </span>

                      {project.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-lime text-ink text-[10px] font-bold">
                          {isRtl ? "شاخص" : "Featured"}
                        </span>
                      )}
                    </div>

                    {/* Bottom of Visual Card: Client Name & Metrics Preview */}
                    <div className="relative z-10">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-mint block mb-1">
                        {isRtl ? project.client : project.clientEn}
                      </span>
                      <div className="flex items-center gap-3">
                        {(isRtl ? project.metricsFa : project.metricsEn).slice(0, 2).map((m, i) => (
                          <div key={i} className="flex items-baseline gap-1">
                            <span className="font-display font-bold text-sm text-white" dir="ltr">
                              {isRtl ? m.value.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]) : m.value}
                            </span>
                            <span className="text-[10px] text-white/70">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content Body */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="font-display text-lg sm:text-xl font-bold text-foreground mb-2 leading-tight group-hover:text-mint transition-colors">
                        {isRtl ? project.titleFa : project.titleEn}
                      </h2>

                      <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-2">
                        {isRtl ? project.taglineFa : project.taglineEn}
                      </p>

                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {(isRtl ? project.servicesFa : project.servicesEn).map((service, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-raised border border-foreground/10 text-[10px] text-foreground/70 font-mono"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-3 border-t border-foreground/10 flex items-center justify-between">
                      <a
                        href={project.liveUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-mint hover:text-foreground transition-colors"
                      >
                        <span>{isRtl ? "مشاهده جزئیات پروژه" : "View Case Study"}</span>
                        <svg
                          className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>

                      <span className="text-[10px] text-foreground/40 font-mono uppercase">
                        {project.previewType}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* ── Pagination Controls (12 per page) ───────────────────────── */}
          {totalPages > 1 && (
            <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  scrollToSection("archive-grid", { updateHash: false });
                }}
                className="px-3.5 py-2 rounded-xl bg-panel border border-foreground/10 text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-raised transition-all cursor-pointer"
              >
                {isRtl ? "صفحه قبل" : "Previous"}
              </button>

              <div className="flex items-center gap-1 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNumber);
                      scrollToSection("archive-grid", { updateHash: false });
                    }}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-lime text-ink shadow-[0_0_12px_rgba(178,248,0,0.3)]"
                        : "bg-panel border border-foreground/10 text-foreground/70 hover:text-foreground hover:bg-raised"
                    }`}
                  >
                    {isRtl ? String(pageNumber).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]) : pageNumber}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  scrollToSection("archive-grid", { updateHash: false });
                }}
                className="px-3.5 py-2 rounded-xl bg-panel border border-foreground/10 text-xs font-semibold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-raised transition-all cursor-pointer"
              >
                {isRtl ? "صفحه بعد" : "Next"}
              </button>
            </div>
          )}
        </section>

        {/* ── Back to Homepage Banner ─────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-panel via-raised to-panel border border-foreground/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                {isRtl ? "پروژه اختصاصی خود را با ما آغاز کنید" : "Ready to Engineer Your Next Milestone?"}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                {isRtl
                  ? "ما تجربیات دیجیتالی پیشرو برای برندهای شاخص خلق می‌کنیم. با کارشناسان آن‌ساپ تماس بگیرید."
                  : "We build category-defining software architectures and high-impact digital experiences."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/#case-studies"
                className="px-5 py-3 rounded-xl bg-raised hover:bg-panel border border-foreground/10 text-xs sm:text-sm font-semibold text-foreground hover:text-mint transition-all"
              >
                {isRtl ? "بازگشت به صفحه اصلی" : "Back to Home"}
              </Link>
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(178,248,0,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                {isRtl ? "درخواست جلسه مشاوره" : "Start Your Project"}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
