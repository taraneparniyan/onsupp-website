"use client";

import { useCallback, useEffect, useState } from "react";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { adminFetch, BACKEND_URL } from "@/lib/adminApi";

const ICON_OPTIONS = [
  { key: "team", label: "تیم" },
  { key: "data", label: "داده" },
  { key: "support", label: "پشتیبانی" },
  { key: "results", label: "نتایج" },
];

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
};

type FeatureForm = {
  id?: number;
  titleFa: string;
  titleEn: string;
  icon: string;
  position: number;
};

const EMPTY_CONTENT: ContentForm = {
  eyebrowFa: "",
  eyebrowEn: "",
  titleFa: "",
  titleEn: "",
  ctaFa: "",
  ctaEn: "",
  ctaLink: "#contact",
  imageUrl: null,
  imageAlt: null,
  subTitleFa: "",
  subTitleEn: "",
  paragraphFa: "",
  paragraphEn: "",
};

export default function AboutAdminPage() {
  const [content, setContent] = useState<ContentForm>(EMPTY_CONTENT);
  const [features, setFeatures] = useState<FeatureForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    adminFetch("/api/v1/about", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.content) setContent({ ...EMPTY_CONTENT, ...data.content });
        if (Array.isArray(data?.features)) {
          const f: FeatureForm[] = data.features.map((x: FeatureForm) => ({
            id: x.id,
            titleFa: x.titleFa ?? "",
            titleEn: x.titleEn ?? "",
            icon: x.icon ?? "team",
            position: x.position ?? 0,
          }));
          setFeatures(f);
        }
      })
      .catch(() => notify("err", "خطا در دریافت محتوای درباره ما"))
      .finally(() => setLoading(false));
  }, [notify]);

  const updateContent = (field: keyof ContentForm, value: string) => {
    setContent((prev) => ({ ...prev, [field]: value }));
  };

  const handleContentSave = async () => {
    if (!content.titleFa.trim() && !content.titleEn.trim()) {
      notify("err", "عنوان الزامی است");
      return;
    }
    if (content.imageUrl && !content.imageAlt?.trim()) {
      notify("err", "برای تصویر، متن جایگزین (Alt) الزامی است");
      return;
    }
    setSavingContent(true);
    try {
      const res = await adminFetch("/api/v1/about", {
        method: "PUT",
        body: JSON.stringify(content),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("err", data.error || "ذخیره ناموفق بود");
        return;
      }
      notify("ok", "محتوای درباره ما ذخیره شد");
    } catch {
      notify("err", "خطا در ارتباط با سرور");
    } finally {
      setSavingContent(false);
    }
  };

  const updateFeature = (index: number, field: string, value: string) => {
    setFeatures((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const saveFeature = async (index: number) => {
    const feature = features[index];
    if (!feature.titleFa.trim() && !feature.titleEn.trim()) {
      notify("err", "عنوان ویژگی الزامی است");
      return;
    }
    const key = feature.id ? String(feature.id) : `new-${index}`;
    setSavingKey(key);
    try {
      const endpoint = feature.id
        ? `/api/v1/about/features/${feature.id}`
        : "/api/v1/about/features";
      const res = await adminFetch(endpoint, {
        method: feature.id ? "PUT" : "POST",
        body: JSON.stringify(feature),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("err", data.error || "ذخیره ناموفق بود");
        return;
      }
      setFeatures((prev) => prev.map((f, i) => (i === index ? { ...f, ...data, id: data.id } : f)));
      notify("ok", "ویژگی ذخیره شد");
    } catch {
      notify("err", "خطا در ارتباط با سرور");
    } finally {
      setSavingKey(null);
    }
  };

  const removeFeature = async (index: number) => {
    if (!confirm("این ویژگی حذف شود؟")) return;
    const feature = features[index];
    if (feature.id) {
      await adminFetch(`/api/v1/about/features/${feature.id}`, { method: "DELETE" });
    }
    setFeatures((prev) => prev.filter((_, i) => i !== index));
    notify("ok", "ویژگی حذف شد");
  };

  const addFeature = () => {
    setFeatures((prev) => [...prev, { titleFa: "", titleEn: "", icon: "team", position: prev.length }]);
  };

  const moveFeature = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= features.length) return;
    const arr = features.map((f) => ({ ...f }));
    const a = { ...arr[index], position: arr[j].position };
    const b = { ...arr[j], position: arr[index].position };
    arr[index] = b;
    arr[j] = a;
    setFeatures(arr);
    if (a.id && b.id) {
      try {
        await Promise.all([
          adminFetch(`/api/v1/about/features/${a.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...a, id: undefined }),
          }),
          adminFetch(`/api/v1/about/features/${b.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...b, id: undefined }),
          }),
        ]);
      } catch {
        /* reorder persistence failure is non-critical */
      }
    }
  };

  if (loading) return <div className="p-8 text-mint">در حال بارگذاری اطلاعات درباره ما...</div>;

  const previewSrc = content.imageUrl
    ? content.imageUrl.startsWith("http")
      ? content.imageUrl
      : `${BACKEND_URL}${content.imageUrl}`
    : null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-8">
        <h2 className="text-2xl font-black text-white">مدیریت بخش درباره ما</h2>
        <p className="text-mint text-sm mt-1">ویرایش متون اصلی، توضیحات، تصاویر و باکس‌های ویژگی مربوط به شرکت.</p>
      </div>

      {message && (
        <div
          className={`text-sm px-5 py-3.5 rounded-lg border ${
            message.type === "ok" ? "text-mint bg-panel border-primary/20" : "text-rose-300 bg-[#2b1216] border-[#542129]"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content Form */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-7 space-y-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          محتوای متنی و تصویر
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">ایبرو (FA)</label>
                <input
                  value={content.eyebrowFa}
                  onChange={(e) => updateContent("eyebrowFa", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">ایبرو (EN)</label>
                <input
                  value={content.eyebrowEn}
                  onChange={(e) => updateContent("eyebrowEn", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">تیتر اصلی (FA)</label>
              <textarea
                value={content.titleFa}
                onChange={(e) => updateContent("titleFa", e.target.value)}
                rows={2}
                className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">تیتر اصلی (EN)</label>
              <textarea
                value={content.titleEn}
                onChange={(e) => updateContent("titleEn", e.target.value)}
                rows={2}
                className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">زیرتیتر (FA)</label>
                <input
                  value={content.subTitleFa}
                  onChange={(e) => updateContent("subTitleFa", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">زیرتیتر (EN)</label>
                <input
                  value={content.subTitleEn}
                  onChange={(e) => updateContent("subTitleEn", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">پاراگراف (FA)</label>
              <textarea
                value={content.paragraphFa}
                onChange={(e) => updateContent("paragraphFa", e.target.value)}
                rows={4}
                className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">پاراگراف (EN)</label>
              <textarea
                value={content.paragraphEn}
                onChange={(e) => updateContent("paragraphEn", e.target.value)}
                rows={4}
                className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">دکمه (FA)</label>
                <input
                  value={content.ctaFa}
                  onChange={(e) => updateContent("ctaFa", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">دکمه (EN)</label>
                <input
                  value={content.ctaEn}
                  onChange={(e) => updateContent("ctaEn", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">لینک دکمه</label>
                <input
                  value={content.ctaLink}
                  onChange={(e) => updateContent("ctaLink", e.target.value)}
                  className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-foreground/10">
          <div className="flex flex-col gap-3">
            <label className="block text-xs font-semibold text-mint">تصویر اصلی درباره ما</label>
            <div className="flex-1 border-2 border-dashed border-foreground/10 rounded-lg flex flex-col items-center justify-center p-5 text-center hover:border-[#3f6b59] transition-colors bg-panel">
              {previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewSrc}
                  alt={content.imageAlt || "درباره ما"}
                  className="w-full max-h-44 object-cover rounded-xl mb-3 shadow-md"
                />
              ) : (
                <div className="text-mint text-sm mb-3">تصویری انتخاب نشده است</div>
              )}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="bg-raised border border-primary/30 text-mint px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#255243] transition-all"
              >
                {previewSrc ? "تغییر تصویر" : "انتخاب از کتابخانه رسانه"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-mint mb-1.5">متن جایگزین تصویر (Alt)</label>
            <input
              value={content.imageAlt || ""}
              onChange={(e) => updateContent("imageAlt", e.target.value)}
              className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
              dir="ltr"
              placeholder="تصویر بخش درباره ما"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-foreground/10 flex justify-end">
          <button
            type="button"
            onClick={handleContentSave}
            disabled={savingContent}
            className="bg-gradient-to-r from-primary to-primary-hover text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all border border-primary/40 disabled:opacity-50"
          >
            {savingContent ? "در حال ذخیره..." : "ذخیره محتوای درباره ما"}
          </button>
        </div>
      </div>

      {/* Feature Boxes */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-7 space-y-6">
        <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            باکس‌های ویژگی شرکت
          </h3>
          <button
            type="button"
            onClick={addFeature}
            className="bg-raised border border-primary/30 text-mint px-5 py-2 rounded-xl text-xs font-bold hover:bg-[#255243] transition-all flex items-center gap-1.5"
          >
            + افزودن ویژگی جدید
          </button>
        </div>

        {features.length === 0 && (
          <div className="border border-dashed border-foreground/10 rounded-lg p-10 text-center text-mint">
            هنوز هیچ ویژگی مشخصی افزوده نشده است.
          </div>
        )}

        <div className="space-y-4">
          {features.map((feature, index) => {
            const key = feature.id ? String(feature.id) : `new-${index}`;
            const saving = savingKey === key;
            return (
              <div key={key} className="border border-foreground/10 rounded-lg bg-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#18352b] text-mint text-xs font-bold border border-[#2b5748]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-white">ویژگی شماره {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveFeature(index, -1)}
                      disabled={index === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => moveFeature(index, 1)}
                      disabled={index === features.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-1">عنوان فارسی (FA)</label>
                    <input
                      value={feature.titleFa}
                      onChange={(e) => updateFeature(index, "titleFa", e.target.value)}
                      className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-1">عنوان انگلیسی (EN)</label>
                    <input
                      value={feature.titleEn}
                      onChange={(e) => updateFeature(index, "titleEn", e.target.value)}
                      className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-1">آیکون</label>
                    <select
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, "icon", e.target.value)}
                      className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                    >
                      {ICON_OPTIONS.map((opt) => (
                        <option key={opt.key} value={opt.key} className="bg-panel">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => saveFeature(index)}
                    disabled={saving}
                    className="bg-raised border border-primary/30 text-mint px-6 py-2 rounded-xl text-xs font-bold hover:bg-[#255243] transition-all disabled:opacity-50"
                  >
                    {saving ? "در حال ذخیره..." : feature.id ? "ذخیره تغییرات" : "ایجاد ویژگی"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(media: MediaItem) => {
          updateContent("imageUrl", media.url);
          updateContent("imageAlt", media.alt);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}