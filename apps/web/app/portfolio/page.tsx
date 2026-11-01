"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  SHOWCASE_PROJECTS,
  getAllCaseStudies,
  type CaseStudyItem,
} from "@/lib/case-studies";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const ITEMS_PER_PAGE = 9;

// ─── Categories Definition ───────────────────────────────────────────────────

export type PortfolioCategoryKey =
  | "all"
  | "web-design"
  | "instagram"
  | "seo"
  | "video"
  | "animation"
  | "coding"
  | "other";

export interface PortfolioCategory {
  id: PortfolioCategoryKey;
  labelFa: string;
  labelEn: string;
  descriptionFa: string;
  descriptionEn: string;
}

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  {
    id: "all",
    labelFa: "همه",
    labelEn: "All",
    descriptionFa: "نمایش تمام پروژه‌های تحول دیجیتال و مهندسی آن‌ساپ",
    descriptionEn: "Displaying all digital transformation & engineering projects",
  },
  {
    id: "web-design",
    labelFa: "طراحی سایت",
    labelEn: "Web Design",
    descriptionFa: "طراحی و توسعه وب‌سایت‌های سازمانی، فروشگاهی و پلتفرم‌های تحت وب",
    descriptionEn: "Corporate, e-commerce, and bespoke web platforms",
  },
  {
    id: "instagram",
    labelFa: "اینستاگرام",
    labelEn: "Instagram",
    descriptionFa: "مدیریت استراتژیک، تولید محتوا، طراحی بصری و هویت‌سازی پیج",
    descriptionEn: "Strategic account growth, visual branding, and content creation",
  },
  {
    id: "seo",
    labelFa: "سئو",
    labelEn: "SEO",
    descriptionFa: "بهینه‌سازی ساختار فنی، رتبه‌بندی کلمات کلیدی و رشد ترافیک ارگانیک",
    descriptionEn: "Technical SEO, search ranking growth, and organic performance",
  },
  {
    id: "video",
    labelFa: "فیلم‌برداری",
    labelEn: "Videography",
    descriptionFa: "تصویربرداری صنعتی، تیزرهای تبلیغاتی، پادکست و تدوین حرفه‌ای",
    descriptionEn: "Commercial videography, industrial trailers, and post-production",
  },
  {
    id: "animation",
    labelFa: "انیمیشن",
    labelEn: "Animation",
    descriptionFa: "انیمیشن دوبعدی و سه‌بعدی، موشن‌گرافیک تجاری و جلوه‌های ویژه",
    descriptionEn: "2D/3D animation, brand motion design, and cinematic effects",
  },
  {
    id: "coding",
    labelFa: "برنامه‌نویسی",
    labelEn: "Programming",
    descriptionFa: "توسعه نرم‌افزار اختصاصی، اپلیکیشن موبایل، سیستم‌های کلود و هوش مصنوعی",
    descriptionEn: "Custom software engineering, mobile apps, cloud systems & AI",
  },
  {
    id: "other",
    labelFa: "سایر خدمات",
    labelEn: "Other Services",
    descriptionFa: "راهکارهای تخصصی CRM، اتوماسیون فرآیندها، تله‌متری و استراتژی برند",
    descriptionEn: "Specialized CRM integrations, process automation & brand strategy",
  },
];

// ─── Filter & Search Helpers ─────────────────────────────────────────────────

