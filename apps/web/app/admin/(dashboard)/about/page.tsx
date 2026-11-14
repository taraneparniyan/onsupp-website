"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { adminFetch, BACKEND_URL } from "@/lib/adminApi";

type ContentForm = {
  eyebrowFa: string;
  eyebrowEn: string;
  titleFa: string;
  titleEn: string;
  ctaFa: string;
  ctaEn: string;
  ctaLink: string;
  imageUrl: string | null;
  imageAlt: string | null;
  subTitleFa: string;
  subTitleEn: string;
  paragraphFa: string;
  paragraphEn: string;
  leadFa?: string;
  leadEn?: string;
  approachFa?: string;
  approachEn?: string;
  heroCaptionFa?: string;
  heroCaptionEn?: string;
};

type CeoForm = {
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  quoteFa: string;
  quoteEn: string;
  bioFa: string;
  bioEn: string;
  avatarUrl: string | null;
  focalPoint: string;
  socialLinks: Array<{ platform: string; url: string }>;
  isPublished: boolean;
};

type CompanyValueItem = {
  id?: number;
  key: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  badgeFa: string;
  badgeEn: string;
  icon: string;
  position: number;
  isPublished: boolean;
};

const EMPTY_CONTENT: ContentForm = {
  eyebrowFa: "درباره آن‌ساپ",
  eyebrowEn: "About OnSupp",
  titleFa: "آدم‌هایی که پشت هر پروژه ایستاده‌اند",
  titleEn: "The people behind every project",
  ctaFa: "شروع همکاری",
  ctaEn: "Get in touch",
  ctaLink: "/contact",
  imageUrl: null,
  imageAlt: "عکس گروهی تیم آن‌ساپ",
  subTitleFa: "یک تیم، از استراتژی تا اجرا",
  subTitleEn: "One team, from strategy to delivery",
  paragraphFa: "",
  paragraphEn: "",
  leadFa: "ما در آن‌ساپ باور داریم که محصولات دیجیتال پایدار، از تلاقی مهندسی دقیق و هنر خلق تجربه کاربری متولد می‌شوند.",
  leadEn: "At OnSupp, we believe sustainable digital products arise from the convergence of precise engineering and craft.",
  approachFa: "رویکرد ما مشارکت فعال در چرخه عمر محصول مشتری است، نه صرفاً تحویل یک پروژه ایستا.",
  approachEn: "Our approach is active partnership throughout the product lifecycle, not just static project delivery.",
  heroCaptionFa: "استودیو مرکزی و اتاق فکر فنی آن‌ساپ",
  heroCaptionEn: "OnSupp Central Studio & Innovation Hub",
};

const EMPTY_CEO: CeoForm = {
  nameFa: "آرش افشار",
  nameEn: "Arash Afshar",
  roleFa: "بنیان‌گذار و مدیر ارشد اجرایی (CEO)",
  roleEn: "Founder & Chief Executive Officer",
  quoteFa: "کیفیت یک ویژگی اختیاری نیست؛ بلکه هسته اصلی هویت محصولاتی است که می‌سازیم.",
  quoteEn: "Quality is not an optional feature; it is the core foundation of everything we craft.",
  bioFa: "بیش از یک دهه تجربه در هدایت پروژه‌های تحول دیجیتال، معماری نرم‌افزارهای توزیع‌شده سازمانی و راه‌اندازی استارتاپ‌های فناورانه با میلیون‌ها کاربر فعال.",
  bioEn: "Over a decade of leadership in digital transformation, distributed software architecture, and high-scale consumer startups.",
  avatarUrl: null,
  focalPoint: "50% 20%",
  socialLinks: [
    { platform: "linkedin", url: "https://linkedin.com/in/arash-afshar" },
    { platform: "twitter", url: "https://twitter.com/arash_afshar" },
  ],
  isPublished: true,
};

const EMPTY_VALUE: CompanyValueItem = {
  key: "clarity",
  titleFa: "شفافیت مطلق",
  titleEn: "Radical Clarity",
  descriptionFa: "ارتباط صریح و شفاف در هر مرحله؛ از تخمین زمان تا گزارش عملکرد فنی.",
  descriptionEn: "Uncompromising clarity in communication and engineering execution.",
  badgeFa: "اصل اول",
  badgeEn: "Principle 01",
  icon: "check",
  position: 0,
  isPublished: true,
};

