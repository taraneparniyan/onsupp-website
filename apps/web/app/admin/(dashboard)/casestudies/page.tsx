"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type CaseStudy = {
  id: number;
  titleFa: string;
  titleEn: string;
  categoryFa: string;
  categoryEn: string;
  projectType: "website" | "instagram" | "app";
  descriptionFa: string;
  descriptionEn: string;
  liveUrl: string;
  position: number;
};

export default function AdminCaseStudiesPage() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    titleFa: "",
    titleEn: "",
    categoryFa: "",
    categoryEn: "",
    projectType: "website" as "website" | "instagram" | "app",
    descriptionFa: "",
    descriptionEn: "",
    liveUrl: "",
    position: 0,
  });

  const loadData = () => {
    setLoading(true);
    adminFetch("/api/v1/casestudies")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item: CaseStudy) => {
    setEditingId(item.id);
    setFormData({
      titleFa: item.titleFa,
      titleEn: item.titleEn,
      categoryFa: item.categoryFa,
      categoryEn: item.categoryEn,
      projectType: item.projectType || "website",
      descriptionFa: item.descriptionFa,
      descriptionEn: item.descriptionEn,
      liveUrl: item.liveUrl,
      position: item.position || 0,
    });
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      titleFa: "",
      titleEn: "",
      categoryFa: "",
      categoryEn: "",
      projectType: "website",
      descriptionFa: "",
      descriptionEn: "",
      liveUrl: "",
      position: items.length,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = editingId
      ? `/api/v1/casestudies/${editingId}`
      : "/api/v1/casestudies";
    const method = editingId ? "PUT" : "POST";

    const res = await adminFetch(endpoint, {
      method,
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      handleReset();
      loadData();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این کیس استادی اطمینان دارید؟")) return;
    const res = await adminFetch(`/api/v1/casestudies/${id}`, {
      method: "DELETE",
    });
    if (res.ok) loadData();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raised/50 border border-primary/20 text-mint text-xs font-bold">
            📁 نمونه کارها و کیس استادی‌ها
          </div>
          <h1 className="text-3xl font-black text-white">مدیریت کیس استادی‌ها</h1>
          <p className="text-sm text-mint">
            افزودن، ویرایش و مدیریت لیست پروژه‌ها و کیس‌استادی‌های اجرا شده همراه لینک زنده.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Panel */}
        <div className="lg:col-span-5 bg-panel  border border-foreground/10 rounded-xl p-6 space-y-6 shadow-md">
          <h2 className="text-lg font-bold text-white pb-3 border-b border-foreground/10 flex items-center justify-between">
            <span>{editingId ? "ویرایش کیس استادی" : "افزودن کیس استادی جدید"}</span>
            {editingId && (
              <button
                onClick={handleReset}
                className="text-xs text-rose-400 hover:underline"
              >
                انصراف
              </button>
            )}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">
                عنوان فارسی
              </label>
              <input
                type="text"
                required
                value={formData.titleFa}
                onChange={(e) => setFormData({ ...formData, titleFa: e.target.value })}
                placeholder="مثلا: سامانه پایش سلامت MedLink"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">
                عنوان انگلیسی
              </label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="e.g. MedLink Vital Telemetry"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">
                  دسته‌بندی (فارسی)
                </label>
                <input
                  type="text"
                  value={formData.categoryFa}
                  onChange={(e) => setFormData({ ...formData, categoryFa: e.target.value })}
                  placeholder="سلامت و پزشکی"
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-1.5">
                  نوع پروژه
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value as any })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
                >
                  <option value="website">🌐 وب‌سایت</option>
                  <option value="app">📱 اپلیکیشن تحت وب</option>
                  <option value="instagram">📸 پیج اینستاگرام</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">
                لینک زنده پروژه (Direct Live URL)
              </label>
              <input
                type="url"
                required
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">
                توضیحات فارسی
              </label>
              <textarea
                rows={3}
                value={formData.descriptionFa}
                onChange={(e) => setFormData({ ...formData, descriptionFa: e.target.value })}
                placeholder="توضیح خلاصه درباره پروژه..."
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-1.5">
                توضیحات انگلیسی
              </label>
              <textarea
                rows={2}
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                placeholder="Brief project description..."
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-2.5 px-3.5 focus:outline-none focus:border-[#3f6b59]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-sm hover:border-primary/40 border border-transparent shadow-lg transition-all"
            >
              {editingId ? "ذخیره تغییرات" : "افزودن پروژه جدید"}
            </button>
          </form>
        </div>

        {/* List Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white">لیست پروژه‌ها ({items.length})</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-mint">در حال بارگذاری...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 bg-panel rounded-xl border border-foreground/10 text-mint">
              هیچ کیس استادی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-panel border border-foreground/10 hover:border-[#3d6957] p-5 rounded-lg flex items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white truncate">{item.titleFa}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-raised border border-primary/20 text-mint text-[10px]">
                        {item.projectType}
                      </span>
                    </div>
                    <p className="text-xs text-mint truncate">{item.descriptionFa}</p>
                    <a
                      href={item.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-mint hover:underline inline-block truncate"
                    >
                      {item.liveUrl}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-xl bg-raised border border-primary/20 text-mint hover:bg-[#1f4236] transition-all"
                      title="ویرایش"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-all"
                      title="حذف"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
