"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

export type HomeSection = {
  id: number;
  sectionKey: string;
  titleFa: string;
  titleEn: string;
  position: number;
  isEnabled: boolean;
};

export default function HomeSectionsAdminPage() {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchSections = () => {
    adminFetch("/api/v1/home-sections", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setSections(data.sort((a, b) => a.position - b.position));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست سکشن‌های صفحه اصلی" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);

    // Re-index positions
    const updated = copy.map((sec, idx) => ({ ...sec, position: idx + 1 }));
    setSections(updated);
  };

  const toggleSection = (index: number) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], isEnabled: !copy[index].isEnabled };
      return copy;
    });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);

    const payload = {
      sections: sections.map((s, idx) => ({
        sectionKey: s.sectionKey,
        position: idx + 1,
        isEnabled: s.isEnabled,
      })),
    };

    try {
      const res = await adminFetch("/api/v1/home-sections/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({
          type: "ok",
          text: "ترتیب و وضعیت نمایش سکشن‌های صفحه اصلی با موفقیت ذخیره و کش بازسازی شد.",
        });
        setTimeout(() => setMessage(null), 5000);
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره ترتیب سکشن‌ها." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در ارتباط با سرور." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">معماری و سکشن‌های صفحه اصلی (Homepage Sections Engine)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت ترتیب چیدمان (Ordering) و فعال/غیرفعال‌سازی ماژولار سکشن‌های صفحه نخست سایت OnSupp
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>در حال ذخیره چیدمان...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>ذخیره چیدمان و فعال‌سازی</span>
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

      {/* ── Sections Card List ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#232c27] text-xs font-semibold text-[#8fa397]">
          <span>ترتیب چیدمان و نام سکشن</span>
          <span>وضعیت فعال‌بودن</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#8fa397]">در حال بارگذاری سکشن‌ها...</div>
        ) : (
          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.sectionKey}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                  sec.isEnabled
                    ? "bg-[#101413] border-[#232c27] hover:border-[#2f3d35]"
                    : "bg-[#0c0f0e] border-[#181d1a] opacity-60"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Up / Down Controls */}
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, "up")}
                      className="p-1 rounded bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white disabled:opacity-20 text-xs"
                      title="انتقال به بالا"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === sections.length - 1}
                      onClick={() => moveSection(idx, "down")}
                      className="p-1 rounded bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white disabled:opacity-20 text-xs"
                      title="انتقال به پایین"
                    >
                      ▼
                    </button>
                  </div>

                  {/* Position Badge */}
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                    {idx + 1}
                  </div>

                  {/* Section Details */}
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{sec.titleFa}</span>
                      <span className="text-[11px] font-mono text-[#8fa397] px-2 py-0.5 rounded bg-white/5 border border-white/10" dir="ltr">
                        {sec.sectionKey}
                      </span>
                    </div>
                    <div className="text-xs text-[#8fa397] mt-0.5" dir="ltr">
                      {sec.titleEn}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Switch */}
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold ${sec.isEnabled ? "text-emerald-400" : "text-gray-500"}`}>
                    {sec.isEnabled ? "فعال در صفحه اصلی" : "غیرفعال (مخفی)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection(idx)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      sec.isEnabled ? "bg-emerald-600" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sec.isEnabled ? "-translate-x-6" : "-translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
