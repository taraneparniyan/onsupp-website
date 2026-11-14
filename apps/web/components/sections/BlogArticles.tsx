"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, buttonHover, tapFeedback } from "@/lib/motion";
import { CANONICAL_PREVIEW_ARTICLES, type Article } from "@/lib/articles";
import { BACKEND_URL } from "@/config/api";



const DEFAULT_FALLBACK_IMAGE = "/images/services/technical-seo.webp";

const IS_DEV = process.env.NODE_ENV === "development";

const DEV_PREVIEW_ARTICLES: Article[] = CANONICAL_PREVIEW_ARTICLES;

function resolveImageUrl(imageUrl?: string): string {
  if (!imageUrl) return DEFAULT_FALLBACK_IMAGE;
  if (imageUrl.startsWith("http") || imageUrl.startsWith("/")) return imageUrl;
  return `${BACKEND_URL}${imageUrl}`;
}

const PERSIAN_MONTHS = [
  "ژانویه",
  "فوریه",
  "مارس",
  "آوریل",
  "مه",
  "ژوئن",
  "ژوئیه",
  "اوت",
  "سپتامبر",
  "اکتبر",
  "نوامبر",
  "دسامبر",
];

const toFaDigits = (n: number | string) =>
  String(n).replace(/\d/g, (x) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(x, 10)]);

