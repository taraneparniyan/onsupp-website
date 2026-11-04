"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type ClientLogo = {
  id: number;
  nameFa: string;
  nameEn: string;
  logoUrl: string;
  websiteUrl?: string | null;
  width: number;
  height: number;
  position: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
};

const EMPTY_FORM: Omit<ClientLogo, "id"> = {
  nameFa: "",
  nameEn: "",
  logoUrl: "",
  websiteUrl: "",
  width: 140,
  height: 48,
  position: 0,
  status: "PUBLISHED",
};

export default function ClientLogosAdminPage() {
  const [items, setItems] = useState<ClientLogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/client-logos", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => a.position - b.position));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لوگوها" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, position: items.length });
    setIsModalOpen(true);
  };

  const openEditModal = (item: ClientLogo) => {
    setEditingId(item.id);
    setFormData({
      nameFa: item.nameFa || "",
      nameEn: item.nameEn || "",
      logoUrl: item.logoUrl || "",
      websiteUrl: item.websiteUrl || "",
      width: item.width || 140,
      height: item.height || 48,
      position: item.position ?? 0,
      status: item.status || "PUBLISHED",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameFa || !formData.logoUrl) {
      setMessage({ type: "err", text: "نام فارسی و تصویر لوگو الزامی هستند." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const url = editingId ? `/api/v1/client-logos/${editingId}` : "/api/v1/client-logos";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: editingId ? "لوگو با موفقیت ویرایش شد." : "لوگوی جدید افزوده شد." });
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره سازی." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این لوگو اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/client-logos/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "لوگو حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف لوگو." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    }
  };

  const movePosition = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const currentItem = items[index];
    const targetItem = items[targetIndex];

    try {
      await adminFetch(`/api/v1/client-logos/${currentItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: targetItem.position }),
      });
      await adminFetch(`/api/v1/client-logos/${targetItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: currentItem.position }),
      });
      fetchItems();
    } catch {
      setMessage({ type: "err", text: "خطا در تغییر ترتیب لوگوها." });
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">لوگوهای برند همکار (Client Logo Marquee)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت لوگوهای چرخان نوار متحرک صفحه اصلی (نمادهای اعتماد و مشتریان فعال)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-primary/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>افزودن لوگوی جدید</span>
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

      {/* ── Logos Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4">تصویر لوگو</th>
                <th className="px-6 py-4">نام برند</th>
                <th className="px-6 py-4">ابعاد (پیکسل)</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری لیست لوگوها...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#8fa397]">
                    هیچ لوگویی ثبت نشده است. از دکمه بالا برای افزودن لوگوی جدید استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePosition(idx, "up")}
                          className="p-1 rounded bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white disabled:opacity-30"
                          title="انتقال به بالا"
                        >
                          ▲
                        </button>
                        <span className="w-6 text-center">{item.position}</span>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => movePosition(idx, "down")}
                          className="p-1 rounded bg-[#1a221e] hover:bg-[#28322d] text-gray-400 hover:text-white disabled:opacity-30"
                          title="انتقال به پایین"
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-24 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.logoUrl ? (
                          <Image src={item.logoUrl} alt={item.nameFa} fill className="object-contain p-2" />
                        ) : (
                          <span className="text-xs text-gray-500">بدون لوگو</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{item.nameFa}</div>
                      <div className="text-xs text-[#8fa397] font-mono mt-0.5" dir="ltr">
                        {item.nameEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#8fa397]" dir="ltr">
                      {item.width} × {item.height}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === "PUBLISHED"
                            ? "bg-emerald-950/70 text-emerald-300 border border-emerald-500/30"
                            : item.status === "DRAFT"
                            ? "bg-amber-950/70 text-amber-300 border border-amber-500/30"
                            : "bg-gray-800 text-gray-400 border border-gray-700"
                        }`}
                      >
                        {item.status === "PUBLISHED" ? "فعال در نوار" : item.status === "DRAFT" ? "پیش‌نویس" : "آرشیو"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a221e] hover:bg-[#232f29] text-emerald-400 border border-[#2a3831] transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-500/20 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#131615] border border-[#232c27] rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "ویرایش لوگوی برند" : "افزودن لوگوی جدید به نوار متحرک"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نام فارسی برند *</label>
                <input
                  type="text"
                  required
                  value={formData.nameFa}
                  onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="مثال: دیجی‌کالا"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Brand Name (English)</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  dir="ltr"
                  placeholder="e.g. Digikala"
                />
              </div>

              {/* Logo Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">فایل لوگو (PNG/SVG شفاف) *</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-24 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.logoUrl ? (
                      <Image src={formData.logoUrl} alt="Logo" fill className="object-contain p-2" />
                    ) : (
                      <span className="text-xs text-gray-500">انتخاب نشده</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      required
                      value={formData.logoUrl}
                      onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-xs text-emerald-400 hover:underline"
                    >
                      انتخاب از رسانه‌ها...
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">آدرس وب‌سایت همکار (اختیاری)</label>
                <input
                  type="url"
                  value={formData.websiteUrl || ""}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  dir="ltr"
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">عرض استاندارد (Width)</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value, 10) || 140 })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">ارتفاع استاندارد (Height)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value, 10) || 48 })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">ترتیب نمایش</label>
                  <input
                    type="number"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">وضعیت</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="PUBLISHED">فعال در نوار (PUBLISHED)</option>
                    <option value="DRAFT">پیش‌نویس (DRAFT)</option>
                    <option value="ARCHIVED">آرشیو (ARCHIVED)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#232c27]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1f2623] text-gray-300 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg disabled:opacity-50"
                >
                  {saving ? "در حال ذخیره..." : "ذخیره لوگو"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker */}
      {pickerOpen && (
        <MediaPickerModal
          open={true}
          onClose={() => setPickerOpen(false)}
          onSelect={(item: MediaItem) => {
            setFormData((prev) => ({ ...prev, logoUrl: item.url }));
            setPickerOpen(false);
          }}
          
        />
      )}
    </div>
  );
}
