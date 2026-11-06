"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type StatForm = {
  id?: number;
  kind: string;
  valueFa: string;
  valueEn: string;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
  position: number;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const EMPTY_STAT = (position: number): StatForm => ({
  kind: "number",
  valueFa: "",
  valueEn: "",
  labelFa: "",
  labelEn: "",
  descFa: "",
  descEn: "",
  position,
  isPublished: true,
  status: "PUBLISHED",
});

function toPayload(s: StatForm) {
  return {
    kind: s.kind === "medical" ? "medical" : "number",
    valueFa: s.valueFa,
    valueEn: s.valueEn,
    labelFa: s.labelFa,
    labelEn: s.labelEn,
    descFa: s.descFa,
    descEn: s.descEn,
    position: s.position,
    isPublished: s.isPublished,
    status: s.status,
  };
}

export default function StatsAdminPage() {
  const [items, setItems] = useState<StatForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  useEffect(() => {
    adminFetch("/api/v1/stats/all", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setItems(
          data.map((s) => ({
            ...s,
            position: s.position ?? 0,
            isPublished: s.isPublished !== false,
            status: s.status || (s.isPublished !== false ? "PUBLISHED" : "DRAFT"),
          }))
        );
      })
      .catch(() => notify("err", "خطا در دریافت آمار"))
      .finally(() => setLoading(false));
  }, [notify]);

  const update = (index: number, field: keyof StatForm, value: any) => {
    setItems((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleTogglePublish = async (index: number) => {
    const stat = items[index];
    const nextPublished = !stat.isPublished;
    const nextStatus = nextPublished ? "PUBLISHED" : "DRAFT";

    update(index, "isPublished", nextPublished);
    update(index, "status", nextStatus);

    if (stat.id) {
      try {
        const res = await adminFetch(`/api/v1/stats/${stat.id}`, {
          method: "PUT",
          body: JSON.stringify({
            ...toPayload(stat),
            isPublished: nextPublished,
            status: nextStatus,
          }),
        });
        if (res.ok) {
          notify("ok", `وضعیت انتشار شاخص تغییر یافت.`);
        } else {
          notify("err", "تغییر وضعیت ناموفق بود.");
        }
      } catch {
        notify("err", "خطای شبکه هنگام ارتباط با سرور");
      }
    }
  };

  const save = async (index: number) => {
    const stat = items[index];
    if (!stat.valueFa.trim() && !stat.valueEn.trim()) {
      notify("err", "مقدار آمار الزامی است");
      return;
    }
    if (!stat.labelFa.trim() && !stat.labelEn.trim()) {
      notify("err", "برچسب آمار الزامی است");
      return;
    }

    const key = stat.id ? String(stat.id) : `new-${index}`;
    setSavingKey(key);
    try {
      const endpoint = stat.id ? `/api/v1/stats/${stat.id}` : "/api/v1/stats";
      const res = await adminFetch(endpoint, {
        method: stat.id ? "PUT" : "POST",
        body: JSON.stringify(toPayload(stat)),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("err", data.error || "ذخیره ناموفق بود");
        return;
      }
      setItems((prev) => prev.map((s, i) => (i === index ? { ...s, ...data, id: data.id } : s)));
      notify("ok", "آمار با موفقیت ذخیره شد");
    } catch {
      notify("err", "خطا در ارتباط با سرور");
    } finally {
      setSavingKey(null);
    }
  };

  const remove = async (index: number) => {
    if (!confirm("این آمار حذف شود؟")) return;
    const stat = items[index];
    if (stat.id) {
      await adminFetch(`/api/v1/stats/${stat.id}`, { method: "DELETE" });
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    notify("ok", "آمار حذف شد");
  };

  const addNew = () => {
    setItems((prev) => [...prev, EMPTY_STAT(prev.length)]);
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
          adminFetch(`/api/v1/stats/${a.id}`, {
            method: "PUT",
            body: JSON.stringify(toPayload(a)),
          }),
          adminFetch(`/api/v1/stats/${b.id}`, {
            method: "PUT",
            body: JSON.stringify(toPayload(b)),
          }),
        ]);
      } catch {
        /* silent reorder fail */
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-muted" dir="rtl">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>در حال بارگذاری آمار و شاخص‌های رضایت...</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            مدیریت آمار و شاخص‌های کلیدی (Stats CMS)
          </h1>
          <p className="text-sm text-muted mt-1">
            ویرایش، تغییر ترتیب و کنترل انتشار شاخص‌های بخش رضایت و افتخارات در صفحه اصلی و لندینگ‌ها
          </p>
        </div>

        <button
          onClick={addNew}
          className="px-5 py-2.5 rounded-xl bg-lime text-ink font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          افزودن شاخص جدید
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

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((stat, idx) => {
          const key = stat.id ? String(stat.id) : `new-${idx}`;
          const isSaving = savingKey === key;

          return (
            <div
              key={key}
              className={`bg-panel border rounded-3xl p-6 space-y-4 transition-all shadow-xs ${
                stat.isPublished ? "border-border hover:border-primary/40" : "border-amber-500/40 bg-amber-500/5"
              }`}
            >
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-xs font-mono text-muted">شاخص #{idx + 1}</span>
                  <button
                    onClick={() => handleTogglePublish(idx)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border cursor-pointer ${
                      stat.isPublished
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {stat.isPublished ? "منتشر شده" : "پیش‌نویس"}
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                    title="انتقال به بالا"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    className="p-1 rounded text-muted hover:text-foreground disabled:opacity-30 cursor-pointer"
                    title="انتقال به پایین"
                  >
                    ▼
                  </button>
                  <button
                    onClick={() => remove(idx)}
                    className="p-1.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 hover:bg-rose-500/25 text-xs cursor-pointer ml-1"
                    title="حذف"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    مقدار شاخص (فارسی) *
                  </label>
                  <input
                    type="text"
                    value={stat.valueFa}
                    onChange={(e) => update(idx, "valueFa", e.target.value)}
                    placeholder="مثال: +۹۸٪ یا ۵۰+"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Value (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={stat.valueEn}
                    onChange={(e) => update(idx, "valueEn", e.target.value)}
                    placeholder="e.g. 98% or 50+"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    عنوان شاخص (فارسی) *
                  </label>
                  <input
                    type="text"
                    value={stat.labelFa}
                    onChange={(e) => update(idx, "labelFa", e.target.value)}
                    placeholder="رضایت کارفرمایان"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Label (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={stat.labelEn}
                    onChange={(e) => update(idx, "labelEn", e.target.value)}
                    placeholder="Client Satisfaction"
                    className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  توضیحات تکمیلی (فارسی)
                </label>
                <input
                  type="text"
                  value={stat.descFa}
                  onChange={(e) => update(idx, "descFa", e.target.value)}
                  placeholder="بر اساس نظرسنجی دوره‌ای از ۳۰ پروژه اخیر"
                  className="w-full bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {/* Type and Save */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-muted">نوع قالب:</label>
                  <select
                    value={stat.kind}
                    onChange={(e) => update(idx, "kind", e.target.value)}
                    className="bg-raised border border-border rounded-lg px-2 py-1 text-xs text-foreground"
                  >
                    <option value="number">عددی (معمولی)</option>
                    <option value="medical">تخصصی / پزشکی</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => save(idx)}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-lime text-ink text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  {isSaving && (
                    <div className="w-3.5 h-3.5 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {stat.id ? "ذخیره تغییرات" : "ایجاد شاخص"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