export default function AboutAdminPage() {
  const [activeTab, setActiveTab] = useState<"narrative" | "ceo" | "values">("narrative");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Tab 1: Narrative & Features
  const [content, setContent] = useState<ContentForm>(EMPTY_CONTENT);
  const [savingContent, setSavingContent] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"aboutImage" | "ceoAvatar" | null>(null);

  // Tab 2: CEO Profile
  const [ceo, setCeo] = useState<CeoForm>(EMPTY_CEO);
  const [savingCeo, setSavingCeo] = useState(false);

  // Tab 3: Company Values
  const [values, setValues] = useState<CompanyValueItem[]>([]);
  const [valueModalOpen, setValueModalOpen] = useState(false);
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [valueForm, setValueForm] = useState<CompanyValueItem>(EMPTY_VALUE);
  const [savingValue, setSavingValue] = useState(false);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  // Fetch initial data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [aboutRes, ceoRes, valuesRes] = await Promise.all([
        adminFetch("/api/v1/about", { cache: "no-store" }),
        adminFetch("/api/v1/about/ceo", { cache: "no-store" }),
        adminFetch("/api/v1/about/values", { cache: "no-store" }),
      ]);

      if (aboutRes.ok) {
        const d = await aboutRes.json();
        if (d?.content) setContent({ ...EMPTY_CONTENT, ...d.content });
      }

      if (ceoRes.ok) {
        const d = await ceoRes.json();
        if (d) {
          setCeo({
            ...EMPTY_CEO,
            ...d,
            socialLinks: Array.isArray(d.socialLinks) && d.socialLinks.length > 0 ? d.socialLinks : EMPTY_CEO.socialLinks,
          });
        }
      }

      if (valuesRes.ok) {
        const d = await valuesRes.json();
        if (Array.isArray(d)) {
          setValues(d.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
        }
      }
    } catch {
      notify("err", "خطا در دریافت اطلاعات صفحه درباره ما");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Tab 1 Save
  const handleContentSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContent(true);
    try {
      const res = await adminFetch("/api/v1/about", {
        method: "PUT",
        body: JSON.stringify(content),
      });
      if (res.ok) {
        notify("ok", "روایت و تنظیمات متنی صفحه با موفقیت ذخیره شد.");
      } else {
        const d = await res.json().catch(() => ({}));
        notify("err", d.error || "خطا در ذخیره روایت");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ذخیره محتوا");
    } finally {
      setSavingContent(false);
    }
  };

  // Handle Tab 2 Save (CEO Profile)
  const handleCeoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCeo(true);
    try {
      const res = await adminFetch("/api/v1/about/ceo", {
        method: "PUT",
        body: JSON.stringify({
          ...ceo,
          socialLinks: ceo.socialLinks.filter((s) => s.url.trim().length > 0),
        }),
      });
      if (res.ok) {
        notify("ok", "اطلاعات پروفایل مدیرعامل با موفقیت به‌روز شد.");
      } else {
        const d = await res.json().catch(() => ({}));
        notify("err", d.error || "خطا در ذخیره پروفایل مدیرعامل");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ارتباط با سرور");
    } finally {
      setSavingCeo(false);
    }
  };

  // Values CRUD
  const openCreateValue = () => {
    setEditingValueId(null);
    setValueForm({
      ...EMPTY_VALUE,
      key: `principle-${values.length + 1}`,
      badgeFa: `اصل ۰${values.length + 1}`,
      position: values.length,
    });
    setValueModalOpen(true);
  };

  const openEditValue = (val: CompanyValueItem) => {
    setEditingValueId(val.id || null);
    setValueForm(val);
    setValueModalOpen(true);
  };

  const handleValueSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueForm.key.trim() || !valueForm.titleFa.trim() || !valueForm.descriptionFa.trim()) {
      notify("err", "کلید، عنوان و توضیحات فارسی الزامی هستند.");
      return;
    }
    setSavingValue(true);
    const isEdit = !!editingValueId;
    const endpoint = isEdit ? `/api/v1/about/values/${editingValueId}` : "/api/v1/about/values";
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify({
          ...valueForm,
          position: Number(valueForm.position) || 0,
        }),
      });
      if (res.ok) {
        notify("ok", isEdit ? "ارزش سازمانی به‌روزرسانی شد." : "ارزش جدید با موفقیت ثبت شد.");
        setValueModalOpen(false);
        const refetch = await adminFetch("/api/v1/about/values");
        if (refetch.ok) setValues(await refetch.json());
      } else {
        const d = await res.json().catch(() => ({}));
        notify("err", d.error || "ذخیره ناموفق بود.");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setSavingValue(false);
    }
  };

  const handleDeleteValue = async (val: CompanyValueItem) => {
    if (!val.id) return;
    if (!confirm(`ارزش سازمانی "${val.titleFa}" حذف شود؟`)) return;
    try {
      const res = await adminFetch(`/api/v1/about/values/${val.id}`, { method: "DELETE" });
      if (res.ok) {
        setValues((prev) => prev.filter((v) => v.id !== val.id));
        notify("ok", "ارزش سازمانی حذف شد.");
      } else {
        notify("err", "حذف ناموفق بود.");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    }
  };

  // Media Selection
  const handleMediaSelect = (media: MediaItem) => {
    if (pickerTarget === "aboutImage") {
      setContent((prev) => ({ ...prev, imageUrl: media.url, imageAlt: media.alt || prev.imageAlt }));
    } else if (pickerTarget === "ceoAvatar") {
      setCeo((prev) => ({ ...prev, avatarUrl: media.url }));
    }
    setPickerTarget(null);
  };

  // CEO Social Link helpers
  const addCeoSocial = () => {
    setCeo((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "linkedin", url: "" }],
    }));
  };

  const updateCeoSocial = (idx: number, key: "platform" | "url", val: string) => {
    setCeo((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) => (i === idx ? { ...s, [key]: val } : s)),
    }));
  };

  const removeCeoSocial = (idx: number) => {
    setCeo((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-muted" dir="rtl">
        <div className="inline-block w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>در حال بارگذاری اطلاعات صفحه درباره ما...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-mint/10 text-mint border border-mint/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            مدیریت محتوای صفحه درباره ما
          </h1>
          <p className="text-sm text-muted mt-1">
            ویرایش جامع متون هیرو، بیوگرافی و دیدگاه مدیرعامل، و ارزش‌های بنیادین سازمانی آن‌ساپ
          </p>
        </div>
      </div>

      {/* Notification Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            message.type === "ok"
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border-rose-500/20"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            بستن
          </button>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("narrative")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "narrative"
              ? "bg-mint/15 text-mint border border-mint/30"
              : "text-muted hover:text-foreground hover:bg-raised"
          }`}
        >
          ۱. روایت، هیرو و تصویر اصلی
        </button>
        <button
          onClick={() => setActiveTab("ceo")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "ceo"
              ? "bg-mint/15 text-mint border border-mint/30"
              : "text-muted hover:text-foreground hover:bg-raised"
          }`}
        >
          ۲. پروفایل و پیام مدیرعامل
        </button>
        <button
          onClick={() => setActiveTab("values")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            activeTab === "values"
              ? "bg-mint/15 text-mint border border-mint/30"
              : "text-muted hover:text-foreground hover:bg-raised"
          }`}
        >
          ۳. ارزش‌های سازمانی ({values.length})
        </button>
      </div>

      {/* TAB 1: NARRATIVE & HERO */}
      {activeTab === "narrative" && (
        <form onSubmit={handleContentSave} className="space-y-6">
          <div className="bg-panel border border-border rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint"></span>
              تیترها و بیانیه‌های استراتژیک هیرو
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  پیش‌تیتر (Eyebrow Fa)
                </label>
                <input
                  type="text"
                  value={content.eyebrowFa}
                  onChange={(e) => setContent({ ...content, eyebrowFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Eyebrow (English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={content.eyebrowEn}
                  onChange={(e) => setContent({ ...content, eyebrowEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  تیتر اصلی بخش هیرو (Title Fa) *
                </label>
                <input
                  type="text"
                  required
                  value={content.titleFa}
                  onChange={(e) => setContent({ ...content, titleFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Main Hero Title (English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={content.titleEn}
                  onChange={(e) => setContent({ ...content, titleEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  عنوان بخش مقدمه و معرفی (Sub Title Fa)
                </label>
                <input
                  type="text"
                  value={content.subTitleFa}
                  onChange={(e) => setContent({ ...content, subTitleFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Intro Subtitle (English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={content.subTitleEn}
                  onChange={(e) => setContent({ ...content, subTitleEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            {/* Strategic Narrative / Lead & Approach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  پاراگراف لید / مانیفست اصلی (Lead Fa)
                </label>
                <textarea
                  rows={3}
                  value={content.leadFa || ""}
                  onChange={(e) => setContent({ ...content, leadFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  رویکرد اجرایی و عملیاتی (Approach Fa)
                </label>
                <textarea
                  rows={3}
                  value={content.approachFa || ""}
                  onChange={(e) => setContent({ ...content, approachFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
            </div>

            {/* Main Picture */}
            <div className="p-4 rounded-2xl bg-raised/70 border border-border space-y-3">
              <label className="block text-xs font-semibold text-muted">
                تصویر عریض هیرو (عکس دسته‌جمعی یا فضای کاری تیم)
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {content.imageUrl ? (
                  <div className="w-36 h-24 rounded-xl overflow-hidden relative border border-mint/40 bg-raised shrink-0">
                    <Image
                      src={content.imageUrl}
                      alt={content.imageAlt || "About Hero"}
                      fill
                      className="object-cover"
                      sizes="144px"
                    />
                  </div>
                ) : (
                  <div className="w-36 h-24 rounded-xl border-2 border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                    بدون تصویر
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={content.imageUrl || ""}
                      onChange={(e) => setContent({ ...content, imageUrl: e.target.value })}
                      placeholder="مسیر فایل یا انتخاب از کتابخانه..."
                      className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-mint"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("aboutImage")}
                      className="px-4 py-2 rounded-xl bg-mint/15 text-mint border border-mint/30 text-xs font-medium hover:bg-mint/25 transition-colors shrink-0 cursor-pointer"
                    >
                      کتابخانه رسانه
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={content.imageAlt || ""}
                      onChange={(e) => setContent({ ...content, imageAlt: e.target.value })}
                      placeholder="متن جایگزین (Alt تصویر)..."
                      className="bg-panel border border-border rounded-xl px-3 py-1.5 text-xs text-foreground"
                    />
                    <input
                      type="text"
                      value={content.heroCaptionFa || ""}
                      onChange={(e) => setContent({ ...content, heroCaptionFa: e.target.value })}
                      placeholder="زیرنویس عکس هیرو (Caption)..."
                      className="bg-panel border border-border rounded-xl px-3 py-1.5 text-xs text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">متن دکمه CTA (Fa)</label>
                <input
                  type="text"
                  value={content.ctaFa}
                  onChange={(e) => setContent({ ...content, ctaFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">CTA Label (En)</label>
                <input
                  type="text"
                  dir="ltr"
                  value={content.ctaEn}
                  onChange={(e) => setContent({ ...content, ctaEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">لینک مقصد دکمه</label>
                <input
                  type="text"
                  dir="ltr"
                  value={content.ctaLink}
                  onChange={(e) => setContent({ ...content, ctaLink: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={savingContent}
                className="px-6 py-2.5 rounded-xl bg-lime text-ink font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {savingContent && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                ذخیره تغییرات روایت و هیرو
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: CEO PROFILE */}
      {activeTab === "ceo" && (
        <form onSubmit={handleCeoSave} className="space-y-6">
          <div className="bg-panel border border-border rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-mint"></span>
              مشخصات و دیدگاه مدیرعامل (CEO Executive Profile)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  نام و نام خانوادگی مدیرعامل (Fa) *
                </label>
                <input
                  type="text"
                  required
                  value={ceo.nameFa}
                  onChange={(e) => setCeo({ ...ceo, nameFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Executive Full Name (En)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={ceo.nameEn}
                  onChange={(e) => setCeo({ ...ceo, nameEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  سمت رسمی (Fa) *
                </label>
                <input
                  type="text"
                  required
                  value={ceo.roleFa}
                  onChange={(e) => setCeo({ ...ceo, roleFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Title & Role (En)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={ceo.roleEn}
                  onChange={(e) => setCeo({ ...ceo, roleEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint"
                />
              </div>
            </div>

            {/* CEO Portrait Avatar */}
            <div className="p-4 rounded-2xl bg-raised/70 border border-border space-y-3">
              <label className="block text-xs font-semibold text-muted">
                پرتره رسمی استودیویی مدیرعامل
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {ceo.avatarUrl ? (
                  <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-mint/40 bg-raised shrink-0">
                    <Image
                      src={ceo.avatarUrl}
                      alt={ceo.nameFa}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                    بدون تصویر
                  </div>
                )}

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      dir="ltr"
                      value={ceo.avatarUrl || ""}
                      onChange={(e) => setCeo({ ...ceo, avatarUrl: e.target.value })}
                      placeholder="مسیر فایل یا انتخاب از رسانه‌ها..."
                      className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-mint"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerTarget("ceoAvatar")}
                      className="px-4 py-2 rounded-xl bg-mint/15 text-mint border border-mint/30 text-xs font-medium hover:bg-mint/25 transition-colors shrink-0 cursor-pointer"
                    >
                      کتابخانه رسانه
                    </button>
                    {ceo.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setCeo({ ...ceo, avatarUrl: null })}
                        className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs hover:bg-rose-500/20"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] text-muted">مرکز فوکوس تصویر (Focal Point):</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={ceo.focalPoint}
                      onChange={(e) => setCeo({ ...ceo, focalPoint: e.target.value })}
                      className="bg-panel border border-border rounded-lg px-2 py-1 text-xs text-foreground w-28 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CEO Quote & Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  دیدگاه و نقل‌قول برجسته (Quote Fa)
                </label>
                <textarea
                  rows={3}
                  value={ceo.quoteFa}
                  onChange={(e) => setCeo({ ...ceo, quoteFa: e.target.value })}
                  placeholder="جمله‌ای استراتژیک از زبان مدیرعامل..."
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Executive Quote (En)
                </label>
                <textarea
                  rows={3}
                  dir="ltr"
                  value={ceo.quoteEn}
                  onChange={(e) => setCeo({ ...ceo, quoteEn: e.target.value })}
                  placeholder="Key strategic quote..."
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  شرح بیوگرافی و سوابق (Bio Fa)
                </label>
                <textarea
                  rows={4}
                  value={ceo.bioFa}
                  onChange={(e) => setCeo({ ...ceo, bioFa: e.target.value })}
                  placeholder="توضیحات مفصل سوابق اجرایی..."
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1.5">
                  Full Biography (En)
                </label>
                <textarea
                  rows={4}
                  dir="ltr"
                  value={ceo.bioEn}
                  onChange={(e) => setCeo({ ...ceo, bioEn: e.target.value })}
                  placeholder="Detailed leadership background..."
                  className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-mint resize-none"
                />
              </div>
            </div>

            {/* CEO Social Links */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-muted">
                  لینک‌های ارتباطی و شبکه‌های اجتماعی مدیرعامل
                </label>
                <button
                  type="button"
                  onClick={addCeoSocial}
                  className="text-xs text-mint hover:opacity-80 cursor-pointer font-medium"
                >
                  + افزودن لینک جدید
                </button>
              </div>

              <div className="space-y-2">
                {ceo.socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={link.platform}
                      onChange={(e) => updateCeoSocial(idx, "platform", e.target.value)}
                      className="bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-mint"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">X / Twitter</option>
                      <option value="github">GitHub</option>
                      <option value="email">Email</option>
                      <option value="website">وب‌سایت شخصی</option>
                    </select>
                    <input
                      type="text"
                      dir="ltr"
                      value={link.url}
                      onChange={(e) => updateCeoSocial(idx, "url", e.target.value)}
                      placeholder="https://..."
                      className="flex-1 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-mint"
                    />
                    <button
                      type="button"
                      onClick={() => removeCeoSocial(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={savingCeo}
                className="px-6 py-2.5 rounded-xl bg-lime text-ink font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {savingCeo && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                )}
                ذخیره پروفایل مدیرعامل
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: COMPANY VALUES */}
      {activeTab === "values" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint"></span>
                ارزش‌های بنیادین و اصول کاری آن‌ساپ (Company Values)
              </h2>
              <p className="text-xs text-muted mt-0.5">
                اصول سه‌گانه یا چندگانه نمایش داده شده در بخش دوم صفحه درباره ما
              </p>
            </div>
            <button
              onClick={openCreateValue}
              className="px-4 py-2 rounded-xl bg-lime text-ink text-xs font-semibold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              + افزودن اصل جدید
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((val, idx) => (
              <div
                key={val.id || idx}
                className="bg-panel border border-border rounded-2xl p-5 space-y-4 hover:border-mint/40 transition-colors relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-mint/10 text-mint border border-mint/25">
                    {val.badgeFa || `اصل ${idx + 1}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditValue(val)}
                      className="p-1.5 rounded-lg bg-raised text-foreground hover:bg-mint/15 hover:text-mint text-xs cursor-pointer"
                      title="ویرایش"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteValue(val)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs cursor-pointer"
                      title="حذف"
                    >
                      حذف
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-foreground text-base">{val.titleFa}</h3>
                  <p className="text-xs text-muted font-mono mt-0.5">{val.titleEn}</p>
                </div>

                <p className="text-xs text-muted leading-relaxed line-clamp-3">
                  {val.descriptionFa}
                </p>

                <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted">
                  <span>کلید شناسه: <code className="text-mint">{val.key}</code></span>
                  <span>ترتیب: {val.position}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Value Create / Edit Modal */}
      {valueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-mint"></span>
                {editingValueId ? "ویرایش ارزش سازمانی" : "افزودن اصل جدید به ارزش‌ها"}
              </h3>
              <button
                onClick={() => setValueModalOpen(false)}
                className="text-muted hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleValueSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">کلید یکتا (Key) *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={valueForm.key}
                    onChange={(e) => setValueForm({ ...valueForm, key: e.target.value })}
                    placeholder="clarity / craft / partnership"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">برچسب کوچک (Badge Fa)</label>
                  <input
                    type="text"
                    value={valueForm.badgeFa}
                    onChange={(e) => setValueForm({ ...valueForm, badgeFa: e.target.value })}
                    placeholder="مثال: اصل اول"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">عنوان (Fa) *</label>
                  <input
                    type="text"
                    required
                    value={valueForm.titleFa}
                    onChange={(e) => setValueForm({ ...valueForm, titleFa: e.target.value })}
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Title (En)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={valueForm.titleEn}
                    onChange={(e) => setValueForm({ ...valueForm, titleEn: e.target.value })}
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">توضیح کامل ارزش (Fa) *</label>
                <textarea
                  rows={3}
                  required
                  value={valueForm.descriptionFa}
                  onChange={(e) => setValueForm({ ...valueForm, descriptionFa: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Description (En)</label>
                <textarea
                  rows={2}
                  dir="ltr"
                  value={valueForm.descriptionEn}
                  onChange={(e) => setValueForm({ ...valueForm, descriptionEn: e.target.value })}
                  className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">ترتیب نمایش (Position)</label>
                  <input
                    type="number"
                    value={valueForm.position}
                    onChange={(e) => setValueForm({ ...valueForm, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="valPublished"
                    checked={valueForm.isPublished}
                    onChange={(e) => setValueForm({ ...valueForm, isPublished: e.target.checked })}
                    className="w-4 h-4 rounded bg-raised border-border accent-[#38534a]"
                  />
                  <label htmlFor="valPublished" className="text-xs font-medium text-muted cursor-pointer">
                    فعال و قابل نمایش در سایت
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setValueModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-raised border border-border text-xs text-muted hover:text-foreground"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={savingValue}
                  className="px-5 py-2 rounded-xl bg-lime text-ink text-xs font-semibold hover:opacity-90 cursor-pointer"
                >
                  {savingValue ? "در حال ذخیره..." : editingValueId ? "ذخیره تغییرات" : "ایجاد اصل"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {pickerTarget && (
        <MediaPickerModal
          open={true}
          onSelect={handleMediaSelect}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
}