function getProjectSearchableText(project: CaseStudyItem): string {
  return [
    project.categoryFa,
    project.categoryEn,
    project.titleFa,
    project.titleEn,
    project.taglineFa,
    project.taglineEn,
    project.client,
    project.clientEn,
    ...(project.servicesFa || []),
    ...(project.servicesEn || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function hasAnyKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((kw) => text.includes(kw.toLowerCase()));
}

function matchesCategory(
  project: CaseStudyItem,
  categoryKey: PortfolioCategoryKey
): boolean {
  if (categoryKey === "all") return true;
  const text = getProjectSearchableText(project);

  switch (categoryKey) {
    case "web-design":
      if (project.projectType === "website") return true;
      return hasAnyKeyword(text, [
        "طراحی سایت",
        "طراحی وب",
        "وب‌سایت",
        "وبسایت",
        "رابط کاربری",
        "ui/ux",
        "پلتفرم تحلیلی",
        "داشبورد",
        "next.js",
        "web design",
        "website",
        "dark ui/ux",
      ]);

    case "instagram":
      if (project.projectType === "instagram") return true;
      return hasAnyKeyword(text, [
        "اینستاگرام",
        "سوشال",
        "سوشیال",
        "شبکه‌های اجتماعی",
        "ریلز",
        "فضای مجازی",
        "instagram",
        "social media",
      ]);

    case "seo":
      if (project.projectType === "seo") return true;
      return hasAnyKeyword(text, [
        "سئو",
        "بهینه‌سازی موتور",
        "رتبه گوگل",
        "رتبه‌بندی",
        "ترافیک ارگانیک",
        "seo",
        "search engine",
      ]);

    case "video":
      if (project.projectType === "video") return true;
      return hasAnyKeyword(text, [
        "فیلمبرداری",
        "فیلم‌برداری",
        "تیزر",
        "تدوین",
        "ویدیو",
        "ویدئو",
        "سینمایی",
        "استودیو",
        "videography",
        "video",
      ]);

    case "animation":
      if (project.projectType === "animation") return true;
      return hasAnyKeyword(text, [
        "انیمیشن",
        "موشن گرافیک",
        "موشن‌گرافیک",
        "سه‌بعدی",
        "animation",
        "motion graphics",
      ]);

    case "coding":
      if (project.projectType === "app" || project.projectType === "software") {
        return true;
      }
      return hasAnyKeyword(text, [
        "برنامه‌نویسی",
        "توسعه",
        "اپلیکیشن",
        "نرم‌افزار",
        "معماری",
        "میکروسرویس",
        "کلود",
        "کلاود",
        "کوبرنتیز",
        "هوش مصنوعی",
        "یادگیری عمیق",
        "سوکت",
        "react native",
        "react",
        "ios",
        "engineering",
        "speech",
        "telemetry",
      ]);

    case "other": {
      const hasSpecialized = hasAnyKeyword(text, [
        "crm",
        "اتوماسیون",
        "استراتژی",
        "دیزاین سیستم",
        "لجستیک",
        "تله‌متری",
        "برندینگ",
        "هویت بصری",
        "automation",
        "telemetry",
      ]);
      const matchesMain =
        matchesCategory(project, "web-design") ||
        matchesCategory(project, "instagram") ||
        matchesCategory(project, "seo") ||
        matchesCategory(project, "video") ||
        matchesCategory(project, "animation") ||
        matchesCategory(project, "coding");
      return hasSpecialized || !matchesMain;
    }

    default:
      return true;
  }
}

// ─── Helper Badge Component ──────────────────────────────────────────────────

function TypeBadge({ type }: { type?: "mobile" | "web" | "platform" }) {
  if (type === "mobile") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/70">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Mobile
      </span>
    );
  }
  if (type === "web") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/70">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Web App
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-white/70">
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      Platform
    </span>
  );
}

// ─── Main Portfolio Content ──────────────────────────────────────────────────

function PortfolioContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const isRtl = lang === "fa";

  const [projects, setProjects] = useState<CaseStudyItem[]>(() =>
    getAllCaseStudies(SHOWCASE_PROJECTS)
  );
  const [selectedCategory, setSelectedCategory] =
    useState<PortfolioCategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync initial category from URL param (?category=...)
  useEffect(() => {
    const catParam = searchParams.get("category") as PortfolioCategoryKey | null;
    if (
      catParam &&
      PORTFOLIO_CATEGORIES.some((c) => c.id === catParam)
    ) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Fetch and merge database case studies if backend is available
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/casestudies`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItems) => {
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const merged: CaseStudyItem[] = [...SHOWCASE_PROJECTS];
          for (const item of dbItems) {
            const exists = merged.some(
              (p) =>
                p.id === String(item.id) ||
                p.slug === item.titleEn?.toLowerCase().replace(/\s+/g, "-")
            );
            if (!exists) {
              const previewType: "mobile" | "web" | "platform" =
                item.projectType === "app"
                  ? "mobile"
                  : item.projectType === "instagram"
                  ? "platform"
                  : "web";
              merged.push({
                id: String(item.id),
                slug: `project-${item.id}`,
                client: item.titleFa || "مشتری سازمانی",
                clientEn: item.titleEn || "Enterprise Client",
                titleFa: item.titleFa || "",
                titleEn: item.titleEn || "",
                taglineFa: item.descriptionFa || "",
                taglineEn: item.descriptionEn || "",
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
                projectType: item.projectType || "website",
                liveUrl: item.liveUrl || "#",
                featured: false,
                position: item.position ?? 999,
              });
            }
          }
          setProjects(getAllCaseStudies(merged));
        }
      })
      .catch(() => {});
  }, []);

  // Filter projects based on selectedCategory and searchQuery
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchCat = matchesCategory(project, selectedCategory);
      if (!matchCat) return false;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const searchable = getProjectSearchableText(project);
      return searchable.includes(q);
    });
  }, [projects, selectedCategory, searchQuery]);

  // Reset page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    PORTFOLIO_CATEGORIES.forEach((cat) => {
      counts[cat.id] = projects.filter((p) =>
        matchesCategory(p, cat.id)
      ).length;
    });
    return counts;
  }, [projects]);

  // Pagination calculations (supports unlimited projects)
  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / ITEMS_PER_PAGE));
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const activeCategoryObj =
    PORTFOLIO_CATEGORIES.find((c) => c.id === selectedCategory) ||
    PORTFOLIO_CATEGORIES[0];

  const handleCategoryClick = (catId: PortfolioCategoryKey) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (catId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", catId);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const toFaDigits = (val: string | number): string =>
    String(val).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── 1. Page Header: Title & Short Introduction ─────────────── */}
          <section className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-white/10 text-xs font-bold tracking-widest text-mint uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>{isRtl ? "اسکلت اولیه نمونه‌کارها" : "Portfolio Skeleton"}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {isRtl ? "نمونه‌کارهای آن‌ساپ" : "OnSupp Portfolio"}
            </h1>

            <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed mb-4">
              {isRtl
                ? "مجموعه پروژه‌های اجرایی، پلتفرم‌های نرم‌افزاری و راهکارهای جامع دیجیتال آن‌ساپ. در این مرحله اسکلت اولیه و ساختار دسته‌بندی‌ها پیاده‌سازی شده و داده‌های واقعی پروژه قابل مشاهده و فیلتر هستند."
                : "A structured archive of OnSupp’s delivered software platforms, web systems, and brand transformations. This initial skeleton provides category-level filtering of real project data."}
            </p>

            {/* Skeleton Notice Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-[11px] text-foreground/50">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>
                {isRtl
                  ? "توجه: تصاویر کامل و صفحات مستقل جزئیات هر پروژه در فازهای بعدی تکمیل و بارگذاری می‌شوند."
                  : "Note: Final hero photography and dedicated detail pages will be added in upcoming phases."}
              </span>
            </div>
          </section>

          {/* ── 2. Category Filters & Search ────────────────────────────── */}
          <section className="mb-10">
            {/* Filter Buttons Bar */}
            <div
              role="tablist"
              aria-label={isRtl ? "دسته‌بندی‌های نمونه‌کارها" : "Portfolio Categories"}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 p-3 rounded-2xl bg-panel/70 border border-white/10 backdrop-blur-md"
            >
              {PORTFOLIO_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const count = categoryCounts[cat.id] ?? 0;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none inline-flex items-center gap-2 ${
                      isActive
                        ? "bg-lime text-ink shadow-[0_0_18px_rgba(178,248,0,0.3)] font-bold"
                        : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isActive
                          ? "bg-black/20 text-black font-bold"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {isRtl ? toFaDigits(count) : count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Category Description & Search Input */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 px-2">
              <p className="text-xs text-foreground/50">
                {isRtl
                  ? activeCategoryObj.descriptionFa
                  : activeCategoryObj.descriptionEn}
              </p>

              {/* Search Box */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    isRtl ? "جستجو در پروژه‌ها یا برندها..." : "Search projects or brands..."
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 ps-9 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/50 transition-all"
                />
                <svg
                  className={`w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 ${
                    isRtl ? "right-3" : "left-3"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </section>

          {/* ── 3. Projects Grid: Real Data Display & Initial Cards ─────── */}
          <section id="portfolio-grid">
            {filteredProjects.length === 0 ? (
              /* Clean Empty State for Categories without Projects */
              <div className="py-16 sm:py-20 px-6 text-center rounded-3xl bg-panel/40 border border-white/10 flex flex-col items-center justify-center max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-mint mb-4">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2">
                  {isRtl
                    ? `در حال حاضر نمونه‌کارهای بخش «${activeCategoryObj.labelFa}» در مرحله مستندسازی هستند`
                    : `Case studies for "${activeCategoryObj.labelEn}" are currently being documented`}
                </h3>

                <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed mb-6">
                  {isRtl
                    ? "اطلاعات، تیزرها و پروژه‌های واقعی این بخش به‌زودی پس از تکمیل تدوین و نهایی‌سازی در این لیست قرار خواهند گرفت."
                    : "Verified projects, footage, and deliverables for this category will be uploaded as soon as documentation is finalized."}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    handleCategoryClick("all");
                    setSearchQuery("");
                  }}
                  className="px-5 py-2.5 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_16px_rgba(178,248,0,0.25)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  {isRtl ? "مشاهده همه پروژه‌های فعال" : "View All Active Projects"}
                </button>
              </div>
            ) : (
              /* Grid Layout (Scalable for unlimited projects) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paginatedProjects.map((project) => (
                  <article
                    key={project.id}
                    className="group relative rounded-2xl bg-panel border border-white/10 hover:border-mint/30 overflow-hidden flex flex-col transition-all duration-300"
                  >
                    {/* Card Top: Image / Visual Preview Container */}
                    <div
                      className={`relative h-48 sm:h-52 w-full bg-gradient-to-br ${project.colorGradient} p-4 sm:p-5 flex flex-col justify-between overflow-hidden border-b border-white/5`}
                    >
                      {/* Subtle ambient tint */}
                      <div
                        className="absolute -top-10 -end-10 w-40 h-40 rounded-full blur-[50px] pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
                        style={{ backgroundColor: project.glowColor }}
                      />

                      {/* Header row in preview: Badges */}
                      <div className="relative z-10 flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-white/90">
                          {isRtl ? project.categoryFa : project.categoryEn}
                        </span>

                        <TypeBadge type={project.previewType} />
                      </div>

                      {/* Placeholder Image Notice */}
                      <div className="relative z-10 my-auto py-2 px-3 rounded-xl bg-black/40 border border-dashed border-white/20 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-white/70 mb-0.5">
                          <svg
                            className="w-4 h-4 text-mint"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-[11px] font-semibold text-white">
                            {isRtl ? project.client : project.clientEn}
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground/50 block font-mono">
                          {isRtl
                            ? "تصویر رسمی: در حال بارگذاری / نیاز به تکمیل"
                            : "Asset: Pending final image upload"}
                        </span>
                      </div>

                      {/* Bottom of visual: Key Metrics Preview */}
                      <div className="relative z-10 flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                        <span className="text-[10px] text-white/50 font-mono">
                          {isRtl ? "شاخص عملکرد" : "Key Metric"}
                        </span>
                        {(isRtl ? project.metricsFa : project.metricsEn).slice(0, 1).map((m, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-xs font-bold text-mint font-mono" dir="ltr">
                              {isRtl ? toFaDigits(m.value) : m.value}
                            </span>
                            <span className="text-[10px] text-white/60">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Card Body: Name, Short Description & Badges */}
                    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Client / Organization */}
                        <div className="text-[11px] font-bold text-mint uppercase tracking-wider mb-1">
                          {isRtl ? project.client : project.clientEn}
                        </div>

                        {/* Project Title */}
                        <h2 className="font-display text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                          {isRtl ? project.titleFa : project.titleEn}
                        </h2>

                        {/* Short Description */}
                        <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-4 line-clamp-3">
                          {isRtl ? project.taglineFa : project.taglineEn}
                        </p>

                        {/* Service Tags */}
                        {project.servicesFa && project.servicesFa.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {(isRtl ? project.servicesFa : project.servicesEn).map(
                              (service, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] text-white/60"
                                >
                                  {service}
                                </span>
                              )
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Detail Link / Status Indicator */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-foreground/50 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                          <span>
                            {isRtl
                              ? "صفحه جزئیات: فاز بعدی"
                              : "Detail page: Coming soon"}
                          </span>
                        </span>

                        <span className="text-[10px] font-mono text-white/40 uppercase">
                          ID: {project.id}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ── 4. Pagination (Handles unlimited projects) ───────────── */}
            {totalPages > 1 && (
              <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    const el = document.getElementById("portfolio-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-panel border border-white/10 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isRtl ? "صفحه قبل" : "Previous"}
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => {
                          setCurrentPage(pageNumber);
                          const el = document.getElementById("portfolio-grid");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-lime text-ink shadow-[0_0_12px_rgba(178,248,0,0.3)] font-bold"
                            : "bg-panel border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {isRtl ? toFaDigits(pageNumber) : pageNumber}
                      </button>
                    )
                  )}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    const el = document.getElementById("portfolio-grid");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-panel border border-white/10 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isRtl ? "صفحه بعد" : "Next"}
                </button>
              </div>
            )}
          </section>

          {/* ── 5. Bottom Navigation / Contact Section ─────────────────── */}
          <section className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                {isRtl
                  ? "پروژه بعدی شما می‌تواند در این فهرست باشد"
                  : "Ready to Create Your Next Milestone?"}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                {isRtl
                  ? "تیم آن‌ساپ آماده همراهی در طراحی، توسعه و استراتژی رشد دیجیتال کسب‌وکار شماست."
                  : "OnSupp partners with ambitious brands to engineer high-impact digital experiences."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/services"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs sm:text-sm font-semibold text-white hover:text-mint transition-all"
              >
                {isRtl ? "مشاهده خدمات ما" : "Our Services"}
              </Link>
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_24px_rgba(178,248,0,0.25)] hover:scale-105 active:scale-95 transition-all"
              >
                {isRtl ? "درخواست جلسه مشاوره" : "Start Your Project"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PortfolioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <PortfolioContent />
    </Suspense>
  );
}
