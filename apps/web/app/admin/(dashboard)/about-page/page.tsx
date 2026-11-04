"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface CoreValueItem {
  titleFa: string;
  titleEn: string;
  descFa: string;
  descEn: string;
  icon: string;
}

export interface AboutPageForm {
  heroEyebrowFa: string;
  heroEyebrowEn: string;
  heroTitleFa: string;
  heroTitleEn: string;
  heroCaptionFa: string;
  heroCaptionEn: string;
  heroImageUrl: string;
  heroImageAltFa: string;
  heroImageAltEn: string;
  introEyebrowFa: string;
  introEyebrowEn: string;
  introTitleFa: string;
  introTitleEn: string;
  introLeadFa: string;
  introLeadEn: string;
  introApproachFa: string;
  introApproachEn: string;
  coreValues: CoreValueItem[];
  ceoNameFa: string;
  ceoNameEn: string;
  ceoRoleFa: string;
  ceoRoleEn: string;
  ceoQuoteFa: string;
  ceoQuoteEn: string;
  ceoBioFa: string[];
  ceoPhotoUrl: string;
  ceoLinkedin: string;
  ceoTwitter: string;
  ceoInstagram: string;
}

const DEFAULT_FORM: AboutPageForm = {
  heroEyebrowFa: "درباره آن‌ساپ",
  heroEyebrowEn: "About OnSupp",
  heroTitleFa: "تیمی فراتر از مرزهای سنتی دیجیتال مارکتینگ",
  heroTitleEn: "Beyond the Boundaries of Traditional Agency",
  heroCaptionFa: "ما تیمی از متخصصان فناوری، دیزاینرهای برند و استراتژیست‌های رشد هستیم.",
  heroCaptionEn: "A multidisciplinary studio of engineers, brand designers, and growth architects.",
  heroImageUrl: "/images/about/hero.webp",
  heroImageAltFa: "استودیو آن‌ساپ",
  heroImageAltEn: "OnSupp Studio",
  introEyebrowFa: "دیدگاه استراتژیک",
  introEyebrowEn: "Strategic Vision",
  introTitleFa: "تمرکز بر ساختن ارزش‌های ماندگار",
  introTitleEn: "Focused on Enduring Value Creation",
  introLeadFa: "آن‌ساپ در پاسخ به یک خلاء اساسی متولد شد: شکاف میان دیزاین لوکس و مهندسی پایدار.",
  introLeadEn: "OnSupp was founded to bridge the gap between luxury aesthetics and scalable engineering.",
  introApproachFa: "ما باور داریم که یک محصول دیجیتال موفق نه تنها باید چشم‌نواز باشد، بلکه باید در زیر فشار ترافیک بالا پایدار بماند.",
  introApproachEn: "We believe exceptional software must look breathtaking while performing reliably under pressure.",
  coreValues: [
    {
      titleFa: "مهندسی بی‌نقص و پایداری",
      titleEn: "Uncompromising Engineering",
      descFa: "کدنویسی تمیز، ساختار ماژولار و رعایت بالاترین استانداردهای امنیتی.",
      descEn: "Clean code, modular architecture, and rigorous security standards.",
      icon: "code",
    },
    {
      titleFa: "دیزاین اختصاصی و هویت‌محور",
      titleEn: "Bespoke Identity Design",
      descFa: "پرهیز از قالب‌های آماده و خلق زبان بصری یکتا متناسب با جایگاه بازار هر برند.",
      descEn: "Zero cookie-cutter templates; crafting distinct brand languages tailored to market positioning.",
      icon: "sparkles",
    },
    {
      titleFa: "شفافیت و هم‌افزایی کارفرما",
      titleEn: "Radical Transparency",
      descFa: "گزارش‌دهی شفاف، تحویل مستمر و ارتباط مستقیم با لیدهای فنی بدون لایه‌های واسطه.",
      descEn: "Transparent reporting, continuous delivery, and direct communication with engineering leads.",
      icon: "handshake",
    },
  ],
  ceoNameFa: "علی شمس",
  ceoNameEn: "Ali Shams",
  ceoRoleFa: "مدیرعامل و هم‌بنیان‌گذار",
  ceoRoleEn: "Chief Executive Officer & Co-Founder",
  ceoQuoteFa: "«ماموریت ما ساختن محصولاتی است که کارفرمایان ما با افتخار به عنوان ویترین اعتبار خود به جهان معرفی کنند.»",
  ceoQuoteEn: "“Our mission is to build digital assets our partners present to the world with utmost pride.”",
  ceoBioFa: [
    "با بیش از یک دهه تجربه در راهبری پروژه‌های وب مقیاس‌بزرگ و هدایت تیم‌های چندرشته‌ای...",
    "تمرکز همیشگی استودیو بر ایجاد ارزش افزوده واقعی و رشد ملموس نرخ تبدیل کارفرمایان ماست.",
  ],
  ceoPhotoUrl: "/images/team/ceo.webp",
  ceoLinkedin: "https://linkedin.com/in/onsupp-ceo",
  ceoTwitter: "https://twitter.com/onsupp_ceo",
  ceoInstagram: "https://instagram.com/onsupp_ceo",
};