function formatArticleDate(dateString: string, isRtl: boolean): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;

    if (isRtl) {
      const day = d.getDate();
      const month = PERSIAN_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${toFaDigits(day)} ${month} ${toFaDigits(year)}`;
    }

    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Editorial article card styled exactly according to the reference screenshot:
 * - Crisp elevated card with rounded corners (rounded-[24px])
 * - Top image container with bottom dark vignette and category tag on bottom-left
 * - Clean content area: Date on top-right, bold Title, subtle Excerpt
 * - "ادامه مطلب ←" on the bottom-left with left-pointing arrow
 */
function EditorialArticleCard({
  article,
  isRtl,
}: {
  article: Article;
  isRtl: boolean;
}) {
  const title = isRtl ? article.titleFa : article.titleEn;
  const excerpt = isRtl ? article.excerptFa : article.excerptEn;
  const category = isRtl ? article.categoryFa : article.categoryEn;
  const formattedDate = formatArticleDate(article.createdAt, isRtl);
  const articleHref = `/blog/${article.slug}`;

  return (
    <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] sm:rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1A1D1C] shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out hover:-translate-y-1.5 select-none">
      {/* ── Top Image Container ── */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/5 dark:bg-white/[0.04]">
        <Link href={articleHref} className="block w-full h-full">
          <Image
            src={resolveImageUrl(article.imageUrl)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            unoptimized={Boolean(article.imageUrl?.startsWith("http"))}
          />
        </Link>

        {/* Smooth dark vignette at bottom of image for category text contrast */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
        />

        {/* Category Tag on bottom left of image (matching reference exactly) */}
        {category && (
          <span className="absolute bottom-3.5 left-4.5 sm:bottom-4 sm:left-5 text-xs sm:text-sm font-bold text-white tracking-wide drop-shadow-md select-none pointer-events-none">
            {category}
          </span>
        )}
      </div>

      {/* ── Body Content Area: Date, Title, Excerpt, Read More Link ── */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-7 bg-white dark:bg-[#1A1D1C]">
        <div>
          {/* Date: top-right aligned in RTL */}
          {formattedDate && (
            <time
              dateTime={article.createdAt}
              className="block text-xs font-normal text-[#9AA0A6] dark:text-white/45 mb-3"
            >
              {formattedDate}
            </time>
          )}

          {/* Title */}
          <h3 className="font-display text-base sm:text-lg font-bold text-[#1F1F1E] dark:text-white leading-[1.6] mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0]">
            <Link href={articleHref} className="focus:outline-none hover:underline">
              {title}
            </Link>
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-[#5F6368] dark:text-white/60 leading-relaxed sm:leading-[1.75] line-clamp-2 sm:line-clamp-3 mb-6">
            {excerpt}
          </p>
        </div>

        {/* Action Link: "ادامه مطلب ←" on the bottom left (end in RTL) */}
        <div className="mt-auto flex items-center justify-end pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
          <Link
            href={articleHref}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1F1F1E] dark:text-white transition-colors duration-300 group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0]"
          >
            <span>{isRtl ? "ادامه مطلب" : "Read More"}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${
                isRtl
                  ? "group-hover:-translate-x-1.5"
                  : "rotate-180 group-hover:translate-x-1.5"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.9"
                d="M19 12H5m0 0l5-5m-5 5l5 5"
              />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function BlogArticles() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();
  const [articles, setArticles] = useState<Article[]>(CANONICAL_PREVIEW_ARTICLES.slice(0, 3));
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    const langParam = isRtl ? "fa" : "en";
    fetch(`${BACKEND_URL}/api/v1/articles?limit=3&language=${langParam}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const valid = data.filter(
            (a) =>
              a &&
              a.published !== false &&
              !a.slug?.startsWith("test") &&
              !a.slug?.startsWith("article-179") &&
              a.slug !== "seo-technical-architecture-1793534887383" &&
              a.titleFa !== "تست" &&
              a.titleFa !== "New Article" &&
              a.titleFa !== "API Service Post" &&
              (isRtl ? Boolean(a.titleFa?.trim()) : Boolean((a.titleEn || a.titleFa)?.trim()))
          );
          setArticles(valid.length > 0 ? valid.slice(0, 3) : CANONICAL_PREVIEW_ARTICLES.slice(0, 3));
        } else {
          setArticles(CANONICAL_PREVIEW_ARTICLES.slice(0, 3));
        }
      })
      .catch(() => {
        setArticles(CANONICAL_PREVIEW_ARTICLES.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [lang, isRtl]);

  return (
    <section id="blog" className="section-viewport w-full relative overflow-hidden">
      <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
        <div className="section-viewport w-full border-y border-black/[0.06] dark:border-white/[0.08] bg-[#F8F9FA] dark:bg-[#111416] px-2 sm:px-[10px] py-16 sm:py-20 lg:py-24 relative overflow-hidden transition-colors">
          {/* Subtle Ambient Background Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 select-none overflow-hidden"
          >
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#38534A]/8 dark:bg-[#38534A]/15 rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-[460px] h-[460px] bg-[#B7FF00]/5 dark:bg-[#B7FF00]/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-14">
            <ScrollReveal>
              {/* ── Section Header ─────────────────────────────── */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
                <div className="max-w-3xl lg:max-w-none">
                  <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase mb-4">
                    <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                    <span>
                      {isRtl
                        ? "وبلاگ و دانش‌نامه آن‌ساپ"
                        : "LATEST INSIGHTS & KNOWLEDGE BASE"}
                    </span>
                  </div>

                  <h2 className="font-display text-2xl sm:text-4xl lg:text-4xl xl:text-[42px] lg:whitespace-nowrap font-black text-foreground tracking-tight leading-[1.25]">
                    {isRtl ? (
                      <>
                        جدیدترین مقالات{" "}
                        <span className="text-[#38534A] dark:text-[#8AB3A0]">
                          آموزشی و بینش‌های تخصصی
                        </span>
                      </>
                    ) : (
                      <>
                        Latest Articles{" "}
                        <span className="text-[#38534A] dark:text-[#8AB3A0]">
                          & Expert Insights
                        </span>
                      </>
                    )}
                  </h2>

                  <p className="mt-3 text-sm sm:text-base text-foreground/65 leading-relaxed max-w-2xl">
                    {isRtl
                      ? "تازه‌ترین مقالات تخصصی در حوزه سئو تکنیکال، طراحی وب‌سایت سازمانی و ویدیو مارکتینگ با نگارش کارشناسان ارشد آن‌ساپ"
                      : "Explore authoritative articles, web engineering architecture, technical SEO, and brand media strategies."}
                  </p>
                </div>

                {/* Desktop "View All Articles" button (hidden on mobile, shown on lg+) */}
                <motion.div
                  whileHover={prefersReducedMotion ? undefined : buttonHover}
                  whileTap={prefersReducedMotion ? undefined : tapFeedback}
                  className="hidden lg:block shrink-0"
                >
                  <Link
                    href="/blog"
                    className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#38534A] dark:bg-white text-white dark:text-[#1F1F1E] px-7 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#2B4038] dark:hover:bg-white/90 transition-all duration-300 group cursor-pointer"
                  >
                    <span>
                      {isRtl ? "مشاهده همه مقالات" : "View All Articles"}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isRtl
                          ? "rotate-180 group-hover:-translate-x-1"
                          : "group-hover:translate-x-1"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.4"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </Link>
                </motion.div>
              </div>
            </ScrollReveal>

            {/* ── Articles Content ─────────────────────────────────────── */}
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8 w-full">
                {[0, 1, 2].map((skeleton) => (
                  <div
                    key={skeleton}
                    className={`${
                      skeleton > 0 ? "hidden lg:flex" : "flex"
                    } h-[420px] w-full flex-col justify-between rounded-[24px] border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#1A1D1C] overflow-hidden animate-pulse`}
                  >
                    <div className="aspect-[16/10] w-full bg-foreground/[0.08]" />
                    <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="h-4 w-24 rounded bg-foreground/[0.06]" />
                        <div className="h-5 w-4/5 rounded bg-foreground/[0.08]" />
                        <div className="h-4 w-full rounded bg-foreground/[0.05]" />
                        <div className="h-4 w-2/3 rounded bg-foreground/[0.05]" />
                      </div>
                      <div className="h-4 w-20 rounded bg-foreground/[0.08] self-end" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl border border-foreground/10 bg-panel px-6 py-16 text-center">
                <p className="text-sm sm:text-base text-foreground/55">
                  {isRtl
                    ? "هنوز مقاله‌ای منتشر نشده است."
                    : "No articles available."}
                </p>
              </div>
            ) : (
              <>
                {/* ── Desktop 3-Column Row (lg+) ── */}
                <ScrollReveal>
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="hidden lg:grid lg:grid-cols-3 gap-6 xl:gap-8 w-full items-stretch"
                  >
                    {articles.map((article) => (
                      <motion.div
                        key={article.id}
                        variants={staggerItem}
                        className="h-full"
                      >
                        <EditorialArticleCard
                          article={article}
                          isRtl={isRtl}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </ScrollReveal>

                {/* ── Mobile & Tablet Swiper Slider (< 1024px, 1 card per view) ── */}
                <div className="block lg:hidden">
                  <Swiper
                    key={isRtl ? "blog-swiper-rtl" : "blog-swiper-ltr"}
                    dir={isRtl ? "rtl" : "ltr"}
                    slidesPerView={1}
                    spaceBetween={16}
                    speed={prefersReducedMotion ? 0 : 450}
                    touchStartPreventDefault={false}
                    passiveListeners={true}
                    onSwiper={(swiper) => {
                      swiperRef.current = swiper;
                    }}
                    onSlideChange={(swiper) => {
                      setActiveSlide(swiper.activeIndex);
                    }}
                    className="w-full"
                  >
                    {articles.map((article) => (
                      <SwiperSlide key={article.id} className="h-auto">
                        <EditorialArticleCard
                          article={article}
                          isRtl={isRtl}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Mobile Swiper Controls */}
                  {articles.length > 1 && (
                    <div className="mt-6 w-full flex items-center justify-between gap-4">
                      {/* Pagination Dots */}
                      <div className="flex items-center gap-2">
                        {articles.map((item, idx) => {
                          const isActive = idx === activeSlide;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => swiperRef.current?.slideTo(idx)}
                              aria-label={
                                isRtl
                                  ? `رفتن به مقاله ${idx + 1}`
                                  : `Go to article ${idx + 1}`
                              }
                              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                isActive
                                  ? "w-7 bg-[#38534A] dark:bg-[#8AB3A0]"
                                  : "w-2 bg-foreground/20 hover:bg-foreground/40"
                              }`}
                            />
                          );
                        })}
                      </div>

                      {/* Prev / Next Buttons */}
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => swiperRef.current?.slidePrev()}
                          disabled={activeSlide === 0}
                          aria-label={isRtl ? "مقاله قبلی" : "Previous article"}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.08] text-foreground transition-all hover:bg-[#38534A] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                        >
                          <svg
                            className={`h-4 w-4 ${isRtl ? "" : "rotate-180"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => swiperRef.current?.slideNext()}
                          disabled={activeSlide === articles.length - 1}
                          aria-label={isRtl ? "مقاله بعدی" : "Next article"}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.08] text-foreground transition-all hover:bg-[#38534A] hover:text-white dark:hover:bg-white dark:hover:text-[#1F1F1E] disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
                        >
                          <svg
                            className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Mobile-Only "View All Articles" button placed below articles & slider ── */}
                  <div className="mt-8 pt-2 flex justify-center w-full">
                    <Link
                      href="/blog"
                      className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-2xl bg-[#38534A] dark:bg-white text-white dark:text-[#1F1F1E] px-7 py-3.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#2B4038] dark:hover:bg-white/90 active:scale-95 transition-all duration-300 group cursor-pointer text-center"
                    >
                      <span>
                        {isRtl ? "مشاهده همه مقالات" : "View All Articles"}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isRtl
                            ? "rotate-180 group-hover:-translate-x-1"
                            : "group-hover:translate-x-1"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.4"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
