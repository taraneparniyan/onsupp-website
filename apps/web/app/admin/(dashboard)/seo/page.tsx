"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

interface GlobalSeoSettings {
  siteNameFa: string;
  siteNameEn: string;
  siteTitleFa: string;
  siteTitleEn: string;
  siteDescFa: string;
  siteDescEn: string;
  metaTitleTemplate: string;
  canonicalBaseUrl: string;
  defaultKeywordsFa: string;
  defaultKeywordsEn: string;
  ogImageUrl: string;
  faviconUrl: string;
}

const DEFAULT_SEO: GlobalSeoSettings = {
  siteNameFa: "آن‌ساپ",
  siteNameEn: "OnSupp",
  siteTitleFa: "آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ",
  siteTitleEn: "OnSupp | Digital Agency & Software Engineering",
  siteDescFa: "ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال و برندینگ.",
  siteDescEn: "Enterprise web engineering, technical SEO, and brand growth agency.",
  metaTitleTemplate: "%s | آن‌ساپ",
  canonicalBaseUrl: "https://onsupp.ir",
  defaultKeywordsFa: "دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, آن‌ساپ",
  defaultKeywordsEn: "digital marketing, web design, technical seo, onsupp",
  ogImageUrl: "/images/logo/logo-Crimson.webp",
  faviconUrl: "/favicon.ico",
};

interface RouteSeoSummary {
  path: string;
  nameFa: string;
  type: "static" | "dynamic";
  manageUrl: string;
  description: string;
}

const ROUTE_DIRECTORY: RouteSeoSummary[] = [
  {
    path: "/",
    nameFa: "صفحه اصلی (Homepage)",
    type: "static",
    manageUrl: "/admin/settings",
    description: "متادیتا، پیش‌تیتر و تایتل گلوبال از طریق تنظیمات عمومی سایت مدیریت می‌شود.",
  },
  {
    path: "/about",
    nameFa: "درباره ما (About Us)",
    type: "static",
    manageUrl: "/admin/about",
    description: "روایت استراتژیک، بیوگرافی مدیرعامل و ارزش‌های سازمانی همراه با متادیتا.",
  },
  {
    path: "/services",
    nameFa: "خدمات و سرویس‌ها (Services)",
    type: "dynamic",
    manageUrl: "/admin/services",
    description: "پشتیبانی از تگ‌های داینامیک، صفحات مستقل /services/[slug] و اسکیماهای تفصیلی.",
  },
  {
    path: "/portfolio",
    nameFa: "نمونه‌کارها و کیس‌استادی‌ها (Portfolio)",
    type: "dynamic",
    manageUrl: "/admin/casestudies",
    description: "پروژه‌ها با صفحات اختصاصی /portfolio/[slug]، اپن‌گراف و ماکاپ‌های تصویری.",
  },
  {
    path: "/pricing",
    nameFa: "پلن‌ها و تعرفه‌ها (Pricing)",
    type: "static",
    manageUrl: "/admin/pricing",
    description: "تعرفه‌ها، پکیج‌های توسعه و لندینگ پلن‌های سازمانی.",
  },
  {
    path: "/blog",
    nameFa: "وبلاگ و مقالات (Articles)",
    type: "dynamic",
    manageUrl: "/admin/articles",
    description: "مقالات با فیلدهای کامل سئو، کلمات کلیدی، اسلاگ، سوالات متداول و FAQ Schema.",
  },
  {
    path: "/contact",
    nameFa: "تماس با ما (Contact)",
    type: "static",
    manageUrl: "/admin/settings",
    description: "مختصات تماس، نقشه و ساختارهای تماس رسمی.",
  },
];

