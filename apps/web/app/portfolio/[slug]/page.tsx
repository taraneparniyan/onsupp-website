"use client";

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import {
  SHOWCASE_PROJECTS,
  getCaseStudyBySlug,
  type CaseStudyItem,
} from "@/lib/case-studies";
import DynamicAttributesShowcase from "@/components/portfolio/DynamicAttributesShowcase";
import { scrollToSection } from "@/lib/scroll";
import { BACKEND_URL } from "@/config/api";

export default function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [project, setProject] = useState<CaseStudyItem | null>(() => getCaseStudyBySlug(slug) || null);
  const [loading, setLoading] = useState(!project);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/v1/casestudies/${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((dbItem) => {
        if (dbItem && dbItem.slug) {
          const match = getCaseStudyBySlug(slug);
          setProject({
            id: dbItem.slug || `cs-${dbItem.id}`,
            slug: dbItem.slug,
            client: dbItem.client || match?.client || dbItem.titleFa,
            clientEn: dbItem.clientEn || match?.clientEn || dbItem.titleEn,
            titleFa: dbItem.titleFa,
            titleEn: dbItem.titleEn || dbItem.titleFa,
            taglineFa: dbItem.taglineFa || match?.taglineFa || "",
            taglineEn: dbItem.taglineEn || match?.taglineEn || "",
            categoryFa: dbItem.categoryFa || match?.categoryFa || "طراحی و توسعه وب",
            categoryEn: dbItem.categoryEn || match?.categoryEn || "Web Development",
            servicesFa: Array.isArray(dbItem.servicesFa) ? dbItem.servicesFa : match?.servicesFa || [],
            servicesEn: Array.isArray(dbItem.servicesEn) ? dbItem.servicesEn : match?.servicesEn || [],
            metricsFa: Array.isArray(dbItem.metricsFa) ? dbItem.metricsFa : match?.metricsFa || [],
            metricsEn: Array.isArray(dbItem.metricsEn) ? dbItem.metricsEn : match?.metricsEn || [],
            colorGradient: dbItem.colorGradient || match?.colorGradient || "from-[#1a1315] via-[#241a1e] to-[#100b0d]",
            accentColor: dbItem.accentColor || match?.accentColor || "#D4A5A8",
            glowColor: dbItem.glowColor || match?.glowColor || "rgba(212, 165, 168, 0.2)",
            previewType: (dbItem.previewType as any) || match?.previewType || "web",
            image: dbItem.imageUrl || match?.image || "/images/portfolio/dr-miresmaeli-clinic-hero.webp",
            secondaryImage: dbItem.secondaryImage || match?.secondaryImage,
            gallery: Array.isArray(dbItem.gallery) && dbItem.gallery.length > 0 ? dbItem.gallery : match?.gallery,
            projectType: dbItem.projectType || match?.projectType || "پروژه جامع",
            liveUrl: dbItem.liveUrl || match?.liveUrl || "",
            featured: dbItem.featured ?? match?.featured ?? true,
            position: dbItem.position ?? match?.position ?? 0,
            year: dbItem.year || match?.year || "۱۴۰۳",
            challengeFa: dbItem.challengeFa || match?.challengeFa,
            challengeEn: dbItem.challengeEn || match?.challengeEn,
            solutionFa: dbItem.solutionFa || match?.solutionFa,
            solutionEn: dbItem.solutionEn || match?.solutionEn,
            deliverablesFa: Array.isArray(dbItem.deliverablesFa) ? dbItem.deliverablesFa : match?.deliverablesFa || [],
            deliverablesEn: Array.isArray(dbItem.deliverablesEn) ? dbItem.deliverablesEn : match?.deliverablesEn || [],
            category: dbItem.category || match?.category || null,
            categoryId: dbItem.categoryId ?? match?.categoryId ?? null,
            attributeValues: Array.isArray(dbItem.attributeValues) ? dbItem.attributeValues : (match?.attributeValues || []),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const { lang } = useLanguage();
  const isRtl = lang === "fa";

  if (!project && !loading) {
    notFound();
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-mint border-t-transparent animate-spin" />
      </div>
    );
  }

  // Find next project for the bottom carousel link
  const currentIndex = SHOWCASE_PROJECTS.findIndex(
    (p) => p.slug === project.slug || p.id === project.id
  );
  const nextProject =
    SHOWCASE_PROJECTS[(currentIndex + 1) % SHOWCASE_PROJECTS.length];

  return (
    <div className="flex min-h-screen flex-col w-full bg-background text-foreground selection:bg-mint/20">
      <Header />

      <main className="flex-1 w-full pt-28 sm:pt-32 pb-20 sm:pb-28" dir={isRtl ? "rtl" : "ltr"}>
        <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
          {/* ── Breadcrumb & Back Navigation ── */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-xs sm:text-sm font-mono text-foreground/50 mb-8 sm:mb-10"
          >
            <Link href="/" className="hover:text-foreground transition-colors">
              {isRtl ? "خانه" : "Home"}
            </Link>
            <span>/</span>
            <Link href="/portfolio" className="hover:text-foreground transition-colors">
              {isRtl ? "نمونه‌کارها" : "Portfolio"}
            </Link>
            <span>/</span>
            <span className="text-foreground/90 font-medium truncate max-w-[200px] sm:max-w-none">
              {isRtl ? project.client : project.clientEn}
            </span>
          </nav>

          {/* ── Project Header ── */}
          <header className="mb-10 sm:mb-14">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="inline-flex items-center gap-3 text-xs sm:text-sm font-bold tracking-widest text-[#38534A] dark:text-[#8AB3A0] uppercase">
                <span className="h-px w-10 bg-[#38534A]/50 dark:bg-[#8AB3A0]/50" />
                <span>{isRtl ? project.categoryFa : project.categoryEn}</span>
              </div>
              {project.year && (
                <span className="text-xs font-mono text-foreground/50">
                  {project.year}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-5 leading-[1.2]">
              {isRtl ? project.titleFa : project.titleEn}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-3xl leading-relaxed">
              {isRtl ? project.taglineFa : project.taglineEn}
            </p>
          </header>

          {/* ── Primary Visual Showcase ── */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#161615] border border-foreground/10 shadow-2xl mb-14 sm:mb-20">
            <Image
              src={project.image || "/case_study_1.jpg"}
              alt={isRtl ? project.titleFa : project.titleEn}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1440px"
              className="object-cover object-top"
            />
          </div>

          {/* ── Dynamic Category Attributes & Metrics Showcase ── */}
          <DynamicAttributesShowcase
            attributeValues={project.attributeValues}
            category={project.category}
            isRtl={isRtl}
            fallbackMetrics={isRtl ? project.metricsFa : project.metricsEn}
          />

          {/* ── Detailed Narrative Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20 sm:mb-28">
            {/* Left/Main Column: Challenge & Solution */}
            <div className="lg:col-span-8 space-y-12">
              {project.challengeFa && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold tracking-widest text-[#D4A5A8] uppercase">
                    <span>{isRtl ? "۰۱ / چالش اولیه" : "01 / THE CHALLENGE"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {isRtl ? "مسئله و نیازمندی پروژه" : "Core Problem & Scope"}
                  </h2>
                  <p className="text-foreground/75 leading-relaxed sm:text-lg">
                    {isRtl ? project.challengeFa : project.challengeEn}
                  </p>
                </section>
              )}

              {project.solutionFa && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold tracking-widest text-[#D4A5A8] uppercase">
                    <span>{isRtl ? "۰۲ / راه‌حل و اجرای مهندسی" : "02 / THE SOLUTION"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {isRtl ? "رویکرد طراحی و پیاده‌سازی تیم آن‌ساپ" : "Strategic Execution & Delivery"}
                  </h2>
                  <p className="text-foreground/75 leading-relaxed sm:text-lg">
                    {isRtl ? project.solutionFa : project.solutionEn}
                  </p>
                </section>
              )}

              {(project.deliverablesFa || project.deliverablesEn) && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold tracking-widest text-[#D4A5A8] uppercase">
                    <span>{isRtl ? "۰۳ / خروجی‌ها" : "03 / DELIVERABLES"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                    {isRtl ? "دستاوردهای تحویل‌شده" : "Key Deliverables"}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {((isRtl ? project.deliverablesFa : project.deliverablesEn) || project.deliverablesFa || []).map((d, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-foreground/[0.02] border border-foreground/10 text-sm font-medium text-foreground/85"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#D4A5A8] shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Secondary / Full Web Interface Preview */}
              {project.secondaryImage && (
                <section className="pt-4">
                  <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold tracking-widest text-[#D4A5A8] uppercase">
                    <span>{isRtl ? "۰۴ / نمای کامل پرتال" : "04 / FULL INTERFACE ARCHITECTURE"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                    {isRtl ? "نمای کامل صفحات و ساختار بصری" : "Delivered Interface & Layout"}
                  </h2>
                  <div className="relative w-full max-h-[700px] overflow-y-auto rounded-2xl sm:rounded-3xl border border-foreground/15 shadow-2xl bg-[#161615]">
                    <Image
                      src={project.secondaryImage}
                      alt={isRtl ? `${project.titleFa} - نمای کامل` : `${project.titleEn} Fullpage`}
                      width={1200}
                      height={4000}
                      className="w-full h-auto object-cover object-top"
                    />
                  </div>
                </section>
              )}
            </div>

            {/* Right/Sidebar Column: Metadata card */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 p-6 sm:p-8 rounded-2xl bg-foreground/[0.03] border border-foreground/10 space-y-6">
                <div>
                  <span className="block text-xs font-mono text-foreground/50 uppercase mb-1">
                    {isRtl ? "کارفرما / برند" : "Client"}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {isRtl ? project.client : project.clientEn}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-mono text-foreground/50 uppercase mb-1">
                    {isRtl ? "دسته خدمات" : "Service Domain"}
                  </span>
                  <span className="text-base font-bold text-foreground">
                    {isRtl ? project.categoryFa : project.categoryEn}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-mono text-foreground/50 uppercase mb-2">
                    {isRtl ? "خدمات ارائه‌شده" : "Services Provided"}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(isRtl ? project.servicesFa : project.servicesEn).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-foreground/5 border border-foreground/10 text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-foreground/10">
                  <Link
                    href="/#contact"
                    onClick={(e) => {
                      if (scrollToSection("#contact")) e.preventDefault();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#9f2334] hover:bg-[#b0293b] text-white font-semibold text-sm transition-all shadow-md active:scale-95"
                  >
                    <span>{isRtl ? "مشاوره برای پروژه مشابه" : "Request a Proposal"}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── Next Project Teaser Card ── */}
          <div className="pt-10 border-t border-foreground/10">
            <Link
              href={`/portfolio/${nextProject.slug}`}
              className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 sm:p-10 rounded-3xl bg-foreground/[0.02] border border-foreground/10 hover:border-foreground/25 hover:bg-foreground/[0.04] transition-all"
            >
              <div>
                <span className="text-xs font-mono text-foreground/50 uppercase tracking-widest block mb-2">
                  {isRtl ? "پروژه بعدی" : "NEXT CASE STUDY"}
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground group-hover:text-[#D4A5A8] transition-colors">
                  {isRtl ? nextProject.titleFa : nextProject.titleEn}
                </h3>
                <p className="text-sm text-foreground/60 mt-1">
                  {isRtl ? nextProject.client : nextProject.clientEn}
                </p>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center gap-2 text-sm font-semibold text-foreground group-hover:text-[#D4A5A8] transition-colors">
                <span>{isRtl ? "مشاهده پروژه" : "View Project"}</span>
                <svg
                  className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                    isRtl ? "rotate-180 group-hover:-translate-x-1" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
