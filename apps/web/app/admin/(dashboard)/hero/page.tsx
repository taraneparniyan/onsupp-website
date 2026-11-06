"use client";

import { useCallback, useEffect, useState } from "react";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";
import { adminFetch, BACKEND_URL } from "@/lib/adminApi";

type SlideForm = {
  id?: number;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  ctaText: string;
  ctaTextEn: string;
  ctaLink: string;
  ctaText2: string;
  ctaText2En: string;
  ctaLink2: string;
  imageUrl: string | null;
  imageAlt: string | null;
  position: number;
};

const EMPTY_SLIDE = (position: number): SlideForm => ({
  title: "",
  titleEn: "",
  subtitle: "",
  subtitleEn: "",
  ctaText: "",
  ctaTextEn: "",
  ctaLink: "#contact",
  ctaText2: "",
  ctaText2En: "",
  ctaLink2: "#contact",
  imageUrl: null,
  imageAlt: null,
  position,
});

function toPayload(s: SlideForm) {
  return {
    title: s.title,
    titleEn: s.titleEn,
    subtitle: s.subtitle,
    subtitleEn: s.subtitleEn,
    ctaText: s.ctaText,
    ctaTextEn: s.ctaTextEn,
    ctaLink: s.ctaLink,
    ctaText2: s.ctaText2,
    ctaText2En: s.ctaText2En,
    ctaLink2: s.ctaLink2,
    imageUrl: s.imageUrl,
    imageAlt: s.imageAlt,
    position: s.position,
  };
}

