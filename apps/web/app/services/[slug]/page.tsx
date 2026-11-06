import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getServiceBySlug, getServices, type ServiceData } from "@/lib/publicApi";
import { DETAILED_SERVICES_DATA, type ServiceDetailItem } from "@/components/services/services-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbService = await getServiceBySlug(slug);
  const fallback = DETAILED_SERVICES_DATA.find((s) => s.id === slug);

  const titleFa = dbService?.title || fallback?.titleFa || "خدمات تخصصی آن‌ساپ";
  const titleEn = dbService?.titleEn || fallback?.titleEn || "OnSupp Core Services";
  const descFa =
    dbService?.headlineFa ||
    dbService?.subtitle ||
    fallback?.headlineFa ||
    fallback?.descriptionFa ||
    "خدمات تخصصی طراحی، توسعه نرم‌افزار، سئو و استودیو تولید رسانه در آن‌ساپ.";

  return {
    title: `${titleFa} | ${titleEn} — آن‌ساپ`,
    description: descFa,
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title: `${titleFa} | OnSupp`,
      description: descFa,
      url: `/services/${slug}`,
      type: "website",
      images: dbService?.coverImage || dbService?.imageUrl || fallback?.image ? [dbService?.coverImage || dbService?.imageUrl || fallback!.image] : undefined,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const dbService = await getServiceBySlug(slug);
  const fallback = DETAILED_SERVICES_DATA.find((s) => s.id === slug);

  if (!dbService && !fallback) {
    notFound();
  }

  const titleFa = dbService?.title || fallback?.titleFa || "";
  const titleEn = dbService?.titleEn || fallback?.titleEn || "";
  const subtitleFa = dbService?.subtitle || fallback?.descriptionFa || "";
  const subtitleEn = dbService?.subtitleEn || fallback?.descriptionEn || "";
  const headlineFa = dbService?.headlineFa || fallback?.headlineFa || "";
  const headlineEn = dbService?.headlineEn || fallback?.headlineEn || "";
  const narrativeFa = dbService?.detailedNarrativeFa || fallback?.detailedNarrativeFa || "";
  const narrativeEn = dbService?.detailedNarrativeEn || fallback?.detailedNarrativeEn || "";
  const bizTitleFa = dbService?.businessValueTitleFa || fallback?.businessValueTitleFa || "ارزش استراتژیک برای سازمان";
  const bizTitleEn = dbService?.businessValueTitleEn || fallback?.businessValueTitleEn || "Strategic ROI & Enterprise Impact";
  const bizValFa = dbService?.businessValueFa || fallback?.businessValueFa || "";
  const bizValEn = dbService?.businessValueEn || fallback?.businessValueEn || "";
  const heroImg = dbService?.coverImage || dbService?.imageUrl || fallback?.image || "/images/services/web-development.webp";
  const tagFa = dbService?.tagFa || fallback?.tagFa || "دپارتمان تخصصی";
  const tagEn = dbService?.tagEn || fallback?.tagEn || "Specialized Practice";
  const ctaLabelFa = dbService?.ctaLabelFa || fallback?.ctaLabelFa || "درخواست مشاوره این خدمت";
  const ctaLabelEn = dbService?.ctaLabelEn || fallback?.ctaLabelEn || "Request Consultation";

  // Subservices & capabilities
  const subservices =
    dbService?.subservices && dbService.subservices.length > 0
      ? dbService.subservices
      : (fallback?.subservices || []).map((s) => ({
          id: s.nameEn.toLowerCase().replace(/\s+/g, "-"),
          titleFa: s.nameFa,
          titleEn: s.nameEn,
          descriptionFa: s.descFa,
          descriptionEn: s.descEn,
          deliverablesFa: s.deliverablesFa,
          deliverablesEn: s.deliverablesEn,
        }));

  // KPI Metrics
  const metrics =
    dbService?.kpiMetrics && dbService.kpiMetrics.length > 0
      ? dbService.kpiMetrics
      : (fallback?.metrics || []).map((m) => ({
          valueFa: m.valueFa,
          valueEn: m.valueEn,
          labelFa: m.labelFa,
          labelEn: m.labelEn,
        }));

  return (
    <div className="flex min-h-screen flex-col w-full bg-background text-foreground selection:bg-mint/20">
      <Header />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 sm:pb-28" dir="rtl">
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-sm font-mono text-foreground/50 mb-8 sm:mb-10"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              خانه
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-foreground transition-colors">
              خدمات تخصصی
            </Link>
            <span>/</span>
            <span className="text-foreground/90 font-medium truncate max-w-[200px] sm:max-w-none">
              {titleFa}
            </span>
          </nav>

          {/* Hero Banner Header */}
          <section className="relative overflow-hidden rounded-3xl border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] p-6 sm:p-10 lg:p-14 mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#38534A]/10 text-[#38534A] dark:text-[#8AB3A0] dark:bg-[#8AB3A0]/10 border border-[#38534A]/20">
                  <span>{tagFa}</span>
                  <span className="opacity-40">•</span>
                  <span className="font-mono">{tagEn}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
                  {titleFa}
                </h1>

                {headlineFa && (
                  <p className="text-lg sm:text-xl font-medium text-foreground/90 leading-relaxed">
                    {headlineFa}
                  </p>
                )}

                <p className="text-sm sm:text-base text-foreground/70 leading-relaxed max-w-2xl">
                  {subtitleFa}
                </p>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <Link
                    href="/#contact"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#38534A] text-white font-bold text-sm hover:bg-[#2B4039] active:scale-95 transition-all shadow-md"
                  >
                    {ctaLabelFa}
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-black/15 dark:border-white/15 text-foreground font-medium text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                  >
                    مشاهده سایر دپارتمان‌ها
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={heroImg}
                  alt={titleFa}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </section>

          {/* Strategic Narrative & Business Value */}
          {(narrativeFa || bizValFa) && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 sm:mb-20">
              {narrativeFa && (
                <div className="lg:col-span-7 bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                    <span>روایت تخصصی و متدولوژی اجرا</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    اصول طراحی و مهندسی این خدمت
                  </h3>
                  <div className="text-sm sm:text-base text-foreground/80 leading-loose whitespace-pre-line font-light">
                    {narrativeFa}
                  </div>
                </div>
              )}

              {bizValFa && (
                <div className="lg:col-span-5 bg-gradient-to-br from-[#38534A]/10 via-[#38534A]/5 to-transparent border border-[#38534A]/20 rounded-2xl p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#38534A] dark:bg-[#8AB3A0]" />
                    <span>بازگشت سرمایه و شاخص رشد</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {bizTitleFa}
                  </h3>
                  <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-light">
                    {bizValFa}
                  </p>

                  {metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#38534A]/20">
                      {metrics.map((m, idx) => (
                        <div key={idx} className="bg-white/40 dark:bg-black/40 rounded-xl p-3 border border-black/5 dark:border-white/5">
                          <span className="block text-lg font-black text-[#38534A] dark:text-[#8AB3A0] font-mono">
                            {m.valueFa}
                          </span>
                          <span className="block text-xs text-foreground/70 font-light mt-0.5">
                            {m.labelFa}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Subservices & Deliverables */}
          {subservices.length > 0 && (
            <section className="mb-16 sm:mb-20">
              <div className="mb-8 sm:mb-12">
                <span className="text-xs font-bold text-[#38534A] dark:text-[#8AB3A0] uppercase tracking-wider block mb-2">
                  قابلیت‌ها و خروجی‌های تحویلی
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  زیرخدمات تخصصی و بسته‌های اجرایی
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subservices.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="group bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-2xl p-6 transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-[#38534A] dark:text-[#8AB3A0] font-bold">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-mono text-foreground/40">{sub.titleEn}</span>
                    </div>

                    <h4 className="text-lg font-bold text-foreground group-hover:text-[#38534A] dark:group-hover:text-[#8AB3A0] transition-colors">
                      {sub.titleFa}
                    </h4>

                    <p className="text-xs sm:text-sm text-foreground/70 leading-relaxed font-light">
                      {sub.descriptionFa}
                    </p>

                    {sub.deliverablesFa && sub.deliverablesFa.length > 0 && (
                      <div className="pt-3 border-t border-black/5 dark:border-white/5 space-y-1.5">
                        <span className="text-[11px] font-bold text-foreground/60 block">خروجی‌های مستقیم:</span>
                        <ul className="space-y-1">
                          {sub.deliverablesFa.map((d, dIdx) => (
                            <li key={dIdx} className="text-xs text-foreground/80 flex items-start gap-1.5">
                              <span className="text-[#38534A] dark:text-[#8AB3A0] mt-0.5">•</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom Consultation Call to Action */}
          <section className="bg-gradient-to-r from-[#38534A] to-[#2B4039] text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              آماده آغاز همکاری و تحول در {titleFa} هستید؟
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
              جلسه مشاوره استراتژیک اولیه رایگان با تیم تخصصی آن‌ساپ برای بررسی نیازها، بودجه‌بندی و تدوین نقشه راه توسعه برند شما.
            </p>
            <div className="pt-2">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-white text-[#17221E] font-extrabold text-sm hover:bg-[#F8F9FA] active:scale-95 transition-all shadow-xl"
              >
                {ctaLabelFa}
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
