"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type StatForm = {
  id?: number;
  kind: string;
  iconType: string;
  valueFa: string;
  valueEn: string;
  suffixFa: string;
  suffixEn: string;
  labelFa: string;
  labelEn: string;
  descFa: string;
  descEn: string;
  isRating: boolean;
  published: boolean;
  position: number;
};

const EMPTY_STAT = (position: number): StatForm => ({
  kind: "number",
  iconType: "chart",
  valueFa: "",
  valueEn: "",
  suffixFa: "",
  suffixEn: "",
  labelFa: "",
  labelEn: "",
  descFa: "",
  descEn: "",
  isRating: false,
  published: true,
  position,
});

function toPayload(s: StatForm) {
  return {
    kind: s.kind || "number",
    iconType: s.iconType || "chart",
    valueFa: s.valueFa,
    valueEn: s.valueEn,
    suffixFa: s.suffixFa,
    suffixEn: s.suffixEn,
    labelFa: s.labelFa,
    labelEn: s.labelEn,
    descFa: s.descFa,
    descEn: s.descEn,
    isRating: s.isRating,
    published: s.published !== false,
    position: s.position,
  };
}

export default function StatsAdminPage() {
  const [items, setItems] = useState<StatForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    adminFetch("/api/v1/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!Array.isArray(data)) return;
        setItems(
          data.map((s) => ({
            ...s,
            iconType: s.iconType || "chart",
            suffixFa: s.suffixFa || "",
            suffixEn: s.suffixEn || "",
            isRating: Boolean(s.isRating),
            published: s.published !== false,
            position: s.position ?? 0,
          }))
        );
      })
      .catch(() => notify("err", "خطا در دریافت آمار"))
      .finally(() => setLoading(false));
  }, [notify]);

  const update = (index: number, field: keyof StatForm, value: any) => {
    setItems((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload(stat)),
      });
      const data = await res.json();
      if (!res.ok) {
        notify("err", data.error || "ذخیره ناموفق بود");
        return;
      }
      setItems((prev) =>
        prev.map((s, i) => (i === index ? { ...s, ...data, id: data.id } : s))
      );
      notify("ok", "شاخص آماری با موفقیت ذخیره و کش بازسازی شد");
    } catch {
      notify("err", "خطا در ارتباط با سرور");
    } finally {
      setSavingKey(null);
    }
  };

  const remove = async (index: number) => {
    if (!confirm("این شاخص آماری حذف شود؟")) return;
    const stat = items[index];
    if (stat.id) {
      await adminFetch(`/api/v1/stats/${stat.id}`, { method: "DELETE" });
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
    notify("ok", "شاخص حذف شد");
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toPayload(a)),
          }),
          adminFetch(`/api/v1/stats/${b.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(toPayload(b)),
          }),
        ]);
      } catch {
        /* reorder error */
      }
    }
  };

  if (loading) return <div className="p-8 text-mint">در حال بارگذاری آمارها...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">مدیریت آمار و شاخص‌های رضایت (Stats CMS)</h2>
          <p className="text-mint text-sm mt-1">
            تنظیم شاخص‌های کلیدی، نمادهای دستاورد، رتبه‌بندی‌ها و پیش‌نمایش در سکشن آمار صفحه اصلی
          </p>
        </div>
        <button
          type="button"
          onClick={addNew}
          className="bg-gradient-to-r from-primary to-primary-hover text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg hover:shadow-[#3f6b59]/30 transition-all border border-primary/40 flex items-center gap-2"
        >
          <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          افزودن آمار جدید
        </button>
      </div>

      {message && (
        <div
          className={`text-sm px-5 py-3.5 rounded-lg border ${
            message.type === "ok"
              ? "text-mint bg-panel border-primary/20"
              : "text-rose-300 bg-[#2b1216] border-[#542129]"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {items.length === 0 && (
          <div className="bg-panel rounded-xl border border-dashed border-foreground/10 p-16 text-center text-mint">
            هنوز هیچ آماری تعریف نشده است. روی «افزودن آمار جدید» کلیک کنید.
          </div>
        )}

        {items.map((stat, idx) => (
          <div
            key={stat.id ? `stat-${stat.id}` : `new-${idx}`}
            className="bg-[#131615] rounded-2xl border border-[#1f2623] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#232c27] pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  شاخص ۰{idx + 1}
                </span>
                <span className="text-sm font-bold text-white">
                  {stat.labelFa || "شاخص بدون عنوان"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => move(idx, -1)}
                  className="px-2 py-1 bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white rounded text-xs disabled:opacity-20"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={idx === items.length - 1}
                  onClick={() => move(idx, 1)}
                  className="px-2 py-1 bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white rounded text-xs disabled:opacity-20"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="px-3 py-1 bg-red-950/40 hover:bg-red-950/70 text-red-400 rounded text-xs"
                >
                  حذف
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1">نوع آیکون</label>
                <select
                  value={stat.iconType}
                  onChange={(e) => update(idx, "iconType", e.target.value)}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2"
                >
                  <option value="chart">نمودار و رشد (chart)</option>
                  <option value="star">ستاره و رضایت (star)</option>
                  <option value="user">کاربر و مشتریان (user)</option>
                  <option value="clock">زمان و تجربه (clock)</option>
                  <option value="building">سازمانی و برند (building)</option>
                  <option value="shield">پایداری و امنیت (shield)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1">مقدار عددی (فارسی) *</label>
                <input
                  type="text"
                  value={stat.valueFa}
                  onChange={(e) => update(idx, "valueFa", e.target.value)}
                  placeholder="مثال: ۹۹.۴ یا ۱۵۰"
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1">پسوند (مثال: ٪ یا +)</label>
                <input
                  type="text"
                  value={stat.suffixFa}
                  onChange={(e) => update(idx, "suffixFa", e.target.value)}
                  placeholder="٪"
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1">عنوان شاخص (فارسی) *</label>
                <input
                  type="text"
                  value={stat.labelFa}
                  onChange={(e) => update(idx, "labelFa", e.target.value)}
                  placeholder="رضایت کارفرمایان"
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1">توضیح تکمیلی شاخص (فارسی)</label>
                <input
                  type="text"
                  value={stat.descFa}
                  onChange={(e) => update(idx, "descFa", e.target.value)}
                  placeholder="سنجش دوره‌ای و بازخورد مستقیم پس از تحویل نهایی"
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2"
                />
              </div>

              <div className="flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stat.isRating}
                    onChange={(e) => update(idx, "isRating", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-primary"
                  />
                  <span>نمایش به عنوان امتیاز ستاره‌ای (از ۵)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stat.published}
                    onChange={(e) => update(idx, "published", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 text-primary"
                  />
                  <span>وضعیت انتشار در صفحه اصلی</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => save(idx)}
                disabled={savingKey !== null}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-primary to-primary-hover text-white shadow"
              >
                {savingKey === (stat.id ? String(stat.id) : `new-${idx}`)
                  ? "در حال ذخیره..."
                  : "ذخیره تغییرات شاخص"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
