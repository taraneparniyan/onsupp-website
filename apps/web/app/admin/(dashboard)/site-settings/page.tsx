"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface ContactChannel {
  title: string;
  value: string;
  type?: string;
  action?: string;
  icon?: string;
  description?: string;
}

export interface SiteSettingsForm {
  siteNameFa: string;
  siteNameEn: string;
  siteDescriptionFa: string;
  siteDescriptionEn: string;
  headerCtaTextFa: string;
  headerCtaTextEn: string;
  headerCtaLink: string;
  addressTitleFa: string;
  addressTitleEn: string;
  streetFa: string;
  streetEn: string;
  cityFa: string;
  cityEn: string;
  workingHoursFa: string;
  workingHoursEn: string;
  channels: ContactChannel[];
  telegramUrl: string;
  telegramHandle: string;
  instagramUrl: string;
  linkedinUrl: string;
  consultEmail: string;
  footerTextFa: string;
  footerTextEn: string;
  copyrightTextFa: string;
  copyrightTextEn: string;
  defaultMetaTitleFa: string;
  defaultMetaTitleEn: string;
  defaultMetaDescFa: string;
  defaultMetaDescEn: string;
  defaultKeywordsFa: string;
  defaultKeywordsEn: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
}

const DEFAULT_FORM: SiteSettingsForm = {
  siteNameFa: "آن‌ساپ",
  siteNameEn: "OnSupp",
  siteDescriptionFa: "آژانس خلاق دیجیتال مارکتینگ و توسعه نرم‌افزار",
  siteDescriptionEn: "Creative Digital Marketing & Software Development Agency",
  headerCtaTextFa: "شروع همکاری",
  headerCtaTextEn: "Get Started",
  headerCtaLink: "/#contact",
  addressTitleFa: "آدرس و نشانی استودیو",
  addressTitleEn: "Office Address",
  streetFa: "عظیمیه، میدان کوهنورد، گلستان ۲۱",
  streetEn: "Golestan 21, Kouhnavard Sq, Azimiyeh",
  cityFa: "البرز، کرج، منطقه عظیمیه",
  cityEn: "Alborz, Karaj, Azimiyeh District",
  workingHoursFa: "شنبه تا چهارشنبه ۹:۰۰ تا ۱۸:۰۰",
  workingHoursEn: "Sat - Wed: 09:00 - 18:00",
  channels: [
    {
      title: "تماس تلفنی مستقیم",
      value: "۰۲۶-۳۲۵۰۲۰۰۰",
      type: "phone",
      action: "tel:02632502000",
      icon: "phone",
      description: "مشاوره تلفنی سریع با تیم مهندسی و فروش در ساعات اداری",
    },
    {
      title: "ارتباط از طریق تلگرام",
      value: "@onsupp_web",
      type: "telegram",
      action: "https://t.me/onsupp_web",
      icon: "telegram",
      description: "ارسال مدارک، سناریوهای پروژه و استعلام آنی هزینه‌ها",
    },
    {
      title: "مکاتبه و ارسال بریف ایمیلی",
      value: "info@onsupp.ir",
      type: "email",
      action: "mailto:info@onsupp.ir",
      icon: "email",
      description: "دریافت بریف جامع پروژه‌های سازمانی، عقد قرارداد و همکاری",
    },
  ],
  telegramUrl: "https://t.me/onsupp_web",
  telegramHandle: "onsupp_web",
  instagramUrl: "https://instagram.com/onsupp_web",
  linkedinUrl: "https://linkedin.com/company/onsupp",
  consultEmail: "info@onsupp.ir",
  footerTextFa: "کلیه حقوق مادی و معنوی متعلق به آژانس دیجیتال مارکتینگ آن‌ساپ می‌باشد.",
  footerTextEn: "All rights reserved by OnSupp Digital Marketing Agency.",
  copyrightTextFa: "تمامی حقوق برای آن‌ساپ محفوظ است.",
  copyrightTextEn: "All rights reserved.",
  defaultMetaTitleFa: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار",
  defaultMetaTitleEn: "OnSupp | Digital Agency & Software Engineering",
  defaultMetaDescFa: "ارائه دهنده راهکارهای جامع سئو، مدیریت فضای مجازی، طراحی وب‌سایت و تولید محتوا.",
  defaultMetaDescEn: "Comprehensive SEO, social identity, web development, and content creation studio.",
  defaultKeywordsFa: "سئو, طراحی سایت, استودیو آن‌ساپ, برندینگ, بازاریابی دیجیتال",
  defaultKeywordsEn: "SEO, Web Design, OnSupp Studio, Branding, Digital Marketing",
  headerLogoUrl: "/logo-light.svg",
  footerLogoUrl: "/logo-dark.svg",
  faviconUrl: "/favicon.ico",
  ogImageUrl: "/og-image.jpg",
};

