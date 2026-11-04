"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export type TeamMember = {
  id: number;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  departmentFa: string;
  departmentEn: string;
  bioFa?: string | null;
  bioEn?: string | null;
  avatarUrl?: string | null;
  focalPoint?: string | null;
  socialLinks?: Record<string, string> | null;
  position: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
};

interface MemberFormData {
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  departmentFa: string;
  departmentEn: string;
  bioFa: string;
  bioEn: string;
  avatarUrl: string;
  focalPoint: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  github: string;
  telegram: string;
  position: number;
  status: "PUBLISHED" | "DRAFT" | "ARCHIVED";
}

const EMPTY_FORM: MemberFormData = {
  nameFa: "",
  nameEn: "",
  roleFa: "",
  roleEn: "",
  departmentFa: "مهندسی و توسعه",
  departmentEn: "Engineering",
  bioFa: "",
  bioEn: "",
  avatarUrl: "",
  focalPoint: "center",
  linkedin: "",
  twitter: "",
  instagram: "",
  github: "",
  telegram: "",
  position: 0,
  status: "PUBLISHED",
};

export default function TeamMembersAdminPage() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const fetchItems = () => {
    adminFetch("/api/v1/team-members", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data.sort((a, b) => a.position - b.position));
        }
      })
      .catch(() => setMessage({ type: "err", text: "خطا در دریافت لیست اعضای تیم" }))
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

  const openEditModal = (item: TeamMember) => {
    setEditingId(item.id);
    const social = item.socialLinks || {};
    setFormData({
      nameFa: item.nameFa || "",
      nameEn: item.nameEn || "",
      roleFa: item.roleFa || "",
      roleEn: item.roleEn || "",
      departmentFa: item.departmentFa || "مهندسی و توسعه",
      departmentEn: item.departmentEn || "Engineering",
      bioFa: item.bioFa || "",
      bioEn: item.bioEn || "",
      avatarUrl: item.avatarUrl || "",
      focalPoint: item.focalPoint || "center",
      linkedin: social.linkedin || "",
      twitter: social.twitter || "",
      instagram: social.instagram || "",
      github: social.github || "",
      telegram: social.telegram || "",
      position: item.position ?? 0,
      status: item.status || "PUBLISHED",
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameFa || !formData.roleFa) {
      setMessage({ type: "err", text: "نام و سمت عضو تیم الزامی هستند." });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      nameFa: formData.nameFa,
      nameEn: formData.nameEn,
      roleFa: formData.roleFa,
      roleEn: formData.roleEn,
      departmentFa: formData.departmentFa,
      departmentEn: formData.departmentEn,
      bioFa: formData.bioFa,
      bioEn: formData.bioEn,
      avatarUrl: formData.avatarUrl,
      focalPoint: formData.focalPoint,
      position: formData.position,
      status: formData.status,
      socialLinks: {
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        instagram: formData.instagram,
        github: formData.github,
        telegram: formData.telegram,
      },
    };

    try {
      const url = editingId ? `/api/v1/team-members/${editingId}` : "/api/v1/team-members";
      const method = editingId ? "PUT" : "POST";

      const res = await adminFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ type: "ok", text: editingId ? "اطلاعات عضو تیم به‌روزرسانی شد." : "عضو جدید با موفقیت اضافه شد." });
        setIsModalOpen(false);
        fetchItems();
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "err", text: err?.error || "خطا در ذخیره‌سازی اطلاعات." });
      }
    } catch {
      setMessage({ type: "err", text: "خطا در اتصال به سرور." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این عضو تیم اطمینان دارید؟")) return;

    try {
      const res = await adminFetch(`/api/v1/team-members/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ type: "ok", text: "عضو تیم حذف شد." });
        fetchItems();
      } else {
        setMessage({ type: "err", text: "خطا در حذف عضو تیم." });
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
          <h1 className="text-2xl font-bold text-white mb-1">مدیریت اعضای تیم و لیدرهای تخصصی (Team Members)</h1>
          <p className="text-sm text-[#8fa397]">
            مدیریت اعضای استودیو، لیدرهای دپارتمان‌ها و متخصصان ارشد در صفحه «درباره ما» (دارای دسترسی HR)
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg hover:shadow-primary/20 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          <span>افزودن عضو جدید</span>
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

      {/* ── Members Table ── */}
      <div className="bg-[#131615] border border-[#1f2623] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-[#181d1a] text-[#8fa397] text-xs font-semibold uppercase border-b border-[#232c27]">
              <tr>
                <th className="px-6 py-4">تصویر</th>
                <th className="px-6 py-4">نام و نام خانوادگی</th>
                <th className="px-6 py-4">سمت تخصصی</th>
                <th className="px-6 py-4">دپارتمان</th>
                <th className="px-6 py-4">وضعیت</th>
                <th className="px-6 py-4">ترتیب</th>
                <th className="px-6 py-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2623]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    در حال بارگذاری لیست اعضای تیم...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#8fa397]">
                    هیچ عضوی ثبت نشده است. از دکمه بالا برای افزودن عضو جدید استفاده کنید.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                        {item.avatarUrl ? (
                          <Image
                            src={item.avatarUrl}
                            alt={item.nameFa}
                            fill
                            className={`object-cover ${
                              item.focalPoint === "top"
                                ? "object-top"
                                : item.focalPoint === "bottom"
                                ? "object-bottom"
                                : "object-center"
                            }`}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 font-bold">
                            {item.nameFa.slice(0, 1)}
                          </div>
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
                      <div>{item.roleFa}</div>
                      <div className="text-xs text-gray-500" dir="ltr">
                        {item.roleEn}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-emerald-400">
                      {item.departmentFa}
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
                {editingId ? "ویرایش مشخصات عضو تیم" : "افزودن عضو جدید به تیم"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نام و نام خانوادگی (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameFa}
                    onChange={(e) => setFormData({ ...formData, nameFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: مهندس علی حسینی"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Full Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="e.g. Ali Hosseini"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">سمت شغلی (فارسی) *</label>
                  <input
                    type="text"
                    required
                    value={formData.roleFa}
                    onChange={(e) => setFormData({ ...formData, roleFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مثال: لید ارشد مهندسی نرم‌افزار"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Role (English)</label>
                  <input
                    type="text"
                    value={formData.roleEn}
                    onChange={(e) => setFormData({ ...formData, roleEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="Lead Software Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">دپارتمان (فارسی)</label>
                  <input
                    type="text"
                    value={formData.departmentFa}
                    onChange={(e) => setFormData({ ...formData, departmentFa: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    placeholder="مهندسی و توسعه"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">Department (English)</label>
                  <input
                    type="text"
                    value={formData.departmentEn}
                    onChange={(e) => setFormData({ ...formData, departmentEn: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                    dir="ltr"
                    placeholder="Engineering"
                  />
                </div>
              </div>

              {/* Avatar Picker & Focal Point */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">تصویر پرتره پرسنلی</label>
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {formData.avatarUrl ? (
                        <Image
                          src={formData.avatarUrl}
                          alt="Avatar"
                          fill
                          className={`object-cover ${
                            formData.focalPoint === "top"
                              ? "object-top"
                              : formData.focalPoint === "bottom"
                              ? "object-bottom"
                              : "object-center"
                          }`}
                        />
                      ) : (
                        <span className="text-xs text-gray-500">بدون عکس</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="text"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
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
                  <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">نقطه تمرکز چهره (Focal Point)</label>
                  <select
                    value={formData.focalPoint}
                    onChange={(e) => setFormData({ ...formData, focalPoint: e.target.value })}
                    className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3 py-2.5 focus:border-primary focus:outline-none"
                  >
                    <option value="center">مرکز (Center)</option>
                    <option value="top">بالا / سر (Top)</option>
                    <option value="bottom">پایین (Bottom)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8fa397] mb-1.5">بیوگرافی و تخصص‌ها (فارسی)</label>
                <textarea
                  rows={3}
                  value={formData.bioFa}
                  onChange={(e) => setFormData({ ...formData, bioFa: e.target.value })}
                  className="w-full bg-[#101413] border border-[#232c27] text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-primary focus:outline-none"
                  placeholder="شرح کوتاه تجارب، سوابق و حوزه‌های مسئولیت در استودیو..."
                />
              </div>

              {/* Social Links */}
              <div className="border-t border-[#232c27] pt-4">
                <h3 className="text-xs font-bold text-white mb-3">شبکه‌های اجتماعی تخصصی</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-[#8fa397] mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8fa397] mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8fa397] mb-1">Telegram / Username</label>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#8fa397] mb-1">Twitter / X URL</label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                      className="w-full bg-[#101413] border border-[#232c27] text-white text-xs rounded-lg px-2.5 py-2 focus:border-primary focus:outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Position */}
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
                  {saving ? "در حال ذخیره..." : "ذخیره عضو تیم"}
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
            setFormData((prev) => ({ ...prev, avatarUrl: item.url }));
            setPickerOpen(false);
          }}
          
        />
      )}
    </div>
  );
}