type ActiveTab = "hero" | "intro" | "values" | "ceo";

export default function AboutPageAdmin() {
  const [form, setForm] = useState<AboutPageForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("hero");
  const [pickerTarget, setPickerTarget] = useState<"heroImage" | "ceoPhoto" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    adminFetch("/api/v1/about-page", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          const ceoSocial = data.ceoSocialLinks || {};
          setForm({
            heroEyebrowFa: data.heroEyebrowFa ?? DEFAULT_FORM.heroEyebrowFa,
            heroEyebrowEn: data.heroEyebrowEn ?? DEFAULT_FORM.heroEyebrowEn,
            heroTitleFa: data.heroTitleFa ?? DEFAULT_FORM.heroTitleFa,
            heroTitleEn: data.heroTitleEn ?? DEFAULT_FORM.heroTitleEn,
            heroCaptionFa: data.heroCaptionFa ?? DEFAULT_FORM.heroCaptionFa,
            heroCaptionEn: data.heroCaptionEn ?? DEFAULT_FORM.heroCaptionEn,
            heroImageUrl: data.heroImageUrl ?? DEFAULT_FORM.heroImageUrl,
            heroImageAltFa: data.heroImageAltFa ?? DEFAULT_FORM.heroImageAltFa,
            heroImageAltEn: data.heroImageAltEn ?? DEFAULT_FORM.heroImageAltEn,
            introEyebrowFa: data.introEyebrowFa ?? DEFAULT_FORM.introEyebrowFa,
            introEyebrowEn: data.introEyebrowEn ?? DEFAULT_FORM.introEyebrowEn,
            introTitleFa: data.introTitleFa ?? DEFAULT_FORM.introTitleFa,
            introTitleEn: data.introTitleEn ?? DEFAULT_FORM.introTitleEn,
            introLeadFa: data.introLeadFa ?? DEFAULT_FORM.introLeadFa,
            introLeadEn: data.introLeadEn ?? DEFAULT_FORM.introLeadEn,
            introApproachFa: data.introApproachFa ?? DEFAULT_FORM.introApproachFa,
            introApproachEn: data.introApproachEn ?? DEFAULT_FORM.introApproachEn,
            coreValues: Array.isArray(data.coreValues) && data.coreValues.length > 0 ? data.coreValues : DEFAULT_FORM.coreValues,
            ceoNameFa: data.ceoNameFa ?? DEFAULT_FORM.ceoNameFa,
            ceoNameEn: data.ceoNameEn ?? DEFAULT_FORM.ceoNameEn,
            ceoRoleFa: data.ceoRoleFa ?? DEFAULT_FORM.ceoRoleFa,
            ceoRoleEn: data.ceoRoleEn ?? DEFAULT_FORM.ceoRoleEn,
            ceoQuoteFa: data.ceoQuoteFa ?? DEFAULT_FORM.ceoQuoteFa,
            ceoQuoteEn: data.ceoQuoteEn ?? DEFAULT_FORM.ceoQuoteEn,
            ceoBioFa: Array.isArray(data.ceoBioFa) && data.ceoBioFa.length > 0 ? data.ceoBioFa : DEFAULT_FORM.ceoBioFa,
            ceoPhotoUrl: data.ceoPhotoUrl ?? DEFAULT_FORM.ceoPhotoUrl,
            ceoLinkedin: ceoSocial.linkedin ?? DEFAULT_FORM.ceoLinkedin,
            ceoTwitter: ceoSocial.twitter ?? DEFAULT_FORM.ceoTwitter,
            ceoInstagram: ceoSocial.instagram ?? DEFAULT_FORM.ceoInstagram,
          });
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت اطلاعات صفحه درباره ما" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      heroEyebrowFa: form.heroEyebrowFa,
      heroEyebrowEn: form.heroEyebrowEn,
      heroTitleFa: form.heroTitleFa,
      heroTitleEn: form.heroTitleEn,
      heroCaptionFa: form.heroCaptionFa,
      heroCaptionEn: form.heroCaptionEn,
      heroImageUrl: form.heroImageUrl,
      heroImageAltFa: form.heroImageAltFa,
      heroImageAltEn: form.heroImageAltEn,
      introEyebrowFa: form.introEyebrowFa,
      introEyebrowEn: form.introEyebrowEn,
      introTitleFa: form.introTitleFa,
      introTitleEn: form.introTitleEn,
      introLeadFa: form.introLeadFa,
      introLeadEn: form.introLeadEn,
      introApproachFa: form.introApproachFa,
      introApproachEn: form.introApproachEn,
      coreValues: form.coreValues,
      ceoNameFa: form.ceoNameFa,
      ceoNameEn: form.ceoNameEn,
      ceoRoleFa: form.ceoRoleFa,
      ceoRoleEn: form.ceoRoleEn,
      ceoQuoteFa: form.ceoQuoteFa,
      ceoQuoteEn: form.ceoQuoteEn,
      ceoBioFa: form.ceoBioFa,
      ceoPhotoUrl: form.ceoPhotoUrl,
      ceoSocialLinks: {
        linkedin: form.ceoLinkedin,
        twitter: form.ceoTwitter,
        instagram: form.ceoInstagram,
      },
    };

    try {
      const res = await adminFetch("/api/v1/about-page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: "صفحه درباره ما با موفقیت ذخیره و کش بازسازی شد." });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره تغییرات." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در برقراری ارتباط با سرور." });
    } finally {
      setSaving(false);
    }
  };

  const addCoreValue = () => {
    setForm((prev) => ({
      ...prev,
      coreValues: [
        ...prev.coreValues,
        {
          titleFa: "ارزش سازمانی جدید",
          titleEn: "New Core Value",
          descFa: "توضیحات مربوط به این ارزش سازمانی...",
          descEn: "Description of this core value...",
          icon: "sparkles",
        },
      ],
    }));
  };

  const removeCoreValue = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== idx),
    }));
  };

  const updateCoreValue = (idx: number, field: keyof CoreValueItem, val: string) => {
    setForm((prev) => {
      const updated = [...prev.coreValues];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, coreValues: updated };
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
          <h1 className="text-2xl font-bold text-white mb-1">مدیریت صفحه درباره ما (About Us CMS)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت کامل بخش هیرو، دیدگاه استراتژیک، ارزش‌های بنیادین و پیام مدیرعامل در صفحه اختصاصی /about
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
              <span>ذخیره صفحه درباره ما</span>
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
          <button type="button" onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* ── Tabs Navigation ── */}
      <div className="flex flex-wrap gap-2 border-b border-[#232c27] pb-2">
        {[
          { id: "hero", label: "بخش معرفی و هیرو" },
          { id: "intro", label: "دیدگاه استراتژیک و فلسفه" },
          { id: "values", label: "ارزش‌های بنیادین استودیو" },
          { id: "ceo", label: "پروفایل و سخن مدیرعامل" },
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
        {activeTab === "hero" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">بخش معرفی هیرو</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">سرتیتر کوچک (Eyebrow Fa)</label>
                <input
                  type="text"
                  value={form.heroEyebrowFa}
                  onChange={(e) => setForm({ ...form, heroEyebrowFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">Eyebrow (English)</label>
                <input
                  type="text"
                  value={form.heroEyebrowEn}
                  onChange={(e) => setForm({ ...form, heroEyebrowEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">عنوان اصلی هیرو (فارسی)</label>
                <input
                  type="text"
                  value={form.heroTitleFa}
                  onChange={(e) => setForm({ ...form, heroTitleFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">Main Headline (English)</label>
                <input
                  type="text"
                  value={form.heroTitleEn}
                  onChange={(e) => setForm({ ...form, heroTitleEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">توضیح پاراگراف هیرو (Caption Fa)</label>
                <textarea
                  rows={3}
                  value={form.heroCaptionFa}
                  onChange={(e) => setForm({ ...form, heroCaptionFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Hero Image */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">تصویر شاخص بخش هیرو</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.heroImageUrl ? (
                      <Image src={form.heroImageUrl} alt="Hero" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون تصویر</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.heroImageUrl}
                      onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("heroImage")}
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

        {activeTab === "intro" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">دیدگاه استراتژیک و فلسفه کاری</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">سرتیتر دیدگاه (Eyebrow Fa)</label>
                <input
                  type="text"
                  value={form.introEyebrowFa}
                  onChange={(e) => setForm({ ...form, introEyebrowFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">عنوان اصلی دیدگاه (فارسی)</label>
                <input
                  type="text"
                  value={form.introTitleFa}
                  onChange={(e) => setForm({ ...form, introTitleFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">پاراگراف لید و رویکرد اولیه (Intro Lead Fa)</label>
                <textarea
                  rows={3}
                  value={form.introLeadFa}
                  onChange={(e) => setForm({ ...form, introLeadFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">رویکرد مهندسی و ارزش‌آفرینی (Intro Approach Fa)</label>
                <textarea
                  rows={3}
                  value={form.introApproachFa}
                  onChange={(e) => setForm({ ...form, introApproachFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "values" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">ارزش‌های بنیادین استودیو (Core Values)</h2>
                <p className="text-xs text-[#8fa397] mt-1">
                  کارت‌های ارزش‌های سازمانی و اصول مهندسی نمایش داده شده در صفحه درباره ما
                </p>
              </div>
              <button
                type="button"
                onClick={addCoreValue}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1f2623] text-emerald-400 hover:bg-[#28322d] border border-emerald-500/30"
              >
                + افزودن ارزش جدید
              </button>
            </div>

            <div className="space-y-4">
              {form.coreValues.map((val, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#101413] border border-[#232c27] space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400">ارزش ۰{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCoreValue(idx)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#8fa397] mb-1">عنوان فارسی ارزش</label>
                      <input
                        type="text"
                        value={val.titleFa}
                        onChange={(e) => updateCoreValue(idx, "titleFa", e.target.value)}
                        className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#8fa397] mb-1">نوع آیکون</label>
                      <select
                        value={val.icon}
                        onChange={(e) => updateCoreValue(idx, "icon", e.target.value)}
                        className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-2 py-2"
                      >
                        <option value="code">کد و مهندسی (code)</option>
                        <option value="sparkles">درخشش و دیزاین (sparkles)</option>
                        <option value="handshake">همکاری و شفافیت (handshake)</option>
                        <option value="chart">رشد و داده (chart)</option>
                        <option value="shield">امنیت و اطمینان (shield)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#8fa397] mb-1">شرح و توضیحات (فارسی)</label>
                    <textarea
                      rows={2}
                      value={val.descFa}
                      onChange={(e) => updateCoreValue(idx, "descFa", e.target.value)}
                      className="w-full bg-[#181d1b] border border-[#2a3530] text-white text-xs rounded-lg px-3 py-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "ceo" && (
          <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-bold text-white border-b border-[#232c27] pb-3">پروفایل و پیام مدیرعامل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">نام و نام خانوادگی مدیرعامل (فارسی)</label>
                <input
                  type="text"
                  value={form.ceoNameFa}
                  onChange={(e) => setForm({ ...form, ceoNameFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">سمت سازمانی (فارسی)</label>
                <input
                  type="text"
                  value={form.ceoRoleFa}
                  onChange={(e) => setForm({ ...form, ceoRoleFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* CEO Photo Picker */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">تصویر پرتره مدیرعامل</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {form.ceoPhotoUrl ? (
                      <Image src={form.ceoPhotoUrl} alt="CEO" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون عکس</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={form.ceoPhotoUrl}
                      onChange={(e) => setForm({ ...form, ceoPhotoUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("ceoPhoto")}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#8fa397] mb-2">نقل‌قول و دیدگاه کلیدی (Quote)</label>
                <textarea
                  rows={2}
                  value={form.ceoQuoteFa}
                  onChange={(e) => setForm({ ...form, ceoQuoteFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Media Picker */}
      {pickerTarget && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerTarget(null)}
          onSelect={(item: MediaItem) => {
            if (pickerTarget === "heroImage") {
              setForm((prev) => ({ ...prev, heroImageUrl: item.url }));
            } else {
              setForm((prev) => ({ ...prev, ceoPhotoUrl: item.url }));
            }
            setPickerTarget(null);
          }}
        />
      )}
    </div>
  );
}