type ActiveTab = "general" | "address" | "channels" | "social" | "footer" | "seo";

export default function SiteSettingsAdminPage() {
  const [form, setForm] = useState<SiteSettingsForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("general");
  const [pickerTarget, setPickerTarget] = useState<"headerLogo" | "footerLogo" | "favicon" | "ogImage" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    adminFetch("/api/v1/site-settings", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setForm({
            siteNameFa: data.siteNameFa ?? DEFAULT_FORM.siteNameFa,
            siteNameEn: data.siteNameEn ?? DEFAULT_FORM.siteNameEn,
            siteDescriptionFa: data.siteDescriptionFa ?? DEFAULT_FORM.siteDescriptionFa,
            siteDescriptionEn: data.siteDescriptionEn ?? DEFAULT_FORM.siteDescriptionEn,
            headerCtaTextFa: data.headerCtaTextFa ?? DEFAULT_FORM.headerCtaTextFa,
            headerCtaTextEn: data.headerCtaTextEn ?? DEFAULT_FORM.headerCtaTextEn,
            headerCtaLink: data.headerCtaLink ?? DEFAULT_FORM.headerCtaLink,
            addressTitleFa: data.addressTitleFa ?? DEFAULT_FORM.addressTitleFa,
            addressTitleEn: data.addressTitleEn ?? DEFAULT_FORM.addressTitleEn,
            streetFa: data.streetFa ?? DEFAULT_FORM.streetFa,
            streetEn: data.streetEn ?? DEFAULT_FORM.streetEn,
            cityFa: data.cityFa ?? DEFAULT_FORM.cityFa,
            cityEn: data.cityEn ?? DEFAULT_FORM.cityEn,
            workingHoursFa: data.workingHoursFa ?? DEFAULT_FORM.workingHoursFa,
            workingHoursEn: data.workingHoursEn ?? DEFAULT_FORM.workingHoursEn,
            channels: Array.isArray(data.channels) && data.channels.length > 0 ? data.channels : DEFAULT_FORM.channels,
            telegramUrl: data.telegramUrl ?? DEFAULT_FORM.telegramUrl,
            telegramHandle: data.telegramHandle ?? DEFAULT_FORM.telegramHandle,
            instagramUrl: data.instagramUrl ?? DEFAULT_FORM.instagramUrl,
            linkedinUrl: data.linkedinUrl ?? DEFAULT_FORM.linkedinUrl,
            consultEmail: data.consultEmail ?? DEFAULT_FORM.consultEmail,
            footerTextFa: data.footerTextFa ?? DEFAULT_FORM.footerTextFa,
            footerTextEn: data.footerTextEn ?? DEFAULT_FORM.footerTextEn,
            copyrightTextFa: data.copyrightTextFa ?? DEFAULT_FORM.copyrightTextFa,
            copyrightTextEn: data.copyrightTextEn ?? DEFAULT_FORM.copyrightTextEn,
            defaultMetaTitleFa: data.defaultMetaTitleFa ?? DEFAULT_FORM.defaultMetaTitleFa,
            defaultMetaTitleEn: data.defaultMetaTitleEn ?? DEFAULT_FORM.defaultMetaTitleEn,
            defaultMetaDescFa: data.defaultMetaDescFa ?? DEFAULT_FORM.defaultMetaDescFa,
            defaultMetaDescEn: data.defaultMetaDescEn ?? DEFAULT_FORM.defaultMetaDescEn,
            defaultKeywordsFa: data.defaultKeywordsFa ?? DEFAULT_FORM.defaultKeywordsFa,
            defaultKeywordsEn: data.defaultKeywordsEn ?? DEFAULT_FORM.defaultKeywordsEn,
            headerLogoUrl: data.headerLogoUrl ?? DEFAULT_FORM.headerLogoUrl,
            footerLogoUrl: data.footerLogoUrl ?? DEFAULT_FORM.footerLogoUrl,
            faviconUrl: data.faviconUrl ?? DEFAULT_FORM.faviconUrl,
            ogImageUrl: data.ogImageUrl ?? DEFAULT_FORM.ogImageUrl,
          });
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت تنظیمات سایت" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await adminFetch("/api/v1/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: "تنظیمات کلی سایت با موفقیت ذخیره و کش بازسازی شد." });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره تنظیمات." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در برقراری ارتباط با سرور." });
    } finally {
      setSaving(false);
    }
  };

  const addChannel = () => {
    setForm((prev) => ({
      ...prev,
      channels: [
        ...prev.channels,
        {
          title: "کانال جدید",
          value: "",
          type: "phone",
          action: "",
          icon: "phone",
          description: "",
        },
      ],
    }));
  };

  const removeChannel = (index: number) => {
    setForm((prev) => ({
      ...prev,
      channels: prev.channels.filter((_, i) => i !== index),
    }));
  };

  const updateChannel = (index: number, field: keyof ContactChannel, val: string) => {
    setForm((prev) => {
      const updated = [...prev.channels];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, channels: updated };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">تنظیمات کلی و هویت وب‌سایت (Site Settings)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت اطلاعات پایه آژانس آن‌ساپ، هویت بصری، آدرس و تلفن‌ها، شبکه‌های اجتماعی، فوتر و سئوی پیش‌فرض
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>در حال ذخیره...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>ذخیره کلیه تنظیمات</span>
            </>
          )}
        </button>
      </div>

      {/* ── Notification Banner ── */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium border flex items-center justify-between transition-all ${
            message.type === "ok"
              ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-200"
              : "bg-red-950/50 border-red-500/40 text-red-200"
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

      {/* ── Tabs Navigation ── */}
      <div className="flex flex-wrap gap-2 border-b border-[#232c27] pb-2">
        {[
          { id: "general", label: "اطلاعات شرکت و برند" },
          { id: "address", label: "نشانی و ساعات کاری" },
          { id: "channels", label: "کانال‌های تماس تعاملی" },
          { id: "social", label: "شبکه‌های اجتماعی" },
          { id: "footer", label: "فوتر و متون حقوقی" },
          { id: "seo", label: "سئوی سراسری پیش‌فرض" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as ActiveTab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-primary/20 text-emerald-400 border border-primary/40"
                : "text-[#8fa397] hover:text-white hover:bg-[#1a221e]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Contents ── */}
      <form onSubmit={handleSave} className="space-y-6">
        {activeTab === "general" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">هویت برند و لوگوها</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">نام آژانس (فارسی) *</label>
                <input
                  type="text"
                  value={form.siteNameFa}
                  onChange={(e) => setForm({ ...form, siteNameFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">Agency Name (English)</label>
                <input
                  type="text"
                  value={form.siteNameEn}
                  onChange={(e) => setForm({ ...form, siteNameEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">شرح فعالیت سازمانی (فارسی)</label>
                <input
                  type="text"
                  value={form.siteDescriptionFa}
                  onChange={(e) => setForm({ ...form, siteDescriptionFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">Agency Description (English)</label>
                <input
                  type="text"
                  value={form.siteDescriptionEn}
                  onChange={(e) => setForm({ ...form, siteDescriptionEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">متن دکمه هدر (فارسی)</label>
                <input
                  type="text"
                  value={form.headerCtaTextFa}
                  onChange={(e) => setForm({ ...form, headerCtaTextFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">لینک دکمه هدر (Header CTA Link)</label>
                <input
                  type="text"
                  value={form.headerCtaLink}
                  onChange={(e) => setForm({ ...form, headerCtaLink: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#232c27]">
              {/* Header Logo */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">لوگوی اصلی هدر (Light)</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.headerLogoUrl ? (
                      <Image src={form.headerLogoUrl} alt="Logo" fill className="object-contain p-1" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون لوگو</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.headerLogoUrl}
                      onChange={(e) => setForm({ ...form, headerLogoUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("headerLogo")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer Logo */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">لوگوی تیره فوتر (Dark)</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.footerLogoUrl ? (
                      <Image src={form.footerLogoUrl} alt="Dark Logo" fill className="object-contain p-1" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون لوگو</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.footerLogoUrl}
                      onChange={(e) => setForm({ ...form, footerLogoUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("footerLogo")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">فاوآیکون (Favicon)</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.faviconUrl ? (
                      <Image src={form.faviconUrl} alt="Favicon" width={28} height={28} className="object-contain" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون آیکون</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.faviconUrl}
                      onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("favicon")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "address" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">نشانی استودیو و ساعات کاری</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">عنوان بخش نشانی (فارسی)</label>
                <input
                  type="text"
                  value={form.addressTitleFa}
                  onChange={(e) => setForm({ ...form, addressTitleFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">ایمیل مشاوره و بریف</label>
                <input
                  type="email"
                  value={form.consultEmail}
                  onChange={(e) => setForm({ ...form, consultEmail: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">خیابان / کوچه (فارسی)</label>
                <input
                  type="text"
                  value={form.streetFa}
                  onChange={(e) => setForm({ ...form, streetFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">شهر و استان (فارسی)</label>
                <input
                  type="text"
                  value={form.cityFa}
                  onChange={(e) => setForm({ ...form, cityFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">ساعات کاری و پذیرش مراجعین (فارسی)</label>
                <input
                  type="text"
                  value={form.workingHoursFa}
                  onChange={(e) => setForm({ ...form, workingHoursFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "channels" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">کانال‌های ارتباطی کال تو اکشن (Contact CTA)</h2>
                <p className="text-xs text-[#8fa397] mt-1">
                  کارت‌های ارتباط مستقیم نمایش داده شده در سکشن تماس و مشاوره صفحه اصلی و فوتر
                </p>
              </div>
              <button
                type="button"
                onClick={addChannel}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1f2623] text-emerald-400 hover:bg-[#28322d] border border-emerald-500/30"
              >
                + افزودن کانال تماس
              </button>
            </div>

            <div className="space-y-4">
              {form.channels.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#101413] border border-[#232c27] relative grid grid-cols-1 md:grid-cols-12 gap-4 items-start"
                >
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">عنوان کانال</label>
                    <input
                      type="text"
                      value={ch.title}
                      onChange={(e) => updateChannel(idx, "title", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">مقدار نمایشی (شماره / شناسه)</label>
                    <input
                      type="text"
                      value={ch.value}
                      onChange={(e) => updateChannel(idx, "value", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">لینک اقدام (tel: / mailto: / url)</label>
                    <input
                      type="text"
                      value={ch.action || ""}
                      onChange={(e) => updateChannel(idx, "action", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">نوع آیکون</label>
                    <select
                      value={ch.icon || "phone"}
                      onChange={(e) => updateChannel(idx, "icon", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2 py-2 focus:border-primary focus:outline-none"
                    >
                      <option value="phone">تلفن (Phone)</option>
                      <option value="telegram">تلگرام (Telegram)</option>
                      <option value="email">ایمیل (Email)</option>
                      <option value="whatsapp">واتس‌اپ (WhatsApp)</option>
                      <option value="location">آدرس (Location)</option>
                    </select>
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center pt-5">
                    <button
                      type="button"
                      onClick={() => removeChannel(idx)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/30 text-xs"
                      title="حذف کانال"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="md:col-span-12">
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">توضیح کوتاه زیر عنوان</label>
                    <input
                      type="text"
                      value={ch.description || ""}
                      onChange={(e) => updateChannel(idx, "description", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-1.5 focus:border-primary focus:outline-none"
                      placeholder="توضیح تکمیلی..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "social" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">پیوند به شبکه‌های اجتماعی رسمی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">کانال یا ربات تلگرام (Telegram URL)</label>
                <input
                  type="url"
                  value={form.telegramUrl}
                  onChange={(e) => setForm({ ...form, telegramUrl: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">شناسه کاربری تلگرام (Telegram Handle)</label>
                <input
                  type="text"
                  value={form.telegramHandle}
                  onChange={(e) => setForm({ ...form, telegramHandle: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                  placeholder="onsupp_web"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">صفحه اینستاگرام (Instagram URL)</label>
                <input
                  type="url"
                  value={form.instagramUrl}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">صفحه لینکدین (LinkedIn URL)</label>
                <input
                  type="url"
                  value={form.linkedinUrl}
                  onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "footer" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">متون و کپی‌رایت فوتر سایت</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">متن معرفی کوتاه فوتر (فارسی)</label>
                <textarea
                  rows={3}
                  value={form.footerTextFa}
                  onChange={(e) => setForm({ ...form, footerTextFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">متن کپی‌رایت و حقوق مادی و معنوی (فارسی)</label>
                <input
                  type="text"
                  value={form.copyrightTextFa}
                  onChange={(e) => setForm({ ...form, copyrightTextFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">Copyright Line (English)</label>
                <input
                  type="text"
                  value={form.copyrightTextEn}
                  onChange={(e) => setForm({ ...form, copyrightTextEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">تنظیمات پیش‌فرض سئوی سراسری (Global Fallback SEO)</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">عنوان پیش‌فرض متا (Default Meta Title Fa)</label>
                <input
                  type="text"
                  value={form.defaultMetaTitleFa}
                  onChange={(e) => setForm({ ...form, defaultMetaTitleFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">توضیحات پیش‌فرض متا (Default Meta Description Fa)</label>
                <textarea
                  rows={3}
                  value={form.defaultMetaDescFa}
                  onChange={(e) => setForm({ ...form, defaultMetaDescFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">کلیدواژه‌های سراسری (کاما جداشده)</label>
                <input
                  type="text"
                  value={form.defaultKeywordsFa}
                  onChange={(e) => setForm({ ...form, defaultKeywordsFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">تصویر اشتراک‌گذاری پیش‌فرض (Default OpenGraph Image)</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.ogImageUrl ? (
                      <Image src={form.ogImageUrl} alt="OG" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون تصویر</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.ogImageUrl}
                      onChange={(e) => setForm({ ...form, ogImageUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("ogImage")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerTarget(null)}
          onSelect={(item: MediaItem) => {
            setForm((prev) => ({
              ...prev,
              [pickerTarget === "headerLogo"
                ? "headerLogoUrl"
                : pickerTarget === "footerLogo"
                ? "footerLogoUrl"
                : pickerTarget === "favicon"
                ? "faviconUrl"
                : "ogImageUrl"]: item.url,
            }));
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
