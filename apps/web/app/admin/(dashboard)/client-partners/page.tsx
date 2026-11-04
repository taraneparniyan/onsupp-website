"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type ClientPartner = {
  id: number;
  orderNumber: string;
  nameFa: string;
  nameEn: string;
  titleFa: string;
  titleEn: string;
  industryFa: string;
  industryEn: string;
  introFa: string;
  introEn: string;
  quoteFa?: string | null;
  quoteEn?: string | null;
  servicesFa: string[];
  servicesEn: string[];
  portraitImage?: string | null;
  websites: string[];
  instagrams: string[];
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
  position: number;
};

const EMPTY_FORM: Omit<ClientPartner, "id"> = {
  orderNumber: "01",
  nameFa: "",
  nameEn: "",
  titleFa: "",
  titleEn: "",
  industryFa: "",
  industryEn: "",
  introFa: "",
  introEn: "",
  quoteFa: "",
  quoteEn: "",
  servicesFa: [],
  servicesEn: [],
  portraitImage: "",
  websites: [],
  instagrams: [],
  status: "PUBLISHED",
  position: 0,
};

export default function ClientPartnersAdminPage() {
  const [items, setItems] = useState<ClientPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [serviceInput, setServiceInput] = useState("");
  const [websiteInput, setWebsiteInput] = useState("");
  const [instagramInput, setInstagramInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/client-partners", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => a.position - b.position));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست همکاران" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      orderNumber: String(items.length + 1).padStart(2, "0"),
      position: items.length,
    });
    setServiceInput("");
    setWebsiteInput("");
    setInstagramInput("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: ClientPartner) => {
    setEditingId(item.id);
    setFormData({
      orderNumber: item.orderNumber || "01",
      nameFa: item.nameFa || "",
      nameEn: item.nameEn || "",
      titleFa: item.titleFa || item.nameFa || "",
      titleEn: item.titleEn || item.nameEn || "",
      industryFa: item.industryFa || "",
      industryEn: item.industryEn || "",
      introFa: item.introFa || "",
      introEn: item.introEn || "",
      quoteFa: item.quoteFa || "",
      quoteEn: item.quoteEn || "",
      servicesFa: Array.isArray(item.servicesFa) ? item.servicesFa : [],
      servicesEn: Array.isArray(item.servicesEn) ? item.servicesEn : [],
      portraitImage: item.portraitImage || "",
      websites: Array.isArray(item.websites) ? item.websites : [],
      instagrams: Array.isArray(item.instagrams) ? item.instagrams : [],
      status: item.status || "PUBLISHED",
      position: item.position ?? 0,
    });
    setServiceInput("");
    setWebsiteInput("");
    setInstagramInput("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameFa) {
      setMessage({ type: "err", text: "نام فارسی همکار الزامی است." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      ...formData,
      titleFa: formData.titleFa || formData.nameFa,
      titleEn: formData.titleEn || formData.nameEn,
    };

    try {
      const url = editingId ? `/api/v1/client-partners/${editingId}` : "/api/v1/client-partners";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: editingId ? "همکار با موفقیت ویرایش شد." : "همکار جدید افزوده شد." });
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
    if (!confirm("آیا از حذف این همکار اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/client-partners/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "همکار حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف همکار." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#232c27] pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">همکاران و مشتریان ویژه (Client Partners)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت مشتریان و کارفرمایان استراتژیک آن‌ساپ در سکشن اختصاصی صفحه اصلی
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
          <span>افزودن همکار جدید</span>
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

      {/* ── Partners Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">کد</th>
                <th className="px-6 py-4">پرتره / تصویر</th>
                <th className="px-6 py-4">نام همکار / برند</th>
                <th className="px-6 py-4">حوزه فعالیت</th>
                <th className="px-6 py-4">وضعیت انتشار</th>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری اطلاعات همکاران...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    هیچ همکاری ثبت نشده است. از دکمه بالا برای افزودن همکار استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400">
                      {item.orderNumber || "01"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        {item.portraitImage ? (
                          <Image src={item.portraitImage} alt={item.nameFa} fill className="object-cover" />
                        ) : (
                          <span className="text-[10px] text-gray-500 font-bold">OP</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      <div>{item.nameFa}</div>
                      <div className="text-xs text-[#8fa397] font-mono mt-0.5" dir="ltr">
                        {item.nameEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#8fa397]">
                      <div>{item.industryFa}</div>
                      <div className="text-xs text-gray-500" dir="ltr">
                        {item.industryEn}
                      </div>
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
                        {item.status === "PUBLISHED" ? "منتشر شده" : item.status === "DRAFT" ? "پیش‌نویس" : "آرشیو"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-[#8fa397]">{item.position}</td>
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
          <div className="bg-[#131615] border border-[#232c27] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232c27] pb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "ویرایش اطلاعات همکار" : "افزودن همکار جدید"}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نام فارسی همکار / برند *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameFa}
                    onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: کلینیک دکتر میراسماعیلی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">کد ردیف (Order No)</label>
                  <input
                    type="text"
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none font-mono"
                    dir="ltr"
                    placeholder="01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="Dr. Miresmaeli Clinic"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">عنوان تفصیلی (فارسی)</label>
                  <input
                    type="text"
                    value={formData.titleFa}
                    onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="پرتال رزرو و برندینگ پزشکی"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">حوزه فعالیت (فارسی)</label>
                  <input
                    type="text"
                    value={formData.industryFa}
                    onChange={(e) => setFormData({ ...formData, industryFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="خدمات زیبایی و پزشکی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Industry (English)</label>
                  <input
                    type="text"
                    value={formData.industryEn}
                    onChange={(e) => setFormData({ ...formData, industryEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">معرفی و خلاصه همکاری (Intro Fa)</label>
                <textarea
                  rows={2}
                  value={formData.introFa}
                  onChange={(e) => setFormData({ ...formData, introFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="شرح کوتاه همکاری مشترک و دستاوردهای پیاده‌سازی شده..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نقل‌قول کارفرما (Quote Fa)</label>
                <input
                  type="text"
                  value={formData.quoteFa || ""}
                  onChange={(e) => setFormData({ ...formData, quoteFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="«همکاری با آن‌ساپ نقطه عطف دیجیتال برند ما بود...»"
                />
              </div>

              {/* Portrait Picker */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تصویر پرتره یا لوگوی همکار</label>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {formData.portraitImage ? (
                      <Image src={formData.portraitImage} alt="Portrait" fill className="object-cover" />
                    ) : (
                      <span className="text-xs text-gray-500">بدون عکس</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.portraitImage || ""}
                      onChange={(e) => setFormData({ ...formData, portraitImage: e.target.value })}
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

              {/* Services Tags */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">خدمات ارائه‌شده به این همکار</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={serviceInput}
                    onChange={(e) => setServiceInput(e.target.value)}
                    placeholder="مثال: طراحی وب‌سایت"
                    className="flex-1 bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (serviceInput.trim()) {
                        setFormData({ ...formData, servicesFa: [...formData.servicesFa, serviceInput.trim()] });
                        setServiceInput("");
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1f2623] text-emerald-400 text-xs font-bold rounded-lg"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.servicesFa.map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, servicesFa: formData.servicesFa.filter((_, i) => i !== idx) })
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Websites Array */}
              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">وب‌سایت‌های همکار (Websites)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={websiteInput}
                    onChange={(e) => setWebsiteInput(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-3 py-2"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (websiteInput.trim()) {
                        setFormData({ ...formData, websites: [...formData.websites, websiteInput.trim()] });
                        setWebsiteInput("");
                      }
                    }}
                    className="px-3 py-1.5 bg-[#1f2623] text-emerald-400 text-xs font-bold rounded-lg"
                  >
                    افزودن
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.websites.map((w, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-emerald-300"
                    >
                      <span>{w}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, websites: formData.websites.filter((_, i) => i !== idx) })
                        }
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Status and Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#232c27]">
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
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">وضعیت انتشار</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="PUBLISHED">منتشر شده (PUBLISHED)</option>
                    <option value="DRAFT">پیش‌نویس (DRAFT)</option>
                    <option value="ARCHIVED">آرشیو شده (ARCHIVED)</option>
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
                  {saving ? "در حال ذخیره..." : "ذخیره همکار"}
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
            setFormData((prev) => ({ ...prev, portraitImage: item.url }));
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
