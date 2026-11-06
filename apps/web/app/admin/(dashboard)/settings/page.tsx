"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface SiteSettingsForm {
  siteNameFa: string;
  siteNameEn: string;
  siteTitleFa: string;
  siteTitleEn: string;
  siteDescFa: string;
  siteDescEn: string;
  defaultKeywordsFa: string;
  defaultKeywordsEn: string;
  metaTitleTemplate: string;
  canonicalBaseUrl: string;
  headerLogoUrl: string | null;
  headerDarkLogoUrl: string | null;
  footerLogoUrl: string | null;
  ogImageUrl: string | null;
  faviconUrl: string | null;
  phone: string;
  secondaryPhone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
  telegramHandle: string;
  telegramUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  addressFa: string;
  addressEn: string;
  workingHoursFa: string;
  workingHoursEn: string;
  googleMapsUrl: string;
  footerCopyrightFa: string;
  footerCopyrightEn: string;
  footerDescriptionFa: string;
  footerDescriptionEn: string;
}

const EMPTY_SETTINGS: SiteSettingsForm = {
  siteNameFa: "آن‌ساپ",
  siteNameEn: "OnSupp",
  siteTitleFa: "آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ",
  siteTitleEn: "OnSupp | Digital Agency & Software Engineering",
  siteDescFa: "ارائه‌دهنده راهکارهای هوشمند طراحی وب‌سایت‌های سازمانی، سئو تکنیکال و برندینگ.",
  siteDescEn: "Enterprise web engineering, technical SEO, and brand growth agency.",
  defaultKeywordsFa: "دیجیتال مارکتینگ, طراحی سایت, سئو تکنیکال, آن‌ساپ",
  defaultKeywordsEn: "digital marketing, web design, technical seo, onsupp",
  metaTitleTemplate: "%s | آن‌ساپ",
  canonicalBaseUrl: "https://onsupp.ir",
  headerLogoUrl: null,
  headerDarkLogoUrl: null,
  footerLogoUrl: null,
  ogImageUrl: null,
  faviconUrl: null,
  phone: "",
  secondaryPhone: "",
  phoneLabelFa: "تلفن تماس",
  phoneLabelEn: "Phone",
  email: "info@onsupp.ir",
  emailLabelFa: "ایمیل رسمی",
  emailLabelEn: "Email",
  responseTimeFa: "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰",
  responseTimeEn: "Sat - Wed: 09:00 - 18:00",
  telegramHandle: "onsupp_web",
  telegramUrl: "https://t.me/onsupp_web",
  instagramUrl: "https://instagram.com/onsupp_web",
  linkedinUrl: "https://linkedin.com/company/onsupp",
  addressFa: "البرز، کرج، عظیمیه، میدان کوهنورد، گلستان ۲۱",
  addressEn: "Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Alborz",
  workingHoursFa: "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰",
  workingHoursEn: "Sat - Wed: 09:00 - 18:00",
  googleMapsUrl: "https://maps.google.com/?q=عظیمیه+میدان+کوهنورد+گلستان+۲۱",
  footerCopyrightFa: "© ۲۰۲۶ کلیه حقوق مادی و معنوی متعلق به آژانس دیجیتال آن‌ساپ می‌باشد.",
  footerCopyrightEn: "© 2026 OnSupp Digital Agency. All rights reserved.",
  footerDescriptionFa:
    "ما باور داریم تمایز و درخشش در فضای دیجیتال یک انتخاب آگاهانه و استراتژیک است. با تلفیق هنر، فناوری و دانش داده‌محور، هویت برند شما را ارتقا می‌دهیم.",
  footerDescriptionEn:
    "We unite cinema-grade storytelling with scalable software engineering to accelerate sustainable brand growth.",
};

type LogoTarget = "headerLogo" | "headerDarkLogo" | "footerLogo" | "favicon" | "ogImage";

