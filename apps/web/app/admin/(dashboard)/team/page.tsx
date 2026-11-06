"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { adminFetch } from "@/lib/adminApi";
import MediaPickerModal, { type MediaItem } from "@/components/admin/MediaPickerModal";

export interface TeamMemberItem {
  id?: number;
  nameFa: string;
  nameEn: string;
  roleFa: string;
  roleEn: string;
  departmentFa: string;
  departmentEn: string;
  bioFa: string;
  bioEn: string;
  avatarUrl: string | null;
  focalPoint: string;
  socialLinks: Array<{ platform: string; url: string }>;
  position: number;
  isPublished: boolean;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

const EMPTY_MEMBER: TeamMemberItem = {
  nameFa: "",
  nameEn: "",
  roleFa: "",
  roleEn: "",
  departmentFa: "توسعه و مهندسی نرم‌افزار",
  departmentEn: "Software Engineering",
  bioFa: "",
  bioEn: "",
  avatarUrl: null,
  focalPoint: "50% 50%",
  socialLinks: [
    { platform: "linkedin", url: "" },
    { platform: "github", url: "" },
  ],
  position: 0,
  isPublished: true,
  status: "PUBLISHED",
};

export default function TeamAdminPage() {
  const [items, setItems] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TeamMemberItem>(EMPTY_MEMBER);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const notify = useCallback((type: "ok" | "err", text: string) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/team/all", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)));
      } else {
        notify("err", "خطا در دریافت لیست اعضای تیم");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_MEMBER,
      position: items.length,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: TeamMemberItem) => {
    setEditingId(item.id || null);
    setForm({
      ...item,
      socialLinks: Array.isArray(item.socialLinks) && item.socialLinks.length > 0
        ? item.socialLinks
        : [
            { platform: "linkedin", url: "" },
            { platform: "github", url: "" },
          ],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_MEMBER);
  };

  const handleMediaSelect = (media: MediaItem) => {
    setForm((prev) => ({ ...prev, avatarUrl: media.url }));
    setMediaPickerOpen(false);
  };

  const handleTogglePublish = async (item: TeamMemberItem) => {
    if (!item.id) return;
    const nextStatus = !item.isPublished;
    try {
      const res = await adminFetch(`/api/v1/team/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          isPublished: nextStatus,
          status: nextStatus ? "PUBLISHED" : "DRAFT",
        }),
      });
      if (res.ok) {
        setItems((prev) =>
          prev.map((m) =>
            m.id === item.id
              ? { ...m, isPublished: nextStatus, status: nextStatus ? "PUBLISHED" : "DRAFT" }
              : m
          )
        );
        notify("ok", `وضعیت نمایش ${item.nameFa} به‌روز شد.`);
      } else {
        notify("err", "تغییر وضعیت ناموفق بود.");
      }
    } catch {
      notify("err", "خطای ارتباط با سرور");
    }
  };

  const handleDelete = async (item: TeamMemberItem) => {
    if (!item.id) return;
    if (!confirm(`آیا از حذف عضو تیم "${item.nameFa}" اطمینان دارید؟`)) return;

    try {
      const res = await adminFetch(`/api/v1/team/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((m) => m.id !== item.id));
        notify("ok", `عضو تیم "${item.nameFa}" با موفقیت حذف گردید.`);
      } else {
        notify("err", "حذف ناموفق بود.");
      }
    } catch {
      notify("err", "خطای شبکه");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameFa.trim() || !form.roleFa.trim() || !form.departmentFa.trim()) {
      notify("err", "نام، عنوان شغلی و دپارتمان به زبان فارسی الزامی هستند.");
      return;
    }

    setSaving(true);
    const isEdit = !!editingId;
    const endpoint = isEdit ? `/api/v1/team/${editingId}` : "/api/v1/team";
    const method = isEdit ? "PUT" : "POST";

    const payload = {
      ...form,
      nameEn: form.nameEn.trim() || form.nameFa.trim(),
      roleEn: form.roleEn.trim() || form.roleFa.trim(),
      departmentEn: form.departmentEn.trim() || form.departmentFa.trim(),
      position: Number(form.position) || 0,
      socialLinks: form.socialLinks.filter((s) => s.url.trim().length > 0),
    };

    try {
      const res = await adminFetch(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "خطا در ذخیره اطلاعات");
      }

      notify("ok", isEdit ? "اطلاعات عضو تیم به‌روزرسانی شد." : "عضو جدید تیم با موفقیت ایجاد شد.");
      closeModal();
      loadItems();
    } catch (err: any) {
      notify("err", err.message || "خطا در ذخیره سازی");
    } finally {
      setSaving(false);
    }
  };

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "linkedin", url: "" }],
    }));
  };

  const updateSocialLink = (index: number, key: "platform" | "url", value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, i) => (i === index ? { ...s, [key]: value } : s)),
    }));
  };

  const removeSocialLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  };

  const filteredItems = items.filter((m) =>
    (m.nameFa + m.nameEn + m.roleFa + m.departmentFa)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/15 text-mint border border-primary/25">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            مدیریت اعضای تیم و متخصصان
          </h1>
          <p className="text-sm text-muted mt-1">
            مشاهده، ویرایش پرتره، سوابق و کنترل وضعیت نمایش همکاران در بخش &quot;همکاران ما&quot; در صفحه درباره ما
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-lime text-ink font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            افزودن عضو جدید
          </button>
        </div>
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

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel border border-border p-4 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام، سمت یا دپارتمان..."
            className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors"
          />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="text-xs text-muted flex items-center gap-4">
          <span>
            تعداد کل: <strong className="text-foreground">{items.length}</strong>
          </span>
          <span className="text-border">|</span>
          <span>
            منتشر شده: <strong className="text-emerald-600 dark:text-emerald-400">{items.filter((m) => m.isPublished).length}</strong>
          </span>
          <span className="text-border">|</span>
          <span>
            پیش‌نویس: <strong className="text-amber-600 dark:text-amber-400">{items.filter((m) => !m.isPublished).length}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-panel border border-border rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center text-muted">
            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
            <p>در حال بارگذاری اطلاعات اعضای تیم...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-muted">
            <svg className="w-12 h-12 mx-auto text-muted/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            هیچ عضوی یافت نشد. برای شروع دکمه «افزودن عضو جدید» را بزنید.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-raised text-muted text-xs border-b border-border">
                <tr>
                  <th className="py-3.5 px-4 font-medium">ردیف / ترتیب</th>
                  <th className="py-3.5 px-4 font-medium">تصویر پرتره</th>
                  <th className="py-3.5 px-4 font-medium">نام و نام خانوادگی</th>
                  <th className="py-3.5 px-4 font-medium">سمت و تخصص</th>
                  <th className="py-3.5 px-4 font-medium">دپارتمان</th>
                  <th className="py-3.5 px-4 font-medium">شبکه‌ها</th>
                  <th className="py-3.5 px-4 font-medium">وضعیت</th>
                  <th className="py-3.5 px-4 font-medium text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-raised/60 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-muted">
                      {item.position ?? idx}
                    </td>

                    <td className="py-4 px-4">
                      {item.avatarUrl ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-border bg-raised">
                          <Image
                            src={item.avatarUrl}
                            alt={item.nameFa}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center font-bold text-mint text-xs">
                          {item.nameFa.slice(0, 2)}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-foreground">{item.nameFa}</div>
                      <div className="text-xs text-muted font-mono mt-0.5">{item.nameEn}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-foreground">{item.roleFa}</div>
                      <div className="text-xs text-muted font-mono">{item.roleEn}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-xs bg-raised text-foreground border border-border">
                        {item.departmentFa}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5">
                        {Array.isArray(item.socialLinks) && item.socialLinks.map((s, si) => (
                          <a
                            key={si}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            title={s.platform}
                            className="text-xs text-muted hover:text-mint transition-colors"
                          >
                            🔗
                          </a>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          item.isPublished
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 hover:bg-amber-500/25"
                        }`}
                      >
                        {item.isPublished ? "منتشر شده" : "پیش‌نویس"}
                      </button>
                    </td>

                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-raised text-foreground text-xs hover:bg-primary/15 hover:text-mint border border-border transition-colors"
                        >
                          ویرایش
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-700 dark:text-rose-300 text-xs hover:bg-rose-500/25 border border-rose-500/40 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-panel border border-border rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                {editingId ? `ویرایش اطلاعات: ${form.nameFa}` : "افزودن عضو جدید به تیم"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted hover:text-foreground text-sm p-1.5 rounded-lg bg-raised hover:bg-subtle"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Names */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    نام و نام خانوادگی (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nameFa}
                    onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
                    placeholder="مثال: علیرضا فیروزی"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Full Name (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    placeholder="e.g. Alireza Firouzi"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    عنوان شغلی و تخصص (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.roleFa}
                    onChange={(e) => setForm({ ...form, roleFa: e.target.value })}
                    placeholder="مثال: معمار ارشد نرم‌افزار و ابری"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Role & Title (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.roleEn}
                    onChange={(e) => setForm({ ...form, roleEn: e.target.value })}
                    placeholder="e.g. Principal Cloud & Software Architect"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    دپارتمان (فارسی) *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.departmentFa}
                    onChange={(e) => setForm({ ...form, departmentFa: e.target.value })}
                    placeholder="مهندسی نرم‌افزار / طراحی محصول / بازاریابی"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Department (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={form.departmentEn}
                    onChange={(e) => setForm({ ...form, departmentEn: e.target.value })}
                    placeholder="Software Engineering / Product Design"
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Avatar Image Selection with MediaPickerModal */}
              <div className="p-4 rounded-2xl bg-raised border border-border space-y-3">
                <label className="block text-xs font-semibold text-foreground">
                  تصویر پرتره رسمی (Avatar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.avatarUrl ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden relative border border-primary/40 bg-panel shrink-0 shadow-sm">
                      <Image
                        src={form.avatarUrl}
                        alt="Avatar Preview"
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-panel flex items-center justify-center text-xs text-muted shrink-0">
                      بدون تصویر
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        dir="ltr"
                        value={form.avatarUrl || ""}
                        onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                        placeholder="مسیر مستقیم یا انتخاب از کتابخانه..."
                        className="flex-1 bg-panel border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setMediaPickerOpen(true)}
                        className="px-4 py-2 rounded-xl bg-primary/15 text-mint border border-primary/30 text-xs font-bold hover:bg-primary/25 transition-colors shrink-0"
                      >
                        کتابخانه رسانه
                      </button>
                      {form.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, avatarUrl: null })}
                          className="px-3 py-2 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/40 text-xs hover:bg-rose-500/25"
                        >
                          حذف
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted">
                      نسبت تصویر توصیه‌شده: ۱:۱ (مربعی) یا ۴:۵ پرتره عمودی.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    بیوگرافی و شرح سوابق (فارسی)
                  </label>
                  <textarea
                    rows={3}
                    value={form.bioFa}
                    onChange={(e) => setForm({ ...form, bioFa: e.target.value })}
                    placeholder="خلاصه‌ای از تجربیات و زمینه تخصصی..."
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    Biography (English)
                  </label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={form.bioEn}
                    onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
                    placeholder="Brief background and expertise..."
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-foreground">
                    شبکه‌های اجتماعی و پروفایل‌ها
                  </label>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="text-xs text-mint hover:underline font-bold"
                  >
                    + افزودن لینک جدید
                  </button>
                </div>

                <div className="space-y-2">
                  {form.socialLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => updateSocialLink(idx, "platform", e.target.value)}
                        className="bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="email">Email</option>
                        <option value="dribbble">Dribbble</option>
                        <option value="website">وب‌سایت شخصی</option>
                      </select>
                      <input
                        type="text"
                        dir="ltr"
                        value={link.url}
                        onChange={(e) => updateSocialLink(idx, "url", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 bg-raised border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(idx)}
                        className="p-2 text-burgundy hover:bg-rose-500/15 rounded-xl text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positioning and Publication */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">
                    ترتیب نمایش (Position)
                  </label>
                  <input
                    type="number"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-raised border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                  <p className="text-[11px] text-muted mt-1">اعداد کوچکتری اول نمایش داده می‌شوند.</p>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={form.isPublished}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        isPublished: e.target.checked,
                        status: e.target.checked ? "PUBLISHED" : "DRAFT",
                      })
                    }
                    className="w-5 h-5 rounded bg-raised border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-foreground cursor-pointer">
                    انتشار رسمی در وب‌سایت (نمایش عمومی)
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-raised text-foreground border border-border text-sm font-medium hover:bg-subtle transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-lime text-ink text-sm font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-ink border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {editingId ? "ذخیره تغییرات" : "ایجاد عضو تیم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          open={true}
          onSelect={handleMediaSelect}
          onClose={() => setMediaPickerOpen(false)}
        />
      )}
    </div>
  );
}
