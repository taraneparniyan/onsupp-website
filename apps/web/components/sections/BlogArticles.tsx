"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useLanguage } from "@/context/LanguageContext";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { staggerContainer, staggerItem, buttonHover, tapFeedback } from "@/lib/motion";

type Article = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  categoryFa: string;
  categoryEn: string;
  excerptFa: string;
  excerptEn: string;
  readTimeFa: string;
  readTimeEn: string;
  imageUrl: string;
  author: string;
  createdAt: string;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80";

const IS_DEV = process.env.NODE_ENV === "development";

const DEV_PREVIEW_ARTICLES: Article[] = [
  {
    id: -1,
    titleFa: "معماری سئوی تکنیکال در وب‌اپلیکیشن‌های مدرن و مقیاس‌پذیر",
    titleEn: "Technical SEO Architecture for Modern Scalable Web Applications",
    slug: "technical-seo-modern-web-architecture",
    categoryFa: "استراتژی و سئو",
    categoryEn: "SEO & Strategy",
    excerptFa:
      "چگونه ساختار رندرینگ سرور، بهینه‌سازی Core Web Vitals و معماری معنایی داده‌ها جایگاه برندهای پیشرو را تثبیت می‌کند.",
    excerptEn:
      "How server-side rendering, Core Web Vitals optimization, and semantic data architecture secure top search rankings.",
    readTimeFa: "۶ دقیقه مطالعه",
    readTimeEn: "6 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-09-24T10:00:00.000Z",
  },
  {
    id: -2,
    titleFa: "اصول طراحی رابط کاربری مجله‌ای و مینیمال برای افزایش نرخ تبدیل",
    titleEn: "Editorial & Minimalist UI Design Principles for Higher Conversion",
    slug: "editorial-ui-design-conversion-rate",
    categoryFa: "طراحی محصول",
    categoryEn: "Product Design",
    excerptFa:
      "بررسی نقش تایپوگرافی دقیق، سلسله‌مراتب بصری و فضای منفی هدفمند در جلب اعتماد کاربران سازمانی و ارتقای تجربه دیجیتال.",
    excerptEn:
      "Exploring the role of refined typography, visual hierarchy, and intentional whitespace in building enterprise trust.",
    readTimeFa: "۵ دقیقه مطالعه",
    readTimeEn: "5 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-10-02T14:30:00.000Z",
  },
  {
    id: -3,
    titleFa: "تحلیل داده‌محور قیف رشد؛ از جذب ترافیک تا وفادارسازی مشتریان",
    titleEn: "Data-Driven Growth Funnels: From Acquisition to Retention",
    slug: "data-driven-growth-marketing-funnel",
    categoryFa: "دیجیتال مارکتینگ",
    categoryEn: "Growth Marketing",
    excerptFa:
      "راهنمای جامع طراحی کمپین‌های عملکردمحور و پایش شاخص‌های کلیدی رشد برای بهینه‌سازی بازگشت سرمایه در بازارهای رقابتی.",
    excerptEn:
      "A comprehensive guide to engineering performance campaigns and tracking key growth metrics to maximize ROI.",
    readTimeFa: "۷ دقیقه مطالعه",
    readTimeEn: "7 min read",
    imageUrl:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    author: "تحریریه آن‌ساپ",
    createdAt: "2026-10-08T09:15:00.000Z",
  },
];

function resolveImageUrl(imageUrl?: string): string {
  if (!imageUrl) return DEFAULT_FALLBACK_IMAGE;
  if (imageUrl.startsWith("http")) return imageUrl;
  return `${BACKEND_URL}${imageUrl}`;
}

