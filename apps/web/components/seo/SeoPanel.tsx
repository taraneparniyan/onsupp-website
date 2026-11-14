"use client";

import { useMemo, useState } from "react";
import { analyzeSeo } from "@/lib/seo/analyzer";
import type {
  SeoCheckCategory,
  SeoConfig,
  SeoEntityType,
  SeoLang,
  SeoPanelValue,
} from "@/lib/seo/types";

export interface SeoPanelContentContext {
  title: string;
  excerpt?: string;
  contentHtml: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  siteName?: string;
  siteUrl?: string;
}

interface SeoPanelProps {
  entityType: SeoEntityType;
  activeLanguage: SeoLang;
  allowLanguageSwitch?: boolean;
  onLanguageChange?: (lang: SeoLang) => void;
  value: SeoPanelValue;
  onChange: (next: SeoPanelValue) => void;
  contentContext: SeoPanelContentContext;
}

type SeoTabId = "general" | "analysis" | "preview";

const CATEGORY_LABELS: Record<SeoCheckCategory, string> = {
  basic: "سئو پایه (Basic SEO)",
  additional: "سئو تکمیلی (Additional SEO)",
  title: "خوانایی عنوان (Title Readability)",
  readability: "خوانایی محتوا (Content Readability)",
};

export default function SeoPanel({
  entityType,
  activeLanguage,
  allowLanguageSwitch = false,
  onLanguageChange,
  value,
  onChange,
  contentContext,
}: SeoPanelProps) {
  const [activeTab, setActiveTab] = useState<SeoTabId>("general");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [categoryFilter, setCategoryFilter] = useState<"all" | SeoCheckCategory>("all");

  const isEn = activeLanguage === "en";
  const siteUrl = contentContext.siteUrl || "https://onsupp.ir";
  const routePrefix = entityType === "article" ? "/blog" : "/services";

  const analysis = useMemo(
    () =>
      analyzeSeo({
        entityType,
        language: activeLanguage,
        title: contentContext.title,
        metaTitle: value.metaTitle,
        metaDesc: value.metaDesc,
        slug: value.slug,
        focusKeyword: value.focusKeyword,
        secondaryKeywords: value.secondaryKeywords,
        contentHtml: contentContext.contentHtml,
        excerpt: contentContext.excerpt,
        coverImageUrl: contentContext.coverImageUrl,
        coverImageAlt: contentContext.coverImageAlt,
        siteName: contentContext.siteName,
        siteUrl,
      }),
    [entityType, activeLanguage, contentContext, value, siteUrl]
  );

  const scoreTone =
    analysis.grade === "good"
      ? {
          badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/35",
          bar: "bg-emerald-500",
          label: "عالی (سبز)",
        }
      : analysis.grade === "ok"
      ? {
          badge: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35",
          bar: "bg-amber-500",
          label: "نیازمند بهبود (زرد)",
        }
      : {
          badge: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/35",
          bar: "bg-rose-500",
          label: "نیازمند اصلاح (قرمز)",
        };

  const updateRobots = (patch: Partial<SeoConfig["robots"]>) => {
    onChange({
      ...value,
      seoConfig: {
        ...value.seoConfig,
        robots: {
          ...value.seoConfig.robots,
          ...patch,
        },
      },
    });
  };

  const addSecondaryKeyword = (raw: string) => {
    const items = raw
      .split(/[،,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return;
    const merged = Array.from(new Set([...value.secondaryKeywords, ...items])).slice(0, 20);
    onChange({ ...value, secondaryKeywords: merged });
    setSecondaryInput("");
  };

  const removeSecondaryKeyword = (kw: string) => {
    onChange({
      ...value,
      secondaryKeywords: value.secondaryKeywords.filter((item) => item !== kw),
    });
  };

  const insertVariableIntoTitle = (token: string) => {
    const base = value.metaTitle.trim();
    const next = base ? `${base} ${token}` : token;
    onChange({ ...value, metaTitle: next });
  };

  const filteredChecks =
    categoryFilter === "all"
      ? analysis.checks
      : analysis.checks.filter((c) => c.category === categoryFilter);

  const previewUrl = `${siteUrl.replace(/\/$/, "")}${routePrefix}/${value.slug || "your-slug"}`;

  return (
    <div
      data-testid="seo-panel"
      dir="rtl"
      className="rounded-2xl border border-border bg-panel overflow-hidden shadow-xs"
    >
      {/* Header with Dynamic Score & Language Switcher */}
      <div className="p-4 sm:p-5 bg-raised/70 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-mint font-black text-sm">
            SEO
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
              <span>پنل مدیریت و تحلیل سئو آن‌ساپ</span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-raised border border-border text-muted">
                {entityType === "article" ? "مقاله" : "خدمت"}
              </span>
            </h3>
            <p className="text-xs text-muted mt-0.5">
              تحلیل پویا، پیش‌نمایش گوگل و مدیریت متادیتا ({isEn ? "English" : "فارسی"})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {allowLanguageSwitch && onLanguageChange && (
            <div
              data-testid="seo-lang-switcher"
              className="inline-flex rounded-xl bg-panel border border-border p-1"
            >
              <button
                type="button"
                data-testid="seo-lang-fa"
                onClick={() => onLanguageChange("fa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeLanguage === "fa"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                سئو فارسی (FA)
              </button>
              <button
                type="button"
                data-testid="seo-lang-en"
                onClick={() => onLanguageChange("en")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeLanguage === "en"
                    ? "bg-primary text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                English SEO (EN)
              </button>
            </div>
          )}

          <div
            data-testid="seo-score-badge"
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-bold ${scoreTone.badge}`}
          >
            <span className="text-base font-black tabular-nums" data-testid="seo-score-value">
              {analysis.score}
            </span>
            <span className="opacity-75">/ 100</span>
            <span className="hidden sm:inline border-r border-current/25 pr-2">
              {scoreTone.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-border bg-raised/30 overflow-x-auto">
        {(
          [
            { id: "general", label: "عمومی (General)" },
            {
              id: "analysis",
              label: `تحلیل محتوا (${analysis.counts.pass}✓ / ${analysis.counts.warn}! / ${analysis.counts.fail}✕)`,
            },
            { id: "preview", label: "پیش‌نمایش گوگل (Search Preview)" },
          ] as Array<{ id: SeoTabId; label: string }>
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`seo-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-t-xl border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-mint bg-panel"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="space-y-5">
            {/* Focus Keyword & Pillar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  کلمه کلیدی کانونی (Focus Keyword)
                </label>
                <input
                  type="text"
                  data-testid="seo-focus-keyword-input"
                  dir={isEn ? "ltr" : "rtl"}
                  value={value.focusKeyword}
                  onChange={(e) => onChange({ ...value, focusKeyword: e.target.value })}
                  placeholder={
                    isEn
                      ? "e.g. enterprise technical seo services"
                      : "مثال: طراحی سایت شرکتی و سئو تکنیکال"
                  }
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-end">
                <label className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-raised border border-border cursor-pointer hover:border-primary/40">
                  <div>
                    <div className="text-xs font-bold text-foreground">محتوای مرجع (Pillar)</div>
                    <div className="text-[11px] text-muted">صفحه هدف اصلی برای لینک‌سازی داخلی</div>
                  </div>
                  <input
                    type="checkbox"
                    data-testid="seo-is-pillar-checkbox"
                    checked={value.isPillar}
                    onChange={(e) => onChange({ ...value, isPillar: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                </label>
              </div>
            </div>

            {/* Secondary Keywords */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                کلمات کلیدی فرعی (Secondary Keywords)
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-raised border border-border">
                {value.secondaryKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/15 text-mint border border-primary/30 text-xs font-medium"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => removeSecondaryKeyword(kw)}
                      className="hover:text-rose-400 cursor-pointer"
                      aria-label={`حذف ${kw}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  data-testid="seo-secondary-keyword-input"
                  dir={isEn ? "ltr" : "rtl"}
                  value={secondaryInput}
                  onChange={(e) => setSecondaryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSecondaryKeyword(secondaryInput);
                    }
                  }}
                  onBlur={() => {
                    if (secondaryInput.trim()) addSecondaryKeyword(secondaryInput);
                  }}
                  placeholder={
                    isEn
                      ? "Type keyword and press Enter..."
                      : "کلمه فرعی را بنویسید و Enter یا ویرگول بزنید..."
                  }
                  className="flex-1 min-w-[180px] bg-transparent text-xs text-foreground focus:outline-none px-1 py-1"
                />
              </div>
            </div>

            {/* SEO Title with Dynamic Variable Chips */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="text-xs font-semibold text-foreground">
                  عنوان سئو (SEO Title)
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="text-muted">متغیرها:</span>
                  {["%title%", "%sep%", "%sitename%", "%date%"].map((tok) => (
                    <button
                      key={tok}
                      type="button"
                      onClick={() => insertVariableIntoTitle(tok)}
                      className="px-2 py-0.5 rounded bg-raised border border-border text-mint hover:border-primary font-mono cursor-pointer"
                    >
                      {tok}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                data-testid="seo-meta-title-input"
                dir={isEn ? "ltr" : "rtl"}
                value={value.metaTitle}
                onChange={(e) => onChange({ ...value, metaTitle: e.target.value })}
                placeholder={
                  isEn
                    ? "%title% %sep% %sitename%"
                    : "عنوان ۵۰ تا ۶۰ کاراکتری سئو یا استفاده از %title% %sep% %sitename%"
                }
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
                <span>
                  طول: {analysis.metrics.titleLength} / 60 کاراکتر (~{analysis.metrics.titlePixelWidth}px / 580px)
                </span>
                <div className="w-36 h-1.5 rounded-full bg-raised overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      analysis.metrics.titlePixelWidth > 600
                        ? "bg-rose-500"
                        : analysis.metrics.titleLength >= 30
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((analysis.metrics.titlePixelWidth / 600) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Meta Description */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                توضیحات متا (Meta Description)
              </label>
              <textarea
                rows={3}
                data-testid="seo-meta-desc-input"
                dir={isEn ? "ltr" : "rtl"}
                value={value.metaDesc}
                onChange={(e) => onChange({ ...value, metaDesc: e.target.value })}
                placeholder={
                  isEn
                    ? "120-160 characters compelling description..."
                    : "توضیحات ۱۲۰ تا ۱۶۰ کاراکتری جذاب و حاوی کلمه کلیدی..."
                }
                className="w-full bg-raised border border-border rounded-xl p-3.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              />
              <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted">
                <span>
                  طول: {analysis.metrics.descLength} / 160 کاراکتر (~{analysis.metrics.descPixelWidth}px / 920px)
                </span>
                <div className="w-36 h-1.5 rounded-full bg-raised overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      analysis.metrics.descPixelWidth > 940
                        ? "bg-rose-500"
                        : analysis.metrics.descLength >= 110
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((analysis.metrics.descPixelWidth / 940) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Slug & Canonical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  نامک / نشانی صفحه (Slug)
                </label>
                <input
                  type="text"
                  data-testid="seo-slug-input"
                  dir="ltr"
                  value={value.slug}
                  onChange={(e) => onChange({ ...value, slug: e.target.value })}
                  placeholder="technical-seo-guide"
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  آدرس کانونیکال (Canonical URL)
                </label>
                <input
                  type="text"
                  data-testid="seo-canonical-input"
                  dir="ltr"
                  value={value.canonicalUrl}
                  onChange={(e) => onChange({ ...value, canonicalUrl: e.target.value })}
                  placeholder={previewUrl}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Robots Meta */}
            <div className="p-4 rounded-xl bg-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-foreground">تنظیمات ربات‌های جست‌وجو (Robots Meta)</div>
                <div className="text-[11px] text-muted mt-0.5">
                  کنترل ایندکس صفحه و دنبال کردن لینک‌ها توسط موتورهای جست‌وجو
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="seo-robots-index"
                    checked={value.seoConfig.robots.index}
                    onChange={(e) => updateRobots({ index: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>{value.seoConfig.robots.index ? "Index (نمایش در گوگل)" : "Noindex (عدم ایندکس)"}</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    data-testid="seo-robots-follow"
                    checked={value.seoConfig.robots.follow}
                    onChange={(e) => updateRobots({ follow: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <span>{value.seoConfig.robots.follow ? "Follow" : "Nofollow"}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEO ANALYSIS */}
        {activeTab === "analysis" && (
          <div className="space-y-5">
            {/* Score Overview + Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-raised border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">امتیاز بهینه‌سازی داخلی</span>
                  <span className="text-lg font-black text-foreground tabular-nums">
                    {analysis.score}/100
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-panel overflow-hidden">
                  <div
                    className={`h-full transition-all ${scoreTone.bar}`}
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted leading-relaxed">
                  این امتیاز یک شاخص کیفیت بهینه‌سازی داخلی است و تضمینی برای رتبه گوگل محسوب نمی‌شود.
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-raised border border-border">
                  <div className="text-[11px] text-muted">تعداد کلمات</div>
                  <div className="text-base font-black text-foreground mt-1 tabular-nums">
                    {analysis.metrics.wordCount}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    ~{analysis.metrics.readingTimeMinutes} دقیقه مطالعه
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-raised border border-border">
                  <div className="text-[11px] text-muted">تراکم کلمه کلیدی</div>
                  <div className="text-base font-black text-foreground mt-1 tabular-nums">
                    {analysis.metrics.keywordDensity}%
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {analysis.metrics.keywordCount} بار تکرار
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-raised border border-border">
                  <div className="text-[11px] text-muted">لینک داخلی / خارجی</div>
                  <div className="text-base font-black text-foreground mt-1 tabular-nums">
                    {analysis.metrics.internalLinkCount} / {analysis.metrics.externalLinkCount}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    تصاویر: {analysis.metrics.imageCount} (بدون ALT: {analysis.metrics.missingAltCount})
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-raised border border-border">
                  <div className="text-[11px] text-muted">ساختار تیترها</div>
                  <div className="text-base font-black text-foreground mt-1 tabular-nums">
                    H2: {analysis.metrics.h2Count} | H3: {analysis.metrics.h3Count}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    میانگین جمله: {analysis.metrics.avgSentenceWords} کلمه
                  </div>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: "all", label: `همه (${analysis.checks.length})` },
                  { id: "basic", label: CATEGORY_LABELS.basic },
                  { id: "additional", label: CATEGORY_LABELS.additional },
                  { id: "title", label: CATEGORY_LABELS.title },
                  { id: "readability", label: CATEGORY_LABELS.readability },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    categoryFilter === cat.id
                      ? "bg-primary text-white border-primary"
                      : "bg-raised text-muted border-border hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Checks List */}
            <div className="space-y-2.5" data-testid="seo-checks-list">
              {filteredChecks.map((check) => {
                const statusBadge =
                  check.status === "pass"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/35"
                    : check.status === "warn"
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/35"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/35";
                const statusIcon =
                  check.status === "pass" ? "✓" : check.status === "warn" ? "!" : "✕";

                return (
                  <div
                    key={check.id}
                    data-testid={`seo-check-${check.id}`}
                    data-status={check.status}
                    className="p-3.5 rounded-xl bg-raised/70 border border-border flex items-start gap-3"
                  >
                    <span
                      className={`w-6 h-6 shrink-0 rounded-full border flex items-center justify-center text-xs font-black mt-0.5 ${statusBadge}`}
                    >
                      {statusIcon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground">
                          {check.title}
                        </span>
                        <span className="text-[11px] font-mono text-muted">
                          {check.points}/{check.maxPoints}
                        </span>
                      </div>
                      <p className="text-xs text-muted mt-1">
                        <strong className="text-foreground/85">علت:</strong> {check.reason}
                      </p>
                      <p className="text-xs text-mint mt-1">
                        <strong>راهکار:</strong> {check.suggestion}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SEARCH PREVIEW */}
        {activeTab === "preview" && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">
                  پیش‌نمایش زنده نتایج گوگل (Google SERP Snippet)
                </h4>
                <p className="text-xs text-muted mt-0.5">
                  نمایش تقریبی عنوان، نشانی و توضیحات در نتایج جست‌وجوی دسکتاپ و موبایل
                </p>
              </div>
              <div className="inline-flex rounded-xl bg-raised border border-border p-1">
                <button
                  type="button"
                  data-testid="seo-preview-desktop-btn"
                  onClick={() => setPreviewDevice("desktop")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    previewDevice === "desktop"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  دسکتاپ (Desktop)
                </button>
                <button
                  type="button"
                  data-testid="seo-preview-mobile-btn"
                  onClick={() => setPreviewDevice("mobile")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    previewDevice === "mobile"
                      ? "bg-primary text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  موبایل (Mobile)
                </button>
              </div>
            </div>

            <div
              data-testid="seo-google-preview-card"
              dir={isEn ? "ltr" : "rtl"}
              className={`rounded-2xl border border-border bg-white text-slate-900 p-5 shadow-xs transition-all ${
                previewDevice === "mobile" ? "max-w-sm mx-auto" : "w-full"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[11px] font-black text-emerald-700">
                  O
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {contentContext.siteName || (isEn ? "OnSupp" : "آن‌ساپ")}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate" dir="ltr">
                    {previewUrl}
                  </div>
                </div>
              </div>

              <div
                data-testid="seo-preview-title"
                className="text-lg sm:text-xl font-medium text-[#1a0dab] hover:underline leading-snug line-clamp-2"
              >
                {analysis.resolvedTitle || (isEn ? "Page SEO Title..." : "عنوان سئو صفحه...")}
              </div>

              <div
                data-testid="seo-preview-description"
                className="text-xs sm:text-sm text-[#4d5156] mt-1.5 leading-relaxed line-clamp-3"
              >
                {analysis.resolvedDescription ||
                  (isEn
                    ? "Meta description preview will appear here..."
                    : "توضیحات متا برای نمایش زیر لینک در نتایج گوگل اینجا قرار می‌گیرد...")}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