export default function SeoAdminPage() {
  const [settings, setSettings] = useState<GlobalSeoSettings>(DEFAULT_SEO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  useEffect(() => {
    adminFetch("/api/v1/settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setSettings({ ...DEFAULT_SEO, ...data });
      })
      .catch(() => notify("err", "خطا در دریافت اطلاعات سئو"))
      .finally(() => setLoading(false));
  }, [notify]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        notify("ok", "تنظیمات عمومی سئو و متادیتا با موفقیت ذخیره شد.");
      } else {
        notify("err", "ذخیره تنظیمات سئو ناموفق بود.");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerRevalidation = async () => {
    setRevalidating(true);
    try {
      const res = await adminFetch("/api/v1/revalidate", {
        method: "POST",
        body: JSON.stringify({
          tags: ["settings", "seo", "homepage", "services", "casestudies", "about"],
          paths: ["/", "/about", "/services", "/portfolio"],
        }),
      });
      if (res.ok) {
        notify("ok", "کش متادیتای موتورهای جستجو (ISR Cache) در تمام مسیرها با موفقیت تازه‌سازی شد.");
      } else {
        notify("err", "پاک‌سازی کش سئو با خطا مواجه شد.");
      }
    } catch {
      notify("err", "خطای شبکه هنگام تازه‌سازی کش");
    } finally {
      setRevalidating(false);
    }
  };

  const titleLength = settings.siteTitleFa.length;
  const descLength = settings.siteDescFa.length;

  if (loading) {
    return (
      <div className="py-24 text-center text-muted" dir="rtl">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>در حال بارگذاری مرکز سئو و متادیتا...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/15 text-mint border border-primary/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </span>
            مرکز سئو، متادیتا و ایندکس موتورهای جستجو (SEO Command Center)
          </h1>
          <p className="text-sm text-muted mt-1">
            مدیریت متادیتای گلوبال، شبیه‌ساز نتایج جستجوی گوگل (SERP)، پیش‌نمایش شبکه‌های اجتماعی و ابزارهای تازه‌سازی کش
          </p>
        </div>

        <button
          onClick={handleTriggerRevalidation}
          disabled={revalidating}
          className="px-5 py-2.5 rounded-xl bg-lime text-ink font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          {revalidating ? (
            <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          پاک‌سازی و تازه‌سازی کش متادیتا (Revalidate)
        </button>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            message.type === "ok"
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
              : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* Live SERP & Social Preview Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google SERP Preview Card */}
        <div className="bg-panel border border-border rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              شبیه‌ساز نتایج جستجوی گوگل (Google SERP Simulator)
            </h3>
            <span className="text-[11px] font-mono text-muted">Google RTL Snippet</span>
          </div>

          <div className="bg-raised border border-border rounded-2xl p-5 space-y-2 font-sans" dir="rtl">
            <div className="flex items-center gap-2 text-xs text-muted font-mono" dir="ltr">
              <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-[10px] text-mint">
                🌐
              </span>
              <span>{settings.canonicalBaseUrl.replace(/^https?:\/\//, "")}</span>
              <span className="text-muted/60">› homepage</span>
            </div>

            <div className="text-base text-blue-600 dark:text-[#99c3ff] hover:underline cursor-pointer font-medium leading-snug">
              {settings.siteTitleFa || "عنوان سایت در گوگل"}
            </div>

            <div className="text-xs text-muted leading-relaxed line-clamp-2">
              {settings.siteDescFa || "توضیحات متای صفحه در نتایج جستجو نمایش داده خواهد شد..."}
            </div>
          </div>

          {/* Char Counters */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-raised border border-border">
              <span className="text-muted">طول عنوان (Title):</span>
              <span className={`font-mono font-bold ${titleLength > 65 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {titleLength} / ۶۰
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-raised border border-border">
              <span className="text-muted">طول توضیحات (Desc):</span>
              <span className={`font-mono font-bold ${descLength > 165 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {descLength} / ۱۶۰
              </span>
            </div>
          </div>
        </div>

        {/* Social Graph OpenGraph Card Preview */}
        <div className="bg-panel border border-border rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <svg className="w-4 h-4 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              پیش‌نمایش کارت اشتراک در شبکه‌ها (OpenGraph / Telegram / X)
            </h3>
            <span className="text-[11px] font-mono text-muted">og:image & Twitter Card</span>
          </div>

          <div className="bg-raised border border-border rounded-2xl overflow-hidden">
            <div className="h-36 bg-subtle relative flex items-center justify-center border-b border-border">
              {settings.ogImageUrl ? (
                <Image
                  src={settings.ogImageUrl}
                  alt="OG Image Preview"
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              ) : (
                <span className="text-xs text-muted">تصویر شاخص شبکه تعیین نشده است</span>
              )}
            </div>
            <div className="p-4 space-y-1">
              <div className="text-[10px] text-muted font-mono" dir="ltr">
                {settings.canonicalBaseUrl.replace(/^https?:\/\//, "")}
              </div>
              <div className="text-sm font-bold text-foreground line-clamp-1">{settings.siteTitleFa}</div>
              <div className="text-xs text-muted line-clamp-2">{settings.siteDescFa}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Meta Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-panel border border-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            پیکربندی متادیتا و هویت سئوی کل وب‌سایت
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                عنوان اصلی سایت در گوگل (Meta Title Fa) *
              </label>
              <input
                type="text"
                required
                value={settings.siteTitleFa}
                onChange={(e) => setSettings({ ...settings, siteTitleFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Main Title (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={settings.siteTitleEn}
                onChange={(e) => setSettings({ ...settings, siteTitleEn: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                قالب عنوان صفحات داخلی (Meta Title Template)
              </label>
              <input
                type="text"
                value={settings.metaTitleTemplate}
                onChange={(e) => setSettings({ ...settings, metaTitleTemplate: e.target.value })}
                placeholder="%s | آن‌ساپ"
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
              />
              <p className="text-[11px] text-muted mt-1">
                عبارت <code>%s</code> با عنوان صفحه یا مقاله جایگزین خواهد شد.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                آدرس مبنا و استاندارد وب‌سایت (Canonical Base URL) *
              </label>
              <input
                type="text"
                required
                dir="ltr"
                value={settings.canonicalBaseUrl}
                onChange={(e) => setSettings({ ...settings, canonicalBaseUrl: e.target.value })}
                placeholder="https://onsupp.ir"
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                توضیحات متای پیش‌فرض (Meta Description Fa) *
              </label>
              <textarea
                rows={3}
                required
                value={settings.siteDescFa}
                onChange={(e) => setSettings({ ...settings, siteDescFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Meta Description (English)
              </label>
              <textarea
                rows={3}
                dir="ltr"
                value={settings.siteDescEn}
                onChange={(e) => setSettings({ ...settings, siteDescEn: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                کلمات کلیدی پیش‌فرض (Keywords Fa)
              </label>
              <input
                type="text"
                value={settings.defaultKeywordsFa}
                onChange={(e) => setSettings({ ...settings, defaultKeywordsFa: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                Default Keywords (English)
              </label>
              <input
                type="text"
                dir="ltr"
                value={settings.defaultKeywordsEn}
                onChange={(e) => setSettings({ ...settings, defaultKeywordsEn: e.target.value })}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* OG Image */}
          <div className="p-4 rounded-2xl bg-raised border border-border space-y-3">
            <label className="block text-xs font-semibold text-foreground">
              تصویر کارت شبکه‌های اجتماعی (Social Share / OpenGraph Image)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {settings.ogImageUrl ? (
                <div className="w-28 h-16 rounded-xl overflow-hidden relative border border-primary/40 bg-panel shrink-0">
                  <Image
                    src={settings.ogImageUrl}
                    alt="OG Image"
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              ) : (
                <div className="w-28 h-16 rounded-xl border border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                  بدون تصویر
                </div>
              )}
              <div className="flex-1 flex gap-2 w-full">
                <input
                  type="text"
                  dir="ltr"
                  value={settings.ogImageUrl}
                  onChange={(e) => setSettings({ ...settings, ogImageUrl: e.target.value })}
                  placeholder="مسیر فایل یا انتخاب از کتابخانه..."
                  className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-primary/15 text-mint border border-primary/30 text-xs font-bold hover:bg-primary/25 cursor-pointer"
                >
                  انتخاب از رسانه‌ها
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-lime text-ink font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
              )}
              ذخیره تنظیمات عمومی سئو
            </button>
          </div>
        </div>
      </form>

      {/* Route-Level SEO Navigation Matrix */}
      <div className="bg-panel border border-border rounded-3xl p-6 md:p-8 space-y-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
            دایرکتوری سئوی مسیرهای وب‌سایت (Page-Level SEO Management)
          </h2>
          <p className="text-xs text-muted mt-1">
            هر بخش از وب‌سایت دارای ماژول مدیریت سئو اختصاصی است. برای تنظیم متادیتا و اسلاگ هر بخش، روی لینک مدیریت آن کلیک کنید.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-raised text-muted text-xs border-b border-border">
              <tr>
                <th className="py-3 px-4 font-medium">مسیر (Route)</th>
                <th className="py-3 px-4 font-medium">عنوان بخش</th>
                <th className="py-3 px-4 font-medium">نوع سئو</th>
                <th className="py-3 px-4 font-medium">توضیحات و رفتار اسکیما</th>
                <th className="py-3 px-4 font-medium text-left">ماژول مدیریت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROUTE_DIRECTORY.map((r, idx) => (
                <tr key={idx} className="hover:bg-raised/60">
                  <td className="py-3.5 px-4 font-mono text-mint font-bold text-xs" dir="ltr">
                    {r.path}
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium">{r.nameFa}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                        r.type === "dynamic"
                          ? "bg-primary/15 text-mint border-primary/30"
                          : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30"
                      }`}
                    >
                      {r.type === "dynamic" ? "پویای چندمسیری" : "تک‌مسیر ثابت"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-muted">{r.description}</td>
                  <td className="py-3.5 px-4 text-left">
                    <Link
                      href={r.manageUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-raised text-foreground text-xs hover:bg-primary/15 hover:text-mint border border-border transition-colors"
                    >
                      مدیریت محتوا و سئو
                      <span className="text-[10px]">←</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Picker */}
      {mediaPickerOpen && (
        <MediaPickerModal
          open={true}
          onSelect={(m: MediaItem) => {
            setSettings((prev) => ({ ...prev, ogImageUrl: m.url }));
            setMediaPickerOpen(false);
          }}
          onClose={() => setMediaPickerOpen(false)}
        />
      )}
    </div>
  );
}