export default function HeroAdminPage() {
  const [items, setItems] = useState<SlideForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [pickerIdx, setPickerIdx] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    adminFetch("/api/v1/hero", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setItems(data.map((s) => ({ ...s, position: s.position ?? 0 })));
      })
      .catch(() => notify("err", "خطا در دریافت اسلایدها"))
      .finally(() => setLoading(false));
  }, [notify]);

  const update = (index: number, field: keyof SlideForm, value: string | null) => {
    setItems((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSelectMedia = (media: MediaItem) => {
    if (pickerIdx === null) return;
    update(pickerIdx, "imageUrl", media.url);
    update(pickerIdx, "imageAlt", media.alt);
    setPickerIdx(null);
  };

  const save = async (index: number) => {
    const slide = items[index];
    if (!slide.title.trim() && !slide.titleEn.trim()) {
      notify("err", "عنوان اسلاید الزامی است");
      return;
    }

    const key = slide.id ? String(slide.id) : `new-${index}`;
    setSavingKey(key);
    try {
      const endpoint = slide.id
        ? `/api/v1/hero/${slide.id}`
        : "/api/v1/hero";
      const res = await adminFetch(endpoint, {
        method: slide.id ? "PUT" : "POST",
        body: JSON.stringify(toPayload(slide)),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("err", data.error || "ذخیره ناموفق بود");
        return;
      }
      setItems((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...data, id: data.id } : s)),
      );
      notify("ok", "اسلاید با موفقیت ذخیره شد");
    } catch {
      notify("err", "خطا در ارتباط با سرور");
    } finally {
      setSavingKey(null);
    }
  };

  const remove = async (index: number) => {
    if (!confirm("این اسلاید حذف شود؟")) return;
    const slide = items[index];
    if (slide.id) {
      await adminFetch(`/api/v1/hero/${slide.id}`, { method: "DELETE" });
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    notify("ok", "اسلاید حذف شد");
  };

  const addNew = () => {
    setItems((prev) => [...prev, EMPTY_SLIDE(prev.length)]);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const arr = items.map((s) => ({ ...s }));
    const a = { ...arr[index], position: arr[j].position };
    const b = { ...arr[j], position: arr[index].position };
    arr[index] = b;
    arr[j] = a;
    setItems(arr);

    if (a.id && b.id) {
      try {
        await Promise.all([
          adminFetch(`/api/v1/hero/${a.id}`, {
            method: "PUT",
            body: JSON.stringify(toPayload(a)),
          }),
          adminFetch(`/api/v1/hero/${b.id}`, {
            method: "PUT",
            body: JSON.stringify(toPayload(b)),
          }),
        ]);
      } catch {
        /* reorder persistence failure is non-critical */
      }
    }
  };

  if (loading) return <div className="p-8 text-mint">در حال بارگذاری اسلایدها...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">مدیریت اسلایدر هیرو</h2>
          <p className="text-mint text-sm mt-1">افزودن، ویرایش متون دو زبانه و مرتب‌سازی اسلایدهای اصلی صفحه نخست.</p>
        </div>
        <button
          type="button"
          onClick={addNew}
          className="bg-lime text-ink px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all border border-primary/40 flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          افزودن اسلاید جدید
        </button>
      </div>

      {message && (
        <div
          className={`text-sm px-5 py-3.5 rounded-lg border ${
            message.type === "ok"
              ? "text-mint bg-panel border-primary/20"
              : "text-burgundy bg-burgundy/10 border-burgundy/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {items.length === 0 && (
          <div className="bg-panel rounded-xl border border-dashed border-foreground/10 p-16 text-center text-mint">
            هنوز هیچ اسلایدی ایجاد نشده است. روی «افزودن اسلاید جدید» کلیک کنید.
          </div>
        )}

        {items.map((slide, index) => {
          const key = slide.id ? String(slide.id) : `new-${index}`;
          const saving = savingKey === key;
          const previewSrc = slide.imageUrl
            ? slide.imageUrl.startsWith("http")
              ? slide.imageUrl
              : `${BACKEND_URL}${slide.imageUrl}`
            : null;

          return (
            <div key={key} className="bg-panel rounded-xl shadow-md border border-foreground/10 p-7 space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised border border-primary/20 text-mint font-black text-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-white text-base">
                    اسلاید {index + 1}
                    {!slide.id && <span className="text-xs text-mint mr-2 bg-mint/10 px-2 py-0.5 rounded-full border border-mint/20">(جدید)</span>}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="انتقال به بالا"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white hover:border-[#3f6b59] disabled:opacity-30 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label="انتقال به پایین"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white hover:border-[#3f6b59] disabled:opacity-30 transition-all"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    aria-label="حذف اسلاید"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">عنوان فارسی (FA)</label>
                      <input
                        value={slide.title}
                        onChange={(e) => update(index, "title", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">عنوان انگلیسی (EN)</label>
                      <input
                        value={slide.titleEn}
                        onChange={(e) => update(index, "titleEn", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">زیرعنوان فارسی (FA)</label>
                      <textarea
                        value={slide.subtitle}
                        onChange={(e) => update(index, "subtitle", e.target.value)}
                        rows={3}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">زیرعنوان انگلیسی (EN)</label>
                      <textarea
                        value={slide.subtitleEn}
                        onChange={(e) => update(index, "subtitleEn", e.target.value)}
                        rows={3}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">دکمه اول (FA)</label>
                      <input
                        value={slide.ctaText}
                        onChange={(e) => update(index, "ctaText", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">دکمه اول (EN)</label>
                      <input
                        value={slide.ctaTextEn}
                        onChange={(e) => update(index, "ctaTextEn", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">لینک دکمه اول</label>
                      <input
                        value={slide.ctaLink}
                        onChange={(e) => update(index, "ctaLink", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-3 py-2 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-xs font-semibold text-mint">تصویر اسلاید</label>
                  <div className="flex-1 border-2 border-dashed border-foreground/10 rounded-lg flex flex-col items-center justify-center p-5 text-center hover:border-[#3f6b59] transition-colors bg-panel">
                    {previewSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewSrc}
                        alt={slide.imageAlt || "اسلاید"}
                        className="w-full max-h-44 object-cover rounded-xl mb-3 shadow-md"
                      />
                    ) : (
                      <div className="text-mint text-sm mb-3">تصویری انتخاب نشده است</div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPickerIdx(index)}
                      className="bg-raised border border-primary/30 text-mint px-5 py-2 rounded-xl text-xs font-bold hover:bg-primary/15 transition-all cursor-pointer"
                    >
                      {previewSrc ? "تغییر تصویر" : "انتخاب از کتابخانه رسانه"}
                    </button>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-foreground/70">متن جایگزین تصویر (Alt Text)</label>
                    <input
                      type="text"
                      value={slide.imageAlt || ""}
                      onChange={(e) => update(index, "imageAlt", e.target.value)}
                      placeholder="متن جایگزین تصویر (برای تصاویر تزئینی خالی بگذارید)..."
                      className="w-full bg-raised border border-foreground/15 text-xs text-foreground rounded-xl px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => save(index)}
                  disabled={saving}
                  className="bg-lime text-ink px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all border border-primary/40 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "در حال ذخیره..." : slide.id ? "ذخیره تغییرات اسلاید" : "ایجاد اسلاید"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <MediaPickerModal
        open={pickerIdx !== null}
        onClose={() => setPickerIdx(null)}
        onSelect={handleSelectMedia}
      />
    </div>
  );
}