export default function SiteSettingsAdminPage() {
  const [form, setForm] = useState<SiteSettingsForm>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "contact" | "social" | "footer" | "seo" | "media">("general");
  const [mediaTarget, setMediaTarget] = useState<LogoTarget | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/settings", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, ...data }));
      } else {
        notify("err", "خطا در دریافت اطلاعات تنظیمات سایت");
      }
    } catch {
      notify("err", "عدم برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateField = (key: keyof SiteSettingsForm, val: any) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch("/api/v1/settings", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setForm((prev) => ({ ...prev, ...updated }));
        notify("ok", "تنظیمات سایت با موفقیت در دیتابیس ذخیره و کش بروزرسانی شد");
      } else {
        const err = await res.json();
        notify("err", err.error || "خطا در ذخیره تنظیمات");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (media: MediaItem) => {
    if (!mediaTarget) return;
    const url = media.url.startsWith("http") || media.url.startsWith("/") ? media.url : `/${media.url}`;
    if (mediaTarget === "headerLogo") updateField("headerLogoUrl", url);
    if (mediaTarget === "headerDarkLogo") updateField("headerDarkLogoUrl", url);
    if (mediaTarget === "footerLogo") updateField("footerLogoUrl", url);
    if (mediaTarget === "favicon") updateField("faviconUrl", url);
    if (mediaTarget === "ogImage") updateField("ogImageUrl", url);
    setMediaTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            تنظیمات عمومی سایت و هویت سازمانی
          </h1>
          <p className="text-sm text-muted mt-1">
            مدیریت اطلاعات پایه، شماره‌های تماس، آدرس، لوگوها، پیوندهای شبکه‌های اجتماعی و سئوی جهانی.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lime text-ink font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <span>ذخیره تغییرات کلی</span>
          )}
        </button>
      </div>

      {/* ── Notification Banner ── */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center justify-between transition-all ${
            message.type === "ok"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300"
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            بستن
          </button>
        </div>
      )}

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: "general", label: "اطلاعات برند و نام سایت" },
          { key: "media", label: "لوگوها و رسانه‌ها" },
          { key: "contact", label: "راه‌های ارتباطی و آدرس" },
          { key: "social", label: "شبکه‌های اجتماعی" },
          { key: "footer", label: "تنظیمات فوتر" },
          { key: "seo", label: "سئو و متادیتا" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "bg-lime text-ink font-bold shadow-xs"
                : "text-muted hover:text-foreground hover:bg-raised"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── TAB 1: GENERAL BRAND INFO ── */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام برند (فارسی)</label>
              <input
                type="text"
                value={form.siteNameFa}
                onChange={(e) => updateField("siteNameFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="آن‌ساپ"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">نام برند (انگلیسی)</label>
              <input
                type="text"
                dir="ltr"
                value={form.siteNameEn}
                onChange={(e) => updateField("siteNameEn", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="OnSupp"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">عنوان اصلی سایت (Site Title Fa)</label>
              <input
                type="text"
                value={form.siteTitleFa}
                onChange={(e) => updateField("siteTitleFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار آن‌ساپ"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">عنوان اصلی سایت (Site Title En)</label>
              <input
                type="text"
                dir="ltr"
                value={form.siteTitleEn}
                onChange={(e) => updateField("siteTitleEn", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="OnSupp | Digital Agency & Software Engineering"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">توضیحات معرفی برند (فارسی)</label>
              <textarea
                rows={3}
                value={form.siteDescFa}
                onChange={(e) => updateField("siteDescFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl p-4 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ── TAB 2: LOGOS & MEDIA ── */}
        {activeTab === "media" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            {/* Header Logo (Light Theme) */}
            <div className="space-y-3 bg-raised p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">لوگوی هدر (تم روشن)</span>
                {form.headerLogoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("headerLogoUrl", null)}
                    className="text-[11px] text-burgundy hover:underline"
                  >
                    حذف
                  </button>
                )}
              </div>
              <div
                onClick={() => setMediaTarget("headerLogo")}
                className="relative h-28 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-colors bg-panel"
              >
                {form.headerLogoUrl ? (
                  <Image
                    src={form.headerLogoUrl}
                    alt="Header Logo"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب لوگو</span>
                )}
              </div>
            </div>

            {/* Header Dark Logo */}
            <div className="space-y-3 bg-raised p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">لوگوی هدر (تم تاریک)</span>
                {form.headerDarkLogoUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("headerDarkLogoUrl", null)}
                    className="text-[11px] text-burgundy hover:underline"
                  >
                    حذف
                  </button>
                )}
              </div>
              <div
                onClick={() => setMediaTarget("headerDarkLogo")}
                className="relative h-28 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-colors bg-panel"
              >
                {form.headerDarkLogoUrl ? (
                  <Image
                    src={form.headerDarkLogoUrl}
                    alt="Header Dark Logo"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب لوگو</span>
                )}
              </div>
            </div>

            {/* Favicon */}
            <div className="space-y-3 bg-raised p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">آیکون نشانک (Favicon)</span>
                {form.faviconUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("faviconUrl", null)}
                    className="text-[11px] text-burgundy hover:underline"
                  >
                    حذف
                  </button>
                )}
              </div>
              <div
                onClick={() => setMediaTarget("favicon")}
                className="relative h-28 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-colors bg-panel"
              >
                {form.faviconUrl ? (
                  <Image
                    src={form.faviconUrl}
                    alt="Favicon"
                    fill
                    className="object-contain p-4"
                  />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب Favicon</span>
                )}
              </div>
            </div>

            {/* Social Share OG Image */}
            <div className="md:col-span-2 space-y-3 bg-raised p-4 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">تصویر اشتراک‌گذاری پیش‌فرض (OG Image)</span>
                {form.ogImageUrl && (
                  <button
                    type="button"
                    onClick={() => updateField("ogImageUrl", null)}
                    className="text-[11px] text-burgundy hover:underline"
                  >
                    حذف
                  </button>
                )}
              </div>
              <div
                onClick={() => setMediaTarget("ogImage")}
                className="relative h-36 border-2 border-dashed border-border hover:border-primary/50 rounded-xl flex flex-col items-center justify-center p-2 cursor-pointer transition-colors bg-panel"
              >
                {form.ogImageUrl ? (
                  <Image
                    src={form.ogImageUrl}
                    alt="OG Share Image"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted">کلیک برای انتخاب تصویر OG Share</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: CONTACT & COORDINATES ── */}
        {activeTab === "contact" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">شماره تلفن اصلی</label>
              <input
                type="text"
                dir="ltr"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="02188888888"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">شماره تلفن دوم / همراه</label>
              <input
                type="text"
                dir="ltr"
                value={form.secondaryPhone}
                onChange={(e) => updateField("secondaryPhone", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="09120000000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">ایمیل رسمی</label>
              <input
                type="email"
                dir="ltr"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="info@onsupp.ir"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">ساعات کاری و پاسخگویی</label>
              <input
                type="text"
                value={form.workingHoursFa}
                onChange={(e) => updateField("workingHoursFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">آدرس پستی و نشانی دفتر (فارسی)</label>
              <input
                type="text"
                value={form.addressFa}
                onChange={(e) => updateField("addressFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="البرز، کرج، عظیمیه، میدان کوهنورد، گلستان ۲۱"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">نشانی دفتر به انگلیسی (Address En)</label>
              <input
                type="text"
                dir="ltr"
                value={form.addressEn}
                onChange={(e) => updateField("addressEn", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="Golestan 21, Kouhnavard Sq, Azimiyeh, Karaj, Alborz"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-foreground">لینک موقعیت مکانی (Google Maps URL)</label>
              <input
                type="url"
                dir="ltr"
                value={form.googleMapsUrl}
                onChange={(e) => updateField("googleMapsUrl", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="https://maps.google.com/?q=..."
              />
            </div>
          </div>
        )}

        {/* ── TAB 4: SOCIAL CHANNELS ── */}
        {activeTab === "social" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">آیدی تلگرام (Handle)</label>
              <input
                type="text"
                dir="ltr"
                value={form.telegramHandle}
                onChange={(e) => updateField("telegramHandle", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="onsupp_web"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">لینک کانال یا پشتیبانی تلگرام</label>
              <input
                type="url"
                dir="ltr"
                value={form.telegramUrl}
                onChange={(e) => updateField("telegramUrl", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="https://t.me/onsupp_web"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">لینک صفحه اینستاگرام</label>
              <input
                type="url"
                dir="ltr"
                value={form.instagramUrl}
                onChange={(e) => updateField("instagramUrl", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="https://instagram.com/onsupp_web"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">لینک لینکدین (LinkedIn)</label>
              <input
                type="url"
                dir="ltr"
                value={form.linkedinUrl}
                onChange={(e) => updateField("linkedinUrl", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="https://linkedin.com/company/onsupp"
              />
            </div>
          </div>
        )}

        {/* ── TAB 5: FOOTER SETTINGS ── */}
        {activeTab === "footer" && (
          <div className="space-y-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">متن حق کپی‌رایت فوتر (فارسی)</label>
              <input
                type="text"
                value={form.footerCopyrightFa}
                onChange={(e) => updateField("footerCopyrightFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">متن حق کپی‌رایت فوتر (انگلیسی)</label>
              <input
                type="text"
                dir="ltr"
                value={form.footerCopyrightEn}
                onChange={(e) => updateField("footerCopyrightEn", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">بیانیه و توضیحات معرفی در فوتر (فارسی)</label>
              <textarea
                rows={3}
                value={form.footerDescriptionFa}
                onChange={(e) => updateField("footerDescriptionFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl p-4 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ── TAB 6: GLOBAL SEO ── */}
        {activeTab === "seo" && (
          <div className="space-y-6 bg-panel border border-border p-6 rounded-2xl shadow-xs">
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">الگوی عنوان صفحات (Meta Title Template)</label>
              <input
                type="text"
                value={form.metaTitleTemplate}
                onChange={(e) => updateField("metaTitleTemplate", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                placeholder="%s | آن‌ساپ"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">آدرس پایه دامنه رسمی (Canonical Base URL)</label>
              <input
                type="url"
                dir="ltr"
                value={form.canonicalBaseUrl}
                onChange={(e) => updateField("canonicalBaseUrl", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-mono"
                placeholder="https://onsupp.ir"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground">کلمات کلیدی پیش‌فرض (فارسی - جداشده با کاما)</label>
              <input
                type="text"
                value={form.defaultKeywordsFa}
                onChange={(e) => updateField("defaultKeywordsFa", e.target.value)}
                className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={mediaTarget !== null}
        onClose={() => setMediaTarget(null)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
