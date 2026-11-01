"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { SERVICES_MENU_ITEMS, type ServiceCategory } from "@/config/services";

// Helper icon component for category icons
function CategoryIcon({ type }: { type: ServiceCategory["iconType"] }) {
  switch (type) {
    case "social":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "studio":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "motion":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "web":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
    case "seo":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "crm":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "software":
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    default:
      return null;
  }
}

function ServicesContent() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  // State to hold currently selected category ("all" or a specific service id)
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (initialCategory && SERVICES_MENU_ITEMS.some((s) => s.id === initialCategory)) {
      setSelectedCategory(initialCategory);
    } else {
      setSelectedCategory("all");
    }
  }, [initialCategory]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Update URL query parameter without full page reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (categoryId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", categoryId);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Filter items based on selection
  const displayedServices =
    selectedCategory === "all"
      ? SERVICES_MENU_ITEMS
      : SERVICES_MENU_ITEMS.filter((s) => s.id === selectedCategory);

  const persianNumbers = ["۰۱", "۰۲", "۰۳", "۰۴", "۰۵", "۰۶", "۰۷"];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main className="flex-1 w-full pt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-foreground/60 mb-6 font-medium">
            <Link href="/" className="hover:text-mint transition-colors">
              {isRtl ? "صفحه اصلی" : "Home"}
            </Link>
            <span>/</span>
            <span className="text-white">
              {isRtl ? "خدمات تخصصی" : "Services"}
            </span>
          </nav>

          {/* Page Header */}
          <header className="mb-10 sm:mb-14 border-b border-white/10 pb-8 sm:pb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime font-bold text-xs mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-lime" />
              <span>{isRtl ? "دپارتمان‌های تخصصی OnSupp" : "OnSupp Core Departments"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              {isRtl ? "خدمات و راهکارهای تخصصی OnSupp" : "OnSupp Specialized Services"}
            </h1>

            <p className="text-base sm:text-lg text-foreground/70 max-w-3xl leading-relaxed">
              {isRtl
                ? "ساختار شفاف خدمات و زیرخدمات تخصصی برای هدایت و رشد پایدار برندها در فضای دیجیتال. با انتخاب هر خدمت، زیرخدمات مرتبط با آن را مشاهده کنید."
                : "A structured overview of our core departments and specialized sub-services. Select any category to explore its dedicated capabilities."}
            </p>
          </header>

          {/* Interactive Category Selector Tabs */}
          <section className="mb-10" aria-label={isRtl ? "انتخاب دسته‌بندی خدمت" : "Service Category Filter"}>
            <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-3">
              {isRtl ? "فیلتر و مشاهده خدمات بر اساس دپارتمان:" : "Filter by department:"}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* All Services Tab */}
              <button
                type="button"
                onClick={() => handleSelectCategory("all")}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                  selectedCategory === "all"
                    ? "bg-lime text-ink border-lime shadow-md"
                    : "bg-panel border-white/10 text-white/80 hover:border-white/25 hover:text-white"
                }`}
              >
                {isRtl ? "همه خدمات (۷ دپارتمان)" : "All Services (7 Departments)"}
              </button>

              {/* Individual Category Tabs */}
              {SERVICES_MENU_ITEMS.map((service) => {
                const isSelected = selectedCategory === service.id;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleSelectCategory(service.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                      isSelected
                        ? "bg-lime text-ink border-lime shadow-md"
                        : "bg-panel border-white/10 text-white/80 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    <span className={isSelected ? "text-ink" : "text-lime"}>
                      <CategoryIcon type={service.iconType} />
                    </span>
                    <span>{isRtl ? service.titleFa : service.titleEn}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Services & Sub-Services Structure Display */}
          <section className="space-y-6 sm:space-y-8" aria-label={isRtl ? "فهرست زیرخدمات" : "Sub-Services List"}>
            {displayedServices.map((service, index) => {
              const originalIndex = SERVICES_MENU_ITEMS.findIndex((s) => s.id === service.id);
              const numberStr = isRtl ? persianNumbers[originalIndex] || `۰${originalIndex + 1}` : `0${originalIndex + 1}`;
              const subservices = isRtl ? service.subservicesFa : service.subservicesEn;

              return (
                <article
                  key={service.id}
                  id={service.id}
                  className="rounded-2xl border border-white/10 bg-panel/80 p-5 sm:p-7 transition-all hover:border-white/20"
                >
                  {/* Category Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <span className="font-mono text-sm font-bold text-mint/60 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 shrink-0">
                        {numberStr}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime/10 text-lime border border-lime/25 shrink-0">
                        <CategoryIcon type={service.iconType} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-mint px-2 py-0.5 rounded bg-white/5 border border-white/10">
                            {isRtl ? service.tagFa : service.tagEn}
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                          {isRtl ? service.titleFa : service.titleEn}
                        </h2>
                        <p className="text-xs sm:text-sm text-foreground/70 mt-1.5 max-w-2xl leading-relaxed">
                          {isRtl ? service.descriptionFa : service.descriptionEn}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-foreground/50 font-mono shrink-0">
                      {isRtl ? `${subservices.length} زیرخدمت فعال` : `${subservices.length} Active Sub-services`}
                    </div>
                  </div>

                  {/* Sub-services Structure Grid */}
                  <div className="mt-5">
                    <div className="text-xs font-semibold text-foreground/60 mb-3">
                      {isRtl ? "زیرخدمات و تخصص‌های مرتبط:" : "Related sub-services & capabilities:"}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                      {subservices.map((subserviceName, subIndex) => (
                        <div
                          key={subIndex}
                          className="flex items-start gap-3 rounded-xl bg-background/80 border border-white/5 p-4 transition-colors hover:border-lime/30"
                        >
                          <span className="flex h-5 w-5 rounded-full bg-lime/15 text-lime items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-white leading-snug">
                              {subserviceName}
                            </h3>
                            <span className="text-[11px] text-foreground/50 block mt-1">
                              {isRtl ? "زیرخدمت تخصصی دپارتمان" : "Specialized sub-service"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contextual Related Links */}
                  {service.relatedLinks && service.relatedLinks.length > 0 && (
                    <div className="mt-5 pt-3.5 border-t border-white/5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-foreground/50 font-medium">
                        {isRtl ? "مسیرهای مرتبط:" : "Related pathways:"}
                      </span>
                      {service.relatedLinks.map((link, lIdx) => (
                        <Link
                          key={lIdx}
                          href={link.href}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] text-xs font-semibold text-mint hover:text-white border border-white/5 transition-all"
                        >
                          <span>{isRtl ? link.titleFa : link.titleEn}</span>
                          <svg className={`w-3 h-3 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Action Link to Contact */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <span className="text-foreground/50">
                      {isRtl
                        ? "برای دریافت پروپوزال، هزینه و زمان‌بندی این خدمت با ما تماس بگیرید."
                        : "Contact us to receive a tailored proposal and timeline for this service."}
                    </span>

                    <Link
                      href="/#contact"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-lime hover:text-ink border border-white/10 font-bold text-white transition-all shrink-0"
                    >
                      <span>{isRtl ? "درخواست مشاوره برای این خدمت" : "Request Consultation"}</span>
                      <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>

          {/* Quick Help / Consultation Box */}
          <section className="mt-12 sm:mt-16 rounded-2xl border border-white/10 bg-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                {isRtl ? "نیاز به بررسی و انتخاب پکیج ترکیبی خدمات دارید؟" : "Need guidance choosing the right mix of services?"}
              </h2>
              <p className="text-sm text-foreground/70 max-w-2xl leading-relaxed">
                {isRtl
                  ? "کارشناسان ارشد آن‌ساپ آماده‌اند تا بر اساس نوع کسب‌وکار و اهداف رشد شما، مناسب‌ترین ترکیب خدمات را پیشنهاد دهند."
                  : "Our strategists can assist in defining the ideal service mix tailored to your business objectives."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/#contact"
                className="px-6 py-3 rounded-xl bg-lime text-ink text-sm font-bold hover:shadow-[0_0_20px_rgba(178,248,0,0.3)] transition-all"
              >
                {isRtl ? "درخواست مشاوره رایگان" : "Request Free Consultation"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ServicesContent />
    </Suspense>
  );
}
