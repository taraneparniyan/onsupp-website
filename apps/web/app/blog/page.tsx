"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  type Article,
  CANONICAL_PREVIEW_ARTICLES,
  BACKEND_URL,
  formatArticleDate,
  toFaDigits,
} from "@/lib/articles";

const ITEMS_PER_PAGE = 6;

function BlogContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const isRtl = lang === "fa";

  const [articles, setArticles] = useState<Article[]>(CANONICAL_PREVIEW_ARTICLES);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync category filter from URL parameter
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam) {
      setSelectedCategory(decodeURIComponent(catParam));
    }
  }, [searchParams]);

  // Fetch articles from backend API without hiding connection errors
  const fetchArticlesFromApi = () => {
    setLoading(true);
    setApiError(null);

    fetch(`${BACKEND_URL}/api/v1/articles`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`خطای سرور: وضعیت پاسخ ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
          setApiError(null);
        } else if (Array.isArray(data) && data.length === 0) {
          // Connected successfully but database is currently empty
          setArticles([]);
          setApiError(null);
        }
      })
      .catch((err) => {
        // Do not hide error: expose transparent status to the user
        const errMsg =
          err instanceof Error
            ? err.message
            : "عدم امکان برقراری ارتباط با وب‌سرویس بک‌اند";
        setApiError(errMsg);
        // Fallback to verified canonical preview dataset so skeleton remains inspectable
        setArticles(CANONICAL_PREVIEW_ARTICLES);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchArticlesFromApi();
  }, []);

  // Compute dynamic categories present in actual articles
  const categories = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      const cat = (isRtl ? a.categoryFa : a.categoryEn) || a.categoryFa || a.categoryEn;
      if (cat && cat.trim()) set.add(cat.trim());
    });
    return Array.from(set);
  }, [articles, isRtl]);

  // Filter articles based on active category & search query
  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const cat = (isRtl ? a.categoryFa : a.categoryEn) || a.categoryFa || a.categoryEn || "";
      const title = (isRtl ? a.titleFa : a.titleEn) || a.titleFa || a.titleEn || "";
      const excerpt = (isRtl ? a.excerptFa : a.excerptEn) || a.excerptFa || a.excerptEn || "";
      const author = a.author || "";

      const matchesCat =
        selectedCategory === "all" || cat === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        title.toLowerCase().includes(q) ||
        excerpt.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        author.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery, isRtl]);

  // Reset to page 1 on filter or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Separate featured article (first article when on "all" and not searching)
  const isStandardView = selectedCategory === "all" && !searchQuery.trim();
  const featuredArticle = isStandardView ? filteredArticles[0] : null;
  const listArticles = isStandardView
    ? filteredArticles.slice(1)
    : filteredArticles;

  // Pagination calculations (supports unlimited articles)
  const totalPages = Math.max(1, Math.ceil(listArticles.length / ITEMS_PER_PAGE));
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return listArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [listArticles, currentPage]);

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (cat === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", cat);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div
      className="min-h-screen bg-background text-foreground flex flex-col font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ── 1. Page Header: Title & Short Introduction ─────────────── */}
          <section className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-panel border border-white/10 text-xs font-bold tracking-widest text-mint uppercase mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
              <span>{isRtl ? "اسکلت اولیه مجله آن‌ساپ" : "Magazine Skeleton"}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
              {isRtl ? "مجله تخصصی و دانشنامه آن‌ساپ" : "OnSupp Magazine & Insights"}
            </h1>

            <p className="text-sm sm:text-base text-foreground/70 max-w-2xl mx-auto leading-relaxed">
              {isRtl
                ? "مرجع مقالات تخصصی، راهنماهای سئو، معماری سیستم‌های دیجیتال، طراحی محصول و تحلیل‌های استراتژیک آن‌ساپ. در این مرحله اسکلت اولیه صفحه، اتصال به وب‌سرویس و ساختار مقالات پیاده‌سازی شده است."
                : "Explore in-depth articles, technical SEO guides, web architecture insights, and digital growth strategies engineered by the OnSupp editorial team."}
            </p>
          </section>

          {/* ── Backend API Status & Transparent Error Notice ──────────── */}
          {apiError && (
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-300 mb-1">
                    {isRtl
                      ? "اطلاعیه اتصال وب‌سرویس بک‌اند (API)"
                      : "Backend API Connection Notice"}
                  </h4>
                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    {isRtl
                      ? `ارتباط زنده با بک‌اند (${BACKEND_URL}/api/v1/articles) برقرار نشد (${apiError}). در حال حاضر داده‌های مستند اولیه جهت بررسی اسکلت صفحه نمایش داده می‌شوند و با اجرای سرور بک‌اند، مقالات داینامیک دیتابیس جایگزین خواهند شد.`
                      : `Backend service at ${BACKEND_URL} is currently unreachable (${apiError}). Displaying verified canonical articles for skeleton evaluation.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fetchArticlesFromApi}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-amber-500 text-ink text-xs font-bold hover:bg-amber-400 active:scale-95 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? isRtl ? "در حال تلاش مجدد..." : "Retrying..."
                  : isRtl ? "تلاش مجدد اتصال" : "Retry API Connection"}
              </button>
            </div>
          )}

          {/* ── 2. Featured Article Section (بخش مقاله شاخص) ───────────── */}
          {featuredArticle && (
            <section className="mb-12 sm:mb-16">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-lime" />
                <h2 className="text-xs sm:text-sm font-bold text-mint uppercase tracking-wider">
                  {isRtl ? "مقاله شاخص تحریریه" : "Featured Editorial"}
                </h2>
              </div>

              <article className="group relative rounded-3xl bg-panel border border-white/10 hover:border-mint/30 overflow-hidden flex flex-col lg:flex-row transition-all duration-300 shadow-xl">
                {/* Visual Area (Image or Transparent Placeholder) */}
                <div className="relative lg:w-1/2 h-64 sm:h-80 lg:h-auto min-h-[260px] bg-black/40 overflow-hidden flex flex-col justify-between p-4 sm:p-6 border-b lg:border-b-0 lg:border-e border-white/10">
                  {featuredArticle.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featuredArticle.imageUrl}
                      alt={(isRtl ? featuredArticle.titleFa : featuredArticle.titleEn) || featuredArticle.titleFa || featuredArticle.titleEn}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-panel via-raised to-panel text-center">
                      <svg className="w-10 h-10 text-white/30 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-white/50 font-mono">
                        {isRtl ? "تصویر شاخص در انتظار بارگذاری" : "Pending Image Upload"}
                      </span>
                    </div>
                  )}

                  {/* Top floating pill */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-white">
                      {(isRtl ? featuredArticle.categoryFa : featuredArticle.categoryEn) || featuredArticle.categoryFa || featuredArticle.categoryEn}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-lime text-ink text-[11px] font-bold">
                      {isRtl ? "ویژه" : "Featured"}
                    </span>
                  </div>

                  <div className="relative z-10" />
                </div>

                {/* Content Area */}
                <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    {/* Meta header: Read Time & Date */}
                    <div className="flex items-center gap-3 text-xs text-foreground/60 mb-3">
                      <span>{featuredArticle.author || (isRtl ? "تحریریه آن‌ساپ" : "OnSupp")}</span>
                      <span>•</span>
                      <span>{formatArticleDate(featuredArticle.createdAt, isRtl)}</span>
                      {(featuredArticle.readTimeFa || featuredArticle.readTimeEn) && (
                        <>
                          <span>•</span>
                          <span>
                            {(isRtl ? featuredArticle.readTimeFa : featuredArticle.readTimeEn) || featuredArticle.readTimeFa || featuredArticle.readTimeEn}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-4 leading-snug group-hover:text-mint transition-colors">
                      {(isRtl ? featuredArticle.titleFa : featuredArticle.titleEn) || featuredArticle.titleFa || featuredArticle.titleEn}
                    </h3>

                    <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed mb-6">
                      {(isRtl ? featuredArticle.excerptFa : featuredArticle.excerptEn) || featuredArticle.excerptFa || featuredArticle.excerptEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href={`/blog/${featuredArticle.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_16px_rgba(178,248,0,0.25)] hover:scale-105 active:scale-95 transition-all"
                    >
                      <span>{isRtl ? "مطالعه مقاله شاخص" : "Read Featured Article"}</span>
                      <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>

                    <span className="text-[11px] font-mono text-white/40">
                      ID: {featuredArticle.id}
                    </span>
                  </div>
                </div>
              </article>
            </section>
          )}

          {/* ── 3. Filters & Search Control Bar ────────────────────────── */}
          <section className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-panel/70 border border-white/10 backdrop-blur-md">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => handleCategorySelect("all")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-lime text-ink shadow-[0_0_16px_rgba(178,248,0,0.3)] font-bold"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {isRtl ? "همه موضوعات" : "All Categories"}
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-lime text-ink shadow-[0_0_16px_rgba(178,248,0,0.3)] font-bold"
                        : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? "جستجو در عنوان یا متن مقاله..." : "Search articles..."}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 ps-9 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:border-mint/50 focus:ring-1 focus:ring-mint/50 transition-all"
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </section>

          {/* ── 4. Articles Grid: Real Data Display & Cards ─────────────── */}
          <section id="articles-grid">
            {loading ? (
              <div className="py-20 text-center rounded-2xl bg-panel/30 border border-white/5 text-foreground/50 text-sm">
                <span className="inline-block w-6 h-6 border-2 border-mint border-t-transparent rounded-full animate-spin mb-3" />
                <p>{isRtl ? "در حال دریافت مقالات از پایگاه داده..." : "Loading articles from database..."}</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-panel/30 border border-white/5 flex flex-col items-center justify-center">
                <span className="text-4xl block mb-3">📑</span>
                <h3 className="font-display text-lg font-bold text-white mb-1">
                  {isRtl ? "مقاله‌ای با این مشخصات یافت نشد" : "No articles match your query"}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/50 mb-4 max-w-md">
                  {isRtl
                    ? "می‌توانید فیلتر دسته‌بندی را تغییر دهید یا واژه جستجوی دیگری را وارد کنید."
                    : "Try adjusting your category filter or clearing your search query."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    handleCategorySelect("all");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-all cursor-pointer"
                >
                  {isRtl ? "پاکسازی فیلترها" : "Clear Filters"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paginatedArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group relative rounded-2xl bg-panel border border-white/10 hover:border-mint/30 overflow-hidden flex flex-col justify-between transition-all duration-300"
                  >
                    <div>
                      {/* Image Area */}
                      <div className="relative h-48 sm:h-52 w-full bg-black/40 overflow-hidden border-b border-white/5">
                        {article.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={article.imageUrl}
                            alt={(isRtl ? article.titleFa : article.titleEn) || article.titleFa || article.titleEn}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-panel via-raised to-panel text-center">
                            <svg className="w-8 h-8 text-white/30 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[10px] text-white/40 font-mono">
                              {isRtl ? "تصویر در انتظار بارگذاری" : "Pending Image"}
                            </span>
                          </div>
                        )}

                        {/* Top Category Badge */}
                        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5">
                          {article.language && (
                            <span className="px-2 py-0.5 rounded-full bg-raised/80 backdrop-blur-md border border-white/20 text-[9px] font-bold text-mint font-mono uppercase">
                              {article.language}
                            </span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-semibold text-white">
                            {(isRtl ? article.categoryFa : article.categoryEn) || article.categoryFa || article.categoryEn}
                          </span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 sm:p-6">
                        {/* Meta: Author & Date */}
                        <div className="flex items-center gap-2 text-[11px] text-foreground/50 mb-2 font-medium">
                          <span>{article.author || (isRtl ? "آن‌ساپ" : "OnSupp")}</span>
                          <span>•</span>
                          <span>{formatArticleDate(article.createdAt, isRtl)}</span>
                          {(article.readTimeFa || article.readTimeEn) && (
                            <>
                              <span>•</span>
                              <span>{(isRtl ? article.readTimeFa : article.readTimeEn) || article.readTimeFa || article.readTimeEn}</span>
                            </>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-display text-base sm:text-lg font-bold text-white mb-2 leading-snug group-hover:text-mint transition-colors line-clamp-2">
                          {(isRtl ? article.titleFa : article.titleEn) || article.titleFa || article.titleEn}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed line-clamp-3">
                          {(isRtl ? article.excerptFa : article.excerptEn) || article.excerptFa || article.excerptEn}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer: Action Button */}
                    <div className="p-5 sm:p-6 pt-0 border-t border-white/5 flex items-center justify-between mt-4">
                      <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-lime hover:text-white transition-colors"
                      >
                        <span>{isRtl ? "مطالعه مقاله" : "Read Article"}</span>
                        <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>

                      <span className="text-[10px] font-mono text-white/40">
                        {article.slug}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ── 5. Pagination Controls (صفحه‌بندی برای همه مقالات) ────── */}
            {totalPages > 1 && (
              <div className="mt-12 sm:mt-16 flex items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    document.getElementById("articles-grid")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-panel border border-white/10 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isRtl ? "صفحه قبل" : "Previous"}
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById("articles-grid")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-lime text-ink shadow-[0_0_12px_rgba(178,248,0,0.3)] font-bold"
                          : "bg-panel border border-white/10 text-white/70 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {isRtl ? toFaDigits(pageNum) : pageNum}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    document.getElementById("articles-grid")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-panel border border-white/10 text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
                >
                  {isRtl ? "صفحه بعد" : "Next"}
                </button>
              </div>
            )}
          </section>

          {/* ── 6. Bottom Magazine Callout ─────────────────────────────── */}
          <section className="mt-16 sm:mt-20 p-8 sm:p-10 rounded-3xl bg-panel border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
            <div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-2">
                {isRtl ? "می‌خواهید استراتژی اختصاصی کسب‌وکار خود را داشته باشید؟" : "Ready to Engineer Your Next Milestone?"}
              </h3>
              <p className="text-xs sm:text-sm text-foreground/60 max-w-xl">
                {isRtl
                  ? "تیم متخصصان آن‌ساپ آماده همراهی در طراحی وب‌سایت، سئو، هویت‌سازی دیجیتال و توسعه نرم‌افزار کسب‌وکار شما هستند."
                  : "OnSupp partners with leading brands to engineer category-defining software architectures and digital experiences."}
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
                {isRtl ? "درخواست مشاوره رایگان" : "Start Your Project"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BlogListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BlogContent />
    </Suspense>
  );
}
