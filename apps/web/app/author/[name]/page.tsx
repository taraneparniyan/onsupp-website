"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { BACKEND_URL } from "@/config/api";

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



export default function AuthorArticlesPage() {
  const params = useParams();
  const rawAuthor = params?.name ? decodeURIComponent(params.name as string) : "";
  const { lang } = useLanguage();
  const isRtl = lang === "fa";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawAuthor) return;
    fetch(`${BACKEND_URL}/api/v1/articles?author=${encodeURIComponent(rawAuthor)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch((err) => console.error("Error fetching author articles:", err))
      .finally(() => setLoading(false));
  }, [rawAuthor]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      <Header />
      <main className="flex-1 w-full pt-[72px] sm:pt-[90px] pb-16 space-y-8 px-[10px]" dir={isRtl ? "rtl" : "ltr"}>
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
          
          {/* Breadcrumb Navigation */}
          <nav
            aria-label={isRtl ? "مسیر دسترسی" : "Breadcrumbs"}
            className="flex items-center gap-2 text-xs font-mono text-foreground/50 select-none px-2"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              {isRtl ? "خانه" : "Home"}
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">
              {isRtl ? "دانشنامه و مقالات" : "Articles"}
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-foreground/90 font-medium">
              {rawAuthor || (isRtl ? "نویسنده" : "Author")}
            </span>
          </nav>

          {/* Author Header Banner */}
          <div className="w-full rounded-lg sm:rounded-xl border border-foreground/15 bg-gradient-to-r from-panel via-panel to-background p-6 sm:p-12 shadow-md relative overflow-hidden mt-[10px]">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-mint/30 to-leaf/20 border-2 border-mint/40 text-mint font-black flex items-center justify-center text-3xl shadow-md shrink-0">
                {rawAuthor ? rawAuthor.charAt(0) : "آ"}
              </div>
              <div className="space-y-3 text-center sm:text-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/10 border border-mint/20 text-mint text-xs font-bold">
                  {isRtl ? "پروفایل و مقالات نویسنده" : "Author Profile & Articles"}
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-foreground">
                  {rawAuthor || (isRtl ? "نویسنده آن‌ساپ" : "OnSupp Author")}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/70 max-w-2xl leading-6">
                  {isRtl
                    ? `مشاهده تمامی مقالات، تحلیل‌ها و گزارش‌های منتشرشده توسط ${rawAuthor} در وبلاگ رسمی آن‌ساپ.`
                    : `View all articles and insights published by ${rawAuthor} on OnSupp Official Blog.`}
                </p>
                <div className="pt-2 flex items-center justify-center sm:justify-start gap-4 text-xs text-mint font-bold">
                  <span>
                    {isRtl
                      ? `تعداد کل مقالات: ${String(articles.length).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])}`
                      : `Total Articles: ${articles.length}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint" />
              <span>{isRtl ? `مقالات منتشرشده توسط ${rawAuthor}` : `Articles by ${rawAuthor}`}</span>
            </h2>

            {loading ? (
              <div className="w-full rounded-xl border border-foreground/10 bg-panel px-6 py-24 text-center text-foreground/50 shadow-md">
                {isRtl ? "در حال دریافت مقالات نویسنده..." : "Loading author articles..."}
              </div>
            ) : articles.length === 0 ? (
              <div className="w-full rounded-xl border border-foreground/10 bg-panel px-6 py-24 text-center space-y-4 shadow-md">
                <p className="text-base text-foreground/70">
                  {isRtl ? "هیچ مقاله‌ای از این نویسنده ثبت نشده است." : "No articles found for this author."}
                </p>
                <a href="/blog" className="inline-block px-6 py-2.5 rounded-xl bg-leaf text-ink font-bold text-xs">
                  {isRtl ? "بازگشت به آرشیو مقالات" : "Back to Blog Archive"}
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((item) => (
                  <a
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group rounded-lg sm:rounded-xl border border-foreground/10 bg-panel overflow-hidden shadow-md hover:border-mint/40 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="h-44 sm:h-52 w-full overflow-hidden bg-raised relative">
                        <img
                          src={item.imageUrl}
                          alt={isRtl ? item.titleFa : item.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 rounded-xl bg-black/60  text-mint text-xs font-bold border border-white/10">
                            {isRtl ? item.categoryFa : item.categoryEn}
                          </span>
                        </div>
                      </div>

                      <div className="px-6 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-foreground/50">
                          <span>
                            {isRtl
                              ? (item.readTimeFa || "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])
                              : item.readTimeEn}
                          </span>
                          <span>•</span>
                          <span>{new Date(item.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}</span>
                        </div>

                        <h3 className="font-bold text-foreground text-lg group-hover:text-mint transition-colors line-clamp-2 leading-8">
                          {isRtl ? item.titleFa : item.titleEn}
                        </h3>

                        <p className="text-xs text-foreground/70 line-clamp-3 leading-6">
                          {isRtl ? item.excerptFa : item.excerptEn}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 pt-4 border-t border-foreground/10 flex items-center justify-between mt-4">
                      <span className="text-xs font-bold text-mint group-hover:underline flex items-center gap-1">
                        <span>{isRtl ? "مطالعه مقاله" : "Read Article"}</span>
                        <svg className={`w-4 h-4 transform ${isRtl ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
