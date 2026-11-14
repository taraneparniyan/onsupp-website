"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";

export interface HomepageSectionItem {
  id: number;
  key: string;
  sectionType: string;
  titleFa: string;
  titleEn: string;
  position: number;
  isEnabled: boolean;
  settingsJson: Record<string, any>;
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "اسلایدر اصلی بالای صفحه با معرفی استودیو، تصاویر سینمایی و دکمه‌های اقدام",
  "clients-partners": "بخش معرفی کارفرمایان و شرکای استراتژیک بین‌المللی",
  partners: "بخش معرفی کارفرمایان و شرکای استراتژیک بین‌المللی",
  stats: "آمار رضایت و شاخص‌های کلیدی عملکرد با جلوه‌های عددی شمارش‌گر",
  services: "ویترین کاروسل ۷ دپارتمان تخصصی خدمات آن‌ساپ",
  about: "خلاصه بیانیه معرفی آژانس و ویژگی‌های متمایز آن‌ساپ",
  "client-marquee": "نوار متحرک بی‌نهایت لوگوی مشتریان و برندهای همکار",
  logos: "نوار متحرک بی‌نهایت لوگوی مشتریان و برندهای همکار",
  casestudies: "ویترین پروژه‌های شاخص، تصاویر قبل و بعد و کیس استادی‌ها",
  case_studies: "ویترین پروژه‌های شاخص، تصاویر قبل و بعد و کیس استادی‌ها",
  "contact-cta": "فرم دریافت مشاوره سریع و اطلاعات تماس",
  contact: "فرم دریافت مشاوره سریع و اطلاعات تماس",
  testimonials: "کاروسل نظرات رسمی کارفرمایان و مدیران ارشد",
  "blog-articles": "آخرین مقالات، آموزش‌های سئو و رویدادهای تخصصی وبلاگ",
  articles: "آخرین مقالات، آموزش‌های سئو و رویدادهای تخصصی وبلاگ",
};

export default function HomepageSectionsAdminPage() {
  const [sections, setSections] = useState<HomepageSectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingReorder, setSavingReorder] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/sections/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setSections(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لیست بخش‌های صفحه اصلی");
      }
    } catch {
      notify("err", "عدم برقراری ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleToggle = async (section: HomepageSectionItem) => {
    setTogglingId(section.id);
    const newStatus = !section.isEnabled;
    try {
      const res = await adminFetch(`/api/v1/sections/${section.id}`, {
        method: "PUT",
        body: JSON.stringify({ isEnabled: newStatus }),
      });
      if (res.ok) {
        setSections((prev) =>
          prev.map((s) => (s.id === section.id ? { ...s, isEnabled: newStatus } : s))
        );
        notify(
          "ok",
          `بخش "${section.titleFa || section.key}" با موفقیت ${
            newStatus ? "فعال شد و در صفحه اصلی نمایش داده می‌شود" : "غیرفعال گردید و از صفحه اصلی پنهان شد"
          }`
        );
      } else {
        notify("err", "خطا در تغییر وضعیت بخش");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ارتباط با سرور");
    } finally {
      setTogglingId(null);
    }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const cloned = [...sections];
    const temp = cloned[idx];
    cloned[idx] = cloned[targetIdx];
    cloned[targetIdx] = temp;
    // update positions
    const updated = cloned.map((item, i) => ({ ...item, position: i }));
    setSections(updated);
  };

  const saveReorder = async () => {
    setSavingReorder(true);
    try {
      const orderedIds = sections.map((s) => s.id);
      const res = await adminFetch("/api/v1/sections/reorder", {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
      if (res.ok) {
        notify("ok", "ترتیب جدید بخش‌ها با موفقیت در دیتابیس ثبت و حافظه پنهان ابطال شد");
      } else {
        notify("err", "خطا در ثبت ترتیب جدید");
      }
    } catch {
      notify("err", "خطای شبکه هنگام ثبت ترتیب");
    } finally {
      setSavingReorder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            چیدمان و نمایش بخش‌های صفحه اصلی
          </h1>
          <p className="text-sm text-muted mt-1">
            ترتیب قرارگیری بخش‌های لندینگ‌پیج را با جابجایی بالا/پایین تغییر دهید و بخش‌های دلخواه را فعال یا غیرفعال کنید.
          </p>
        </div>

        <button
          type="button"
          onClick={saveReorder}
          disabled={savingReorder}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lime text-ink font-bold text-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {savingReorder ? (
            <>
              <div className="w-4 h-4 border-2 border-ink/30 border-t-ink rounded-full animate-spin" />
              <span>در حال ثبت ترتیب...</span>
            </>
          ) : (
            <span>ذخیره چیدمان جدید</span>
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

      {/* ── Section Cards List ── */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div
            key={section.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all ${
              section.isEnabled
                ? "bg-panel border-border hover:border-primary/40 shadow-xs"
                : "bg-raised/60 border-border opacity-60"
            }`}
          >
            {/* Left: Position badge, Titles & Descriptions */}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center font-mono font-bold text-sm text-mint border border-border shrink-0">
                {idx + 1}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-bold text-base text-foreground">
                    {section.titleFa || section.key}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-raised text-muted border border-border">
                    {section.key}
                  </span>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      section.isEnabled
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {section.isEnabled ? "فعال در صفحه اصلی" : "غیرفعال (مخفی)"}
                  </span>
                </div>

                <p className="text-xs text-muted font-light leading-relaxed max-w-xl">
                  {SECTION_DESCRIPTIONS[section.key] || section.titleEn}
                </p>
              </div>
            </div>

            {/* Right: Actions (Move Up / Down & Enable Toggle) */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {/* Move Up */}
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                title="انتقال به بالا"
                className="w-9 h-9 rounded-xl border border-border bg-raised hover:bg-subtle flex items-center justify-center text-foreground disabled:opacity-25 cursor-pointer transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>

              {/* Move Down */}
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === sections.length - 1}
                title="انتقال به پایین"
                className="w-9 h-9 rounded-xl border border-border bg-raised hover:bg-subtle flex items-center justify-center text-foreground disabled:opacity-25 cursor-pointer transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Enable / Disable Toggle Switch */}
              <button
                type="button"
                onClick={() => handleToggle(section)}
                disabled={togglingId === section.id}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  section.isEnabled
                    ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
                    : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                }`}
              >
                {togglingId === section.id
                  ? "در حال پردازش..."
                  : section.isEnabled
                  ? "غیرفعال‌سازی"
                  : "فعال‌سازی"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
