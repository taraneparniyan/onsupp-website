"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection } from "@/lib/scroll";
import { CANONICAL_PREVIEW_ARTICLES } from "@/lib/articles";
import { sanitizeArticleHtml, safeJsonLdStringify } from "@/lib/sanitize";
import { BACKEND_URL } from "@/config/api";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
  order: number;
};

type Article = {
  id: number;
  titleFa: string;
  titleEn: string;
  slug: string;
  language?: "fa" | "en";
  categoryFa: string;
  categoryEn: string;
  excerptFa: string;
  excerptEn: string;
  contentFa: string;
  contentEn: string;
  readTimeFa: string;
  readTimeEn: string;
  imageUrl: string;
  author: string;
  published?: boolean;
  relatedTranslation?: {
    id: number;
    titleFa: string;
    titleEn: string;
    slug: string;
    language: string;
  } | null;
  faqs?: FaqItem[];
  metaTitleFa?: string;
  metaTitleEn?: string;
  metaDescFa?: string;
  metaDescEn?: string;
  canonicalUrl?: string;
  ogImage?: string;
  createdAt: string;
};



export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { lang } = useLanguage();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToc, setShowToc] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isArticleEn = article?.language === "en";
  const isRtl = isArticleEn ? false : lang === "fa";
  const displayTitle = isArticleEn ? (article?.titleEn || article?.titleFa) : (article?.titleFa || article?.titleEn);
  const displayExcerpt = isArticleEn ? (article?.excerptEn || article?.excerptFa) : (article?.excerptFa || article?.excerptEn);
  const displayContent = isArticleEn ? (article?.contentEn || article?.contentFa) : (article?.contentFa || article?.contentEn);
  const displayCategory = isArticleEn ? (article?.categoryEn || "SEO") : (article?.categoryFa || "آموزش سئو");
  const displayReadTime = isArticleEn ? (article?.readTimeEn || "5 min read") : (article?.readTimeFa || "۵ دقیقه مطالعه");

  const [comments, setComments] = useState<any[]>([]);
  const [commentForm, setCommentForm] = useState({ name: "", email: "", content: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ title: string; desc: string; type: "success" | "error" } | null>(null);

  const loadComments = () => {
    if (!slug) return;
    fetch(`${BACKEND_URL}/api/v1/comments?articleSlug=${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setComments(data);
      });
  };

  useEffect(() => {
    if (!slug) return;
    fetch(`${BACKEND_URL}/api/v1/articles/by-slug/${slug}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setArticle(data);
        } else {
          const fallback = CANONICAL_PREVIEW_ARTICLES.find((a) => a.slug === slug);
          if (fallback) setArticle(fallback as unknown as Article);
        }
      })
      .catch(() => {
        const fallback = CANONICAL_PREVIEW_ARTICLES.find((a) => a.slug === slug);
        if (fallback) setArticle(fallback as unknown as Article);
      })
      .finally(() => setLoading(false));

    loadComments();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          name: commentForm.name,
          email: commentForm.email,
          content: commentForm.content,
        }),
      });

      if (res.ok) {
        setToastMsg({
          title: isRtl ? "دیدگاه شما با موفقیت ثبت شد!" : "Comment Submitted Successfully!",
          desc: isRtl
            ? "از ثبت نظر شما متشکریم. دیدگاه شما پس از بررسی و تایید مدیریت در سایت منتشر خواهد شد."
            : "Thank you! Your comment has been received and will be published after review.",
          type: "success",
        });
        setCommentForm({ name: "", email: "", content: "" });
      } else {
        const err = await res.json();
        setToastMsg({
          title: isRtl ? "خطا در ارسال دیدگاه" : "Submission Error",
          desc: err.error || (isRtl ? "متأسفانه مشکلی رخ داده است." : "Something went wrong."),
          type: "error",
        });
      }
    } catch {
      setToastMsg({
        title: isRtl ? "خطای ارتباط با سرور" : "Server Connection Error",
        desc: isRtl ? "لطفاً اتصال اینترنت خود را بررسی و دوباره تلاش کنید." : "Please check your internet connection.",
        type: "error",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const jsonLdArticle = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": isRtl ? (article.metaTitleFa || article.titleFa) : (article.metaTitleEn || article.titleEn),
        "description": isRtl ? (article.metaDescFa || article.excerptFa) : (article.metaDescEn || article.excerptEn),
        "image": [article.ogImage || article.imageUrl],
        "datePublished": article.createdAt,
        "dateModified": article.createdAt,
        "author": [
          {
            "@type": "Person",
            "name": article.author || "آن‌ساپ",
            "url": "https://onsupp.ir",
          },
        ],
        "publisher": {
          "@type": "Organization",
          "name": "OnSupp Digital Marketing Agency",
          "logo": {
            "@type": "ImageObject",
            "url": "https://onsupp.ir/logo.png",
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": article.canonicalUrl || `https://onsupp.ir/blog/${article.slug}`,
        },
      }
    : null;

  // Schema.org FAQPage Structured Data (only rendered when FAQs exist)
  const jsonLdFaq =
    article?.faqs && article.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": article.faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer,
            },
          })),
        }
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      {/* Dynamic JSON-LD Structured Data for Google Search */}
      {jsonLdArticle && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLdArticle) }}
        />
      )}
      {jsonLdFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLdFaq) }}
        />
      )}

      <Header />
      <main className="flex-1 w-full pt-[72px] sm:pt-[90px] pb-16 space-y-6 sm:space-y-10 px-[10px]" dir={isRtl ? "rtl" : "ltr"}>

        {loading ? (
          <div className="w-full rounded-xl border border-foreground/10 bg-panel px-6 py-24 text-center text-foreground/50 shadow-md">
            {isRtl ? "در حال دریافت مقاله..." : "Loading article..."}
          </div>
        ) : !article ? (
          <div className="w-full rounded-xl border border-foreground/10 bg-panel px-6 py-24 text-center space-y-6 shadow-md">
            <h1 className="text-2xl font-bold text-foreground">
              {isRtl ? "مقاله مورد نظر پیدا نشد!" : "Article Not Found"}
            </h1>
            <a href="/blog" className="inline-block px-6 py-3 rounded-xl bg-leaf text-ink font-bold text-xs">
              {isRtl ? "بازگشت به لیست مقالات" : "Back to Blog Archive"}
            </a>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Box 1: Single Box Hero with Article Image + Dark Gradient Overlay */}
            <div className="w-full rounded-lg sm:rounded-xl border border-foreground/15 bg-background px-4 py-8 sm:px-12 sm:py-14 space-y-6 sm:space-y-8 shadow-md relative overflow-hidden mt-[10px] min-h-[300px] sm:min-h-[380px] flex flex-col justify-end">
              {/* Background Article Image with Dark Gradient Overlay covering full card */}
              <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <img
                  src={article.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
                  alt={displayTitle || "Article Cover"}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-[#081210] via-[#081210]/85 to-[#081210]/60 backdrop-blur-[1px]" />
              </div>

              {/* Inner 1600px max-width container */}
              <div className="w-full max-w-[1600px] mx-auto space-y-6 relative z-10">
                {/* Navigation Back Link */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href="/blog"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-white/20 text-xs font-bold text-mint hover:scale-105 hover:text-ink hover:border-mint transition-all shadow-md"
                  >
                    <svg className={`w-4 h-4 transform ${isRtl ? "rotate-0" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{isRtl ? "بازگشت به لیست همه مقالات" : "Back to All Articles"}</span>
                  </a>

                  {article.relatedTranslation && (
                    <a
                      href={`/blog/${article.relatedTranslation.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/30 backdrop-blur-md border border-blue-400/50 text-xs font-bold text-blue-200 hover:text-white hover:bg-blue-600/50 transition-all shadow-md hover:scale-105"
                      title={isArticleEn ? "Read the Persian version" : "مطالعه نسخه انگلیسی"}
                    >
                      <span>🌐</span>
                      <span>
                        {isArticleEn
                          ? "Read the Persian version"
                          : "مطالعه نسخه انگلیسی"}
                      </span>
                      <svg className={`w-3.5 h-3.5 transform ${isRtl ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  )}
                </div>

                {/* Meta Badges, Title & Short Excerpt */}
                <div className="space-y-4 max-w-5xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-0.5 rounded-lg text-xs font-bold border bg-mint/10 text-mint border-mint/30">
                      {isArticleEn ? "🇬🇧 English" : "🇮🇷 فارسی"}
                    </span>
                    <a
                      href={`/blog?category=${encodeURIComponent(displayCategory)}`}
                      className="px-3.5 py-1 rounded-xl bg-mint/20 text-mint text-xs font-bold border border-mint/40 shadow-lg hover:scale-105 hover:text-ink transition-all"
                    >
                      {displayCategory}
                    </a>
                    <span className="text-xs text-white/60">•</span>
                    <span className="text-xs text-white/70">
                      {isRtl ? (displayReadTime || "").replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]) : displayReadTime}
                    </span>
                    <span className="text-xs text-white/60">•</span>
                    <span className="text-xs text-white/70">
                      {new Date(article.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight drop-shadow-lg">
                    {displayTitle}
                  </h1>

                  {displayExcerpt && (
                    <p className="text-base sm:text-lg text-white/85 leading-8 border-r-4 border-mint pr-4 py-1 italic font-medium max-w-4xl">
                      {displayExcerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Box 2: Detailed Article Content & TOC Box with max-w-[1600px] Inner Width */}
            <div className="w-full rounded-lg sm:rounded-xl border border-foreground/10 bg-panel px-4 py-10 sm:px-12 lg:px-16 shadow-md relative overflow-hidden">
              <div className="w-full max-w-[1600px] mx-auto space-y-10 relative z-10">
                {/* Premium Accordion Table of Contents (فهرست مطالب) */}
                <div className="rounded-xl border border-foreground/15 bg-raised/90 overflow-hidden shadow-md ">
                  <button
                    type="button"
                    onClick={() => setShowToc((prev) => !prev)}
                    className="w-full px-6 py-4 sm:px-8 flex items-center justify-between text-start font-bold text-sm text-foreground hover:text-mint transition-colors cursor-pointer"
                  >
                    <span className="text-base font-black tracking-wide">
                      {isRtl ? "فهرست مطالب مقاله" : "Table of Contents"}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground/50 font-normal">
                        {showToc ? (isRtl ? "بستن فهرست" : "Hide") : (isRtl ? "مشاهده فهرست" : "Show")}
                      </span>
                      <svg
                        className={`w-4 h-4 transform transition-transform duration-300 ${
                          showToc ? "rotate-180 text-mint" : "rotate-0 text-foreground/50"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      showToc ? "max-h-[500px] opacity-100 border-t border-foreground/10 px-6 py-6 sm:px-8" : "max-h-0 opacity-0 px-6 py-0"
                    }`}
                  >
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <li className="flex items-center gap-2.5 text-foreground/80 hover:text-mint transition-colors font-medium p-2 rounded-xl hover:bg-white/5">
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        <a
                          href="#intro"
                          onClick={(e) => {
                            if (scrollToSection("intro")) e.preventDefault();
                          }}
                          className="truncate"
                        >
                          {isRtl ? "۱. مقدمه و اهمیت موضوع" : "1. Introduction"}
                        </a>
                      </li>
                      <li className="flex items-center gap-2.5 text-foreground/80 hover:text-mint transition-colors font-medium p-2 rounded-xl hover:bg-white/5">
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        <a
                          href="#section-1"
                          onClick={(e) => {
                            if (scrollToSection("section-1") || scrollToSection("intro")) e.preventDefault();
                          }}
                          className="truncate"
                        >
                          {isRtl ? "۲. تحلیل تغییرات و استراتژی‌های کلیدی" : "2. Key Strategy Analysis"}
                        </a>
                      </li>
                      <li className="flex items-center gap-2.5 text-foreground/80 hover:text-mint transition-colors font-medium p-2 rounded-xl hover:bg-white/5">
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        <a
                          href="#section-2"
                          onClick={(e) => {
                            if (scrollToSection("section-2") || scrollToSection("intro")) e.preventDefault();
                          }}
                          className="truncate"
                        >
                          {isRtl ? "۳. نکات کاربردی در پیاده‌سازی عملی" : "3. Practical Implementation Tips"}
                        </a>
                      </li>
                      <li className="flex items-center gap-2.5 text-foreground/80 hover:text-mint transition-colors font-medium p-2 rounded-xl hover:bg-white/5">
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        <a
                          href="#conclusion"
                          onClick={(e) => {
                            if (scrollToSection("conclusion") || scrollToSection("intro")) e.preventDefault();
                          }}
                          className="truncate"
                        >
                          {isRtl ? "۴. جمع‌بندی و نتیجه‌گیری نهایی" : "4. Final Conclusion"}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Detailed Article Body rendered as HTML with refined font size */}
                <div
                  id="intro"
                  className="prose prose-invert max-w-none text-foreground/90 text-sm sm:text-base lg:text-lg leading-8 sm:leading-9 py-2 jodit-content"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeArticleHtml(displayContent),
                  }}
                />

                {/* Interactive FAQ Section for the article */}
                {article.faqs && article.faqs.length > 0 && (
                  <div className="pt-8 border-t border-foreground/10 space-y-6">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                        <span>❓</span>
                        <span>{isRtl ? "پرسش‌های متداول" : "FAQ"}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground">
                        {isRtl ? "پرسش و پاسخ‌های متداول این مقاله" : "Frequently Asked Questions"}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {isRtl
                          ? "پاسخ به سوالات پرتکرار و نکات کلیدی پیرامون این موضوع"
                          : "Key answers and common questions regarding this topic"}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {article.faqs.map((faq, idx) => {
                        const isOpen = openFaqIndex === idx;
                        return (
                          <div
                            key={faq.id || idx}
                            className="rounded-xl border border-foreground/15 bg-raised/70 overflow-hidden transition-all shadow-sm"
                          >
                            <button
                              type="button"
                              aria-expanded={isOpen}
                              aria-controls={`faq-answer-${idx}`}
                              onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                              className="faq-accordion-btn w-full p-4 sm:p-5 flex items-center justify-between text-start gap-4 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-sm sm:text-base text-foreground flex items-center gap-2.5">
                                <span className="h-2 w-2 rounded-full bg-mint shrink-0" />
                                <span>{faq.question}</span>
                              </span>
                              <div className="w-7 h-7 rounded-lg bg-background border border-foreground/15 flex items-center justify-center text-foreground/70 shrink-0">
                                <svg
                                  className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-mint" : "rotate-0"}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>

                            {isOpen && (
                              <div
                                id={`faq-answer-${idx}`}
                                role="region"
                                className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-foreground/80 leading-7 border-t border-foreground/10 bg-background/30 whitespace-pre-line"
                              >
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Standalone Box 1: Dedicated Author Profile Card */}
                <div className="p-6 sm:p-8 rounded-xl bg-raised/60 border border-foreground/15 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-5 shadow-md ">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-start">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-mint/30 to-leaf/20 border border-mint/40 text-mint font-black flex items-center justify-center text-xl shadow-lg shrink-0">
                      {article.author ? article.author.charAt(0) : "آ"}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-foreground">
                        {article.author || (isRtl ? "تیم تحریریه آن‌ساپ" : "OnSupp Editorial Team")}
                      </h4>
                      <p className="text-xs text-foreground/70 leading-6 max-w-xl">
                        {isRtl
                          ? "متخصص حوزه دیجیتال مارکتینگ، تحلیل‌گر استراتژی‌های سئو و خودکارسازی فرآیندهای کسب‌وکار در آژانس آن‌ساپ."
                          : "Digital Marketing Specialist, SEO Strategy Analyst, and Business Automation Expert at OnSupp Agency."}
                      </p>
                    </div>
                  </div>

                  {/* Standalone Action Button */}
                  <a
                    href={`/author/${encodeURIComponent(article.author || "آن‌ساپ")}`}
                    className="px-5 py-2.5 rounded-lg bg-mint/10 border border-mint/30 text-mint hover:scale-105 hover:text-ink font-bold text-xs transition-all shadow-md shrink-0 flex items-center gap-2"
                  >
                    <span>{isRtl ? "مشاهده همه مقالات این نویسنده" : "View All Articles by Author"}</span>
                    <svg className={`w-4 h-4 transform ${isRtl ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </div>

                {/* Standalone Box 2: Previous & Next Article Navigation Cards (با عنوان کامل مقاله) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Previous Article Box */}
                  <a
                    href="/blog"
                    className="p-5 rounded-xl bg-raised/40 border border-foreground/15 hover:border-mint/50 transition-all flex items-center gap-4 group shadow-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-background border border-foreground/15 flex items-center justify-center text-foreground/70 group-hover:text-mint group-hover:border-mint/40 shrink-0 transition-colors">
                      <svg className={`w-5 h-5 transform ${isRtl ? "rotate-0" : "rotate-180"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                    <div className="space-y-1 overflow-hidden text-start">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        {isRtl ? "مقاله قبلی" : "Previous Article"}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-mint transition-colors truncate">
                        {isRtl ? "راهکارهای نوین سئو در سال ۲۰۲۶" : "Modern SEO Strategies for 2026"}
                      </h5>
                    </div>
                  </a>

                  {/* Next Article Box */}
                  <a
                    href="/blog"
                    className="p-5 rounded-xl bg-raised/40 border border-foreground/15 hover:border-mint/50 transition-all flex items-center justify-between gap-4 group shadow-lg"
                  >
                    <div className="space-y-1 overflow-hidden text-start">
                      <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">
                        {isRtl ? "مقاله بعدی" : "Next Article"}
                      </span>
                      <h5 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-mint transition-colors truncate">
                        {isRtl ? "نقش هوش مصنوعی در تولید محتوا" : "AI Role in Content Creation"}
                      </h5>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-background border border-foreground/15 flex items-center justify-center text-foreground/70 group-hover:text-mint group-hover:border-mint/40 shrink-0 transition-colors">
                      <svg className={`w-5 h-5 transform ${isRtl ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </a>
                </div>

                {/* User Comments Section (بخش دیدگاه‌ها و نظرات کاربران) */}
                <div className="pt-10 border-t border-foreground/10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                      <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{isRtl ? "دیدگاه‌ها و نظرات کاربران" : "User Comments & Discussion"}</span>
                    </h3>
                    <span className="text-xs text-foreground/50 bg-raised px-3 py-1 rounded-full border border-foreground/10 font-bold">
                      {isRtl
                        ? `${String(comments.length).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)])} دیدگاه تاییدشده`
                        : `${comments.length} Approved Comments`}
                    </span>
                  </div>

                  {/* Comment Form */}
                  <form
                    onSubmit={handleCommentSubmit}
                    className="p-6 rounded-xl bg-raised/50 border border-foreground/10 space-y-5"
                  >
                    <h4 className="text-xs font-bold text-mint uppercase tracking-wider">
                      {isRtl ? "ثبت نظر جدید" : "Leave a Reply"}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={commentForm.name}
                        onChange={(e) => setCommentForm({ ...commentForm, name: e.target.value })}
                        placeholder={isRtl ? "نام و نام خانوادگی *" : "Your Name *"}
                        className="w-full bg-background border border-foreground/15 rounded-lg p-3.5 text-xs text-foreground focus:outline-none focus:border-mint"
                      />
                      <input
                        type="email"
                        required
                        value={commentForm.email}
                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                        placeholder={isRtl ? "آدرس ایمیل *" : "Your Email *"}
                        className="w-full bg-background border border-foreground/15 rounded-lg p-3.5 text-xs text-foreground focus:outline-none focus:border-mint"
                      />
                    </div>
                    <textarea
                      rows={4}
                      required
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      placeholder={isRtl ? "متن دیدگاه خود را بنویسید..." : "Write your comment here..."}
                      className="w-full bg-background border border-foreground/15 rounded-lg p-4 text-xs text-foreground focus:outline-none focus:border-mint"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingComment}
                        className="px-6 py-3 rounded-xl bg-leaf text-ink font-bold text-xs hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                      >
                        {submittingComment ? (isRtl ? "در حال ارسال..." : "Submitting...") : (isRtl ? "ارسال دیدگاه" : "Submit Comment")}
                      </button>
                    </div>
                  </form>

                  {/* Comment List */}
                  <div className="space-y-4 pt-4">
                    {comments.length === 0 ? (
                      <p className="text-xs text-foreground/50 text-center py-6 bg-raised/20 rounded-lg border border-foreground/5">
                        {isRtl ? "هنوز دیدگاهی برای این مقاله ثبت نشده است. اولین دیدگاه را شما ارسال کنید!" : "No approved comments yet. Be the first to share your thoughts!"}
                      </p>
                    ) : (
                      comments.map((item) => (
                        <div key={item.id} className="p-5 rounded-lg bg-raised/30 border border-foreground/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-mint/20 text-mint font-bold flex items-center justify-center text-xs border border-mint/30">
                                {item.name ? item.name.charAt(0) : "ک"}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-foreground">{item.name}</h5>
                                <span className="text-[10px] text-foreground/40">
                                  {new Date(item.createdAt).toLocaleDateString(isRtl ? "fa-IR" : "en-US")}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-foreground/80 leading-6">{item.content}</p>

                          {/* Admin Reply Box */}
                          {item.reply && (
                            <div className="p-4 rounded-xl bg-mint/10 border border-mint/20 space-y-1.5 mr-4 sm:mr-6">
                              <div className="flex items-center gap-2 text-xs font-bold text-mint">
                                <svg className="w-3.5 h-3.5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                <span>{isRtl ? "پاسخ تیم مدیریت آن‌ساپ:" : "Response from OnSupp Team:"}</span>
                              </div>
                              <p className="text-xs text-foreground/90 leading-6">{item.reply}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Custom Awwwards-Style OnSupp Toast Notification Modal */}
      {toastMsg && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 animate-fadeIn" dir={isRtl ? "rtl" : "ltr"}>
          <div className="w-full max-w-md rounded-xl bg-panel border border-foreground/10 p-6 sm:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-mint via-leaf to-emerald-400" />
            
            <div className="w-16 h-16 rounded-full bg-mint/15 border border-mint/30 text-mint mx-auto flex items-center justify-center shadow-lg">
              {toastMsg.type === "success" ? (
                <svg className="w-8 h-8 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-foreground">{toastMsg.title}</h3>
              <p className="text-xs text-foreground/75 leading-6">{toastMsg.desc}</p>
            </div>

            <button
              onClick={() => setToastMsg(null)}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-mint to-leaf text-ink font-extrabold text-xs shadow-lg hover:scale-[1.02] transition-transform"
            >
              {isRtl ? "متوجه شدم" : "Got it"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
