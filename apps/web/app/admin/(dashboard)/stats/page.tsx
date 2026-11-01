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
        setItems(data.map((s) => ({ ...s, position: s.position ?? 0 })));
      })
      .catch(() => notify("err", "خطا در دریافت آمار"))
      .finally(() => setLoading(false));
  }, [notify]);

  const update = (index: number, field: keyof StatForm, value: string) => {
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
      const endpoint = stat.id
        ? `/api/v1/stats/${stat.id}`
        : "/api/v1/stats";
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
        /* reorder persistence failure is non-critical */
      }
    }
  };

  if (loading) return <div className="p-8 text-mint">در حال بارگذاری آمارها...</div>;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8" dir="rtl">
      {/* Top Banner */}
      <div className="bg-panel rounded-xl shadow-md border border-foreground/10 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">مدیریت آمار و ارقام</h2>
          <p className="text-mint text-sm mt-1">افزودن و تنظیم اعداد کلیدی و شاخص‌های شرکت.</p>
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
            message.type === "ok" ? "text-mint bg-panel border-primary/20" : "text-rose-300 bg-[#2b1216] border-[#542129]"
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

        {items.map((stat, index) => {
          const key = stat.id ? String(stat.id) : `new-${index}`;
          const saving = savingKey === key;
          const medical = stat.kind === "medical";

          return (
            <div key={key} className="bg-panel rounded-xl shadow-md border border-foreground/10 p-7 space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-foreground/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised border border-primary/20 text-mint font-black text-sm">
                    {index + 1}
                  </span>
                  <h3 className="font-bold text-white text-base">
                    آمار شماره {index + 1}
                    {medical && <span className="text-xs text-mint mr-2 bg-mint/10 px-2 py-0.5 rounded-full border border-mint/20">(پزشکی)</span>}
                    {!stat.id && <span className="text-xs text-mint mr-2 bg-mint/10 px-2 py-0.5 rounded-full border border-mint/20">(جدید)</span>}
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
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label="انتقال به پایین"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white hover:border-[#3f6b59] disabled:opacity-30 transition-all"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                    aria-label="حذف آمار"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-mint">نوع کارت:</label>
                <button
                  type="button"
                  onClick={() => update(index, "kind", medical ? "number" : "medical")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    medical
                      ? "bg-mint/10 border-mint/20 text-mint"
                      : "bg-raised border-foreground/10 text-mint"
                  }`}
                >
                  {medical ? "کارت اختصاصی پزشکی" : "کارت عددی عادی"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">مقدار (FA)</label>
                      <input
                        value={stat.valueFa}
                        onChange={(e) => update(index, "valueFa", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">مقدار (EN)</label>
                      <input
                        value={stat.valueEn}
                        onChange={(e) => update(index, "valueEn", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">برچسب (FA)</label>
                      <input
                        value={stat.labelFa}
                        onChange={(e) => update(index, "labelFa", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-mint mb-1.5">برچسب (EN)</label>
                      <input
                        value={stat.labelEn}
                        onChange={(e) => update(index, "labelEn", e.target.value)}
                        className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-1.5">توضیحات (FA)</label>
                    <textarea
                      value={stat.descFa}
                      onChange={(e) => update(index, "descFa", e.target.value)}
                      rows={2}
                      className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-mint mb-1.5">توضیحات (EN)</label>
                    <textarea
                      value={stat.descEn}
                      onChange={(e) => update(index, "descEn", e.target.value)}
                      rows={2}
                      className="w-full bg-raised border border-foreground/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#3f6b59] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-foreground/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => save(index)}
                  disabled={saving}
                  className="bg-gradient-to-r from-primary to-primary-hover text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all border border-primary/40 disabled:opacity-50"
                >
                  {saving ? "در حال ذخیره..." : stat.id ? "ذخیره آمار" : "ایجاد آمار جدید"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}