function formatArticleDate(dateString: string, isRtl: boolean): string {
  try {
    return new Date(dateString).toLocaleDateString(isRtl ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

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
  const readTime = isRtl
    ? (article.readTimeFa || "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
    : article.readTimeEn;
  const formattedDate = formatArticleDate(article.createdAt, isRtl);
  const articleHref = `/blog/${article.slug}`;
  const authorName =
    article.author || (isRtl ? "تحریریه آن‌ساپ" : "OnSupp Editorial");

  return (
    <article className="group relative flex min-h-[310px] sm:h-[330px] w-full flex-col justify-between overflow-hidden rounded-[24px] border border-white/[0.1] bg-[#121517] p-5 sm:p-6 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.65)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-mint/35 hover:shadow-[0_28px_60px_-12px_rgba(0,0,0,0.8)]">
      {/* Full-bleed horizontal background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolveImageUrl(article.imageUrl)}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />

      {/* Subtle top scrim for category badge readability */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"
        aria-hidden="true"
      />

      {/* Progressive bottom dark gradient + gentle lower blur scrim */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[75%] bg-gradient-to-t from-[#0c0f10] via-[#101416]/94 via-55% to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] backdrop-blur-[5px] [-webkit-backdrop-filter:blur(5px)] [mask-image:linear-gradient(to_top,black_55%,transparent_100%)]"
        aria-hidden="true"
      />

      {/* Stretched clickable link covering the card */}
      <Link
        href={articleHref}
        aria-label={title}
        className="absolute inset-0 z-10 focus:outline-none"
      />

      {/* ── Top Floating Bar: Category Pill + Subtle Icon Badge ── */}
      <div className="relative z-20 flex items-center justify-between gap-3 pointer-events-none">
        {category ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#141819]/75 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            <span>{category}</span>
          </span>
        ) : (
          <span />
        )}

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-[#141819]/70 text-white/85 backdrop-blur-md shadow-md transition-all duration-300 group-hover:border-mint group-hover:bg-mint group-hover:text-ink">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
        </span>
      </div>

      {/* ── Bottom Overlay Content (Title, Excerpt, Meta Icons, Compact CTA) ── */}
      <div className="relative z-20 mt-auto pt-4 pointer-events-none">
        {/* Title */}
        <h3 className="font-display text-base sm:text-lg font-bold leading-[1.45] text-white drop-shadow-sm transition-colors duration-300 group-hover:text-mint line-clamp-2">
          {title}
        </h3>

        {/* Short Excerpt */}
        <p className="mt-1.5 text-xs text-white/75 leading-5 line-clamp-2">
          {excerpt}
        </p>

        {/* Bottom Bar: Metadata Icons + Compact Pill Button */}
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-3 min-w-0 text-[11px] font-medium text-white/75">
            {/* Read Time */}
            {readTime && (
              <span className="inline-flex items-center gap-1 truncate">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-mint"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="truncate">{readTime}</span>
              </span>
            )}

            {/* Publish Date */}
            {formattedDate && (
              <span className="inline-flex items-center gap-1 truncate">
                <svg
                  className="h-3.5 w-3.5 shrink-0 text-mint"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="truncate">{formattedDate}</span>
              </span>
            )}

            {/* Author */}
            <span className="hidden sm:inline-flex items-center gap-1 truncate">
              <svg
                className="h-3.5 w-3.5 shrink-0 text-mint"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="truncate">{authorName}</span>
            </span>
          </div>

          {/* Compact Pill Button */}
          <span className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#e6ebe0]/95 px-4 text-xs font-bold text-[#111416] shadow-md transition-all duration-300 group-hover:bg-mint">
            <span>{isRtl ? "مطالعه" : "Read"}</span>
            <svg
              className={`h-3 w-3 transition-transform duration-300 ${
                isRtl
                  ? "rotate-180 group-hover:-translate-x-0.5"
                  : "group-hover:translate-x-0.5"
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
          </span>
        </div>
      </div>
    </article>
  );
}

export default function BlogArticles() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const prefersReducedMotion = useReducedMotion();
  const [articles, setArticles] = useState<Article[]>(() =>
    IS_DEV ? DEV_PREVIEW_ARTICLES : []
  );
  const [loading, setLoading] = useState(!IS_DEV);
  const [activeSlide, setActiveSlide] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/articles?limit=3`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data.slice(0, 3));
        } else if (IS_DEV) {
          setArticles(DEV_PREVIEW_ARTICLES);
        } else {
          setArticles([]);
        }
      })
      .catch(() => {
        if (IS_DEV) {
          setArticles(DEV_PREVIEW_ARTICLES);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="blog" className="w-full relative overflow-hidden">
      <div dir={isRtl ? "rtl" : "ltr"} className="w-full">
        <div className="w-full border-y border-white/5 bg-panel px-2 sm:px-[10px] py-14 sm:py-20 lg:py-24 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Background Glows coordinated with About section */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-mint/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16">
            <ScrollReveal>
              {/* ── Editorial Section Header ─────────────────────────────── */}
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-14">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-3 text-sm font-bold tracking-widest text-mint uppercase">
                    <span className="h-px w-10 bg-mint/50" />
                    <span>
                      {isRtl
                        ? "وبلاگ و دانش‌نامه آن‌ساپ"
                        : "LATEST INSIGHTS & NEWS"}
                    </span>
                  </div>

                  <h2 className="mt-4 sm:mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.2] tracking-tight text-foreground drop-shadow-md">
                    {isRtl ? (
                      <>
                        جدیدترین مقالات{" "}
                        <span className="text-mint">آموزشی و اخبار سازمان</span>
                      </>
                    ) : (
                      <>
                        Latest Articles{" "}
                        <span className="text-mint">& Industry News</span>
                      </>
                    )}
                  </h2>

                  <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg text-foreground/65 leading-relaxed sm:leading-8 max-w-2xl">
                    {isRtl
                      ? "تازه‌ترین مقالات تخصصی سئو، طراحی وب، دیجیتال مارکتینگ و دستاوردهای جدید تیم آن‌ساپ"
                      : "Explore our latest expert articles on SEO, Web Development, Marketing trends, and OnSupp company updates."}
                  </p>
                </div>

                <motion.div
                  whileHover={prefersReducedMotion ? undefined : buttonHover}
                  whileTap={prefersReducedMotion ? undefined : tapFeedback}
                  className="w-full sm:w-auto shrink-0"
                >
                  <Link
                    href="/blog"
                    className="inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2.5 rounded-xl bg-mint px-7 py-3.5 sm:px-8 sm:py-4 text-sm sm:text-base font-bold text-ink shadow-[0_0_16px_rgba(194,202,173,0.18)] hover:bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group"
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
                        strokeWidth="2.5"
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
                    } h-[300px] sm:h-[320px] w-full flex-col justify-between rounded-[24px] border border-white/[0.08] bg-[#121517] p-6 animate-pulse`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-28 rounded-full bg-white/[0.07]" />
                      <div className="h-8 w-8 rounded-full bg-white/[0.07]" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-5 w-4/5 rounded bg-white/[0.08]" />
                      <div className="h-4 w-full rounded bg-white/[0.05]" />
                      <div className="h-8 w-full rounded-full bg-white/[0.08] mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.07] bg-[#141719]/80 px-6 py-16 text-center">
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
                                  ? "w-7 bg-mint"
                                  : "w-2 bg-white/20 hover:bg-white/40"
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#141719] text-foreground transition-all hover:border-mint/40 hover:text-mint disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
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
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#141719] text-foreground transition-all hover:border-mint/40 hover:text-mint disabled:opacity-35 disabled:pointer-events-none cursor-pointer"
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
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
