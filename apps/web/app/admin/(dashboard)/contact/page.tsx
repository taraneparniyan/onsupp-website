"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

type ContactContent = {
  eyebrowFa: string;
  eyebrowEn: string;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  phone: string;
  phoneLabelFa: string;
  phoneLabelEn: string;
  email: string;
  emailLabelFa: string;
  emailLabelEn: string;
  responseTimeFa: string;
  responseTimeEn: string;
};

type Submission = {
  id: number;
  name: string;
  phone: string;
  email?: string;
  service: string;
  message?: string;
  read: boolean;
  createdAt: string;
};

export default function AdminContactPage() {
  const [activeTab, setActiveTab] = useState<"submissions" | "settings">("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Contact Section Settings Form
  const [content, setContent] = useState<ContactContent>({
    eyebrowFa: "",
    eyebrowEn: "",
    titleFa: "",
    titleEn: "",
    descriptionFa: "",
    descriptionEn: "",
    phone: "",
    phoneLabelFa: "",
    phoneLabelEn: "",
    email: "",
    emailLabelFa: "",
    emailLabelEn: "",
    responseTimeFa: "",
    responseTimeEn: "",
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSubmissions = () => {
    setLoadingSubmissions(true);
    adminFetch("/api/v1/contact/submissions")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setSubmissions(data);
      })
      .finally(() => setLoadingSubmissions(false));
  };

  const loadContent = () => {
    adminFetch("/api/v1/contact/content")
      .then((res) => res.json())
      .then((data) => {
        if (data) setContent(data);
      });
  };

  useEffect(() => {
    loadSubmissions();
    loadContent();
  }, []);

  const handleToggleRead = async (sub: Submission) => {
    const res = await adminFetch(`/api/v1/contact/submissions/${sub.id}/read`, {
      method: "PUT",
      body: JSON.stringify({ read: !sub.read }),
    });

    if (res.ok) {
      loadSubmissions();
      if (selectedSubmission?.id === sub.id) {
        setSelectedSubmission({ ...selectedSubmission, read: !sub.read });
      }
    }
  };

  const handleDeleteSubmission = async (id: number) => {
    if (!confirm("آیا از حذف این پیام اطمینان دارید؟")) return;
    const res = await adminFetch(`/api/v1/contact/submissions/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      if (selectedSubmission?.id === id) setSelectedSubmission(null);
      loadSubmissions();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSavedSuccess(false);

    const res = await adminFetch("/api/v1/contact/content", {
      method: "PUT",
      body: JSON.stringify(content),
    });

    setSavingSettings(false);
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      loadContent();
    }
  };

  const unreadCount = submissions.filter((s) => !s.read).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="p-8 rounded-xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raised/50 border border-primary/20 text-mint text-xs font-bold">
            📬 فرم‌های تماس و تنظیمات بخش مشاوره
          </div>
          <h1 className="text-3xl font-black text-white">مدیریت پیام‌ها و محتوای بخش تماس</h1>
          <p className="text-sm text-mint">
            مشاهده پیام‌های ارسال‌شده کاربران و تنظیم عنوان، متون، تلفن و ایمیل بخش تماس.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 bg-raised p-1.5 rounded-lg border border-foreground/10">
          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === "submissions"
                ? "bg-gradient-to-r from-primary to-primary-hover text-white border border-primary/40 shadow-md"
                : "text-mint hover:text-white"
            }`}
          >
            📥 پیام‌های دریافتی
            {unreadCount > 0 && (
              <span className="mr-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "settings"
                ? "bg-gradient-to-r from-primary to-primary-hover text-white border border-primary/40 shadow-md"
                : "text-mint hover:text-white"
            }`}
          >
            ⚙️ تنظیمات دیزاین و متون
          </button>
        </div>
      </div>

      {/* TAB 1: SUBMISSIONS LIST & DETAIL */}
      {activeTab === "submissions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Submissions Table / List */}
          <div className="lg:col-span-6 bg-panel border border-foreground/10 rounded-xl p-6 space-y-4 shadow-md">
            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
              <h2 className="text-lg font-bold text-white">پیام‌های ارسال‌شده ({submissions.length})</h2>
              <button
                onClick={loadSubmissions}
                className="text-xs text-mint hover:underline flex items-center gap-1"
              >
                🔄 بروزرسانی
              </button>
            </div>

            {loadingSubmissions ? (
              <div className="text-center py-12 text-mint">در حال بارگذاری پیام‌ها...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-12 text-mint">هنوز پیامی دریافت نشده است.</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {submissions.map((sub) => {
                  const isSelected = selectedSubmission?.id === sub.id;
                  return (
                    <div
                      key={sub.id}
                      onClick={() => {
                        setSelectedSubmission(sub);
                        if (!sub.read) handleToggleRead(sub);
                      }}
                      className={`p-4 rounded-lg border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? "bg-[#142e26] border-mint/20 shadow-md"
                          : sub.read
                          ? "bg-panel/60 border-[#1c3a30] opacity-80"
                          : "bg-[#11261f] border-mint/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {!sub.read && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                          )}
                          <h3 className="font-bold text-white text-sm">{sub.name}</h3>
                        </div>
                        <span className="text-[10px] text-mint">
                          {new Date(sub.createdAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-mint">
                        <span className="font-mono">{sub.phone}</span>
                        <span className="px-2 py-0.5 rounded bg-raised text-mint text-[10px]">
                          {sub.service}
                        </span>
                      </div>

                      {sub.message && (
                        <p className="text-xs text-mint line-clamp-1">{sub.message}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submission Details Card */}
          <div className="lg:col-span-6">
            {selectedSubmission ? (
              <div className="bg-panel border border-foreground/10 rounded-xl p-6 space-y-6 shadow-md sticky top-24">
                <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                  <div>
                    <span className="text-xs text-mint">جزئیات پیام شماره #{selectedSubmission.id}</span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedSubmission.name}</h2>
                  </div>
                  <button
                    onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5"
                  >
                    🗑️ حذف
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-lg bg-raised border border-foreground/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-mint">شماره تماس:</span>
                      <a
                        href={`tel:${selectedSubmission.phone}`}
                        className="font-bold text-mint font-mono dir-ltr hover:underline"
                      >
                        {selectedSubmission.phone}
                      </a>
                    </div>

                    {selectedSubmission.email && (
                      <div className="flex items-center justify-between pt-2 border-t border-foreground/10">
                        <span className="text-xs text-mint">ایمیل:</span>
                        <a
                          href={`mailto:${selectedSubmission.email}`}
                          className="font-bold text-mint font-mono hover:underline"
                        >
                          {selectedSubmission.email}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-foreground/10">
                      <span className="text-xs text-mint">خدمت درخواستی:</span>
                      <span className="font-bold text-white px-2.5 py-1 rounded-lg bg-raised/50 text-xs">
                        {selectedSubmission.service}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-foreground/10">
                      <span className="text-xs text-mint">تاریخ ثبت:</span>
                      <span className="text-xs text-mint">
                        {new Date(selectedSubmission.createdAt).toLocaleString("fa-IR")}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mint mb-2">متن پیام و شرح پروژه:</label>
                    <div className="p-4 rounded-lg bg-raised border border-foreground/10 text-white text-sm leading-7 whitespace-pre-wrap min-h-[120px]">
                      {selectedSubmission.message || "بدون توضیحات متنی."}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleRead(selectedSubmission)}
                      className="px-4 py-2 rounded-xl bg-raised border border-primary/20 text-mint text-xs font-bold hover:bg-[#1f4236]"
                    >
                      {selectedSubmission.read ? "علامت‌گذاری به عنوان خوانده‌نشده" : "علامت‌گذاری به عنوان خوانده‌شده"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-panel border border-foreground/10 rounded-xl p-12 text-center text-mint shadow-md">
                جهت مشاهده جزئیات کامل، روی یکی از پیام‌های لیست کلیک کنید.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SETTINGS & DESIGN */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="bg-panel border border-foreground/10 rounded-xl p-8 space-y-8 shadow-md">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <h2 className="text-xl font-bold text-white">تنظیمات متون و عناوین بخش تماس (Contact CTA)</h2>
            {savedSuccess && (
              <span className="px-3 py-1 rounded-full bg-mint/10 text-mint text-xs font-bold border border-mint/20">
                ✓ تغییرات با موفقیت ذخیره شد
              </span>
            )}
          </div>

          {/* Section 1: Main Headings */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-mint">۱. عناوین اصلی بخش</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">عنوان کوچک / Eyebrow (فارسی)</label>
                <input
                  type="text"
                  value={content.eyebrowFa}
                  onChange={(e) => setContent({ ...content, eyebrowFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">عنوان کوچک / Eyebrow (انگلیسی)</label>
                <input
                  type="text"
                  value={content.eyebrowEn}
                  onChange={(e) => setContent({ ...content, eyebrowEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">تیتر اصلی بزرگ (فارسی)</label>
                <input
                  type="text"
                  value={content.titleFa}
                  onChange={(e) => setContent({ ...content, titleFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">تیتر اصلی بزرگ (انگلیسی)</label>
                <input
                  type="text"
                  value={content.titleEn}
                  onChange={(e) => setContent({ ...content, titleEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">توضیحات معرفی (فارسی)</label>
                <textarea
                  rows={3}
                  value={content.descriptionFa}
                  onChange={(e) => setContent({ ...content, descriptionFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl p-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">توضیحات معرفی (انگلیسی)</label>
                <textarea
                  rows={3}
                  value={content.descriptionEn}
                  onChange={(e) => setContent({ ...content, descriptionEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl p-4 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Phone & Email Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-mint">۲. اطلاعات تماس و ایمیل</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">شماره تلفن نمایش داده شده</label>
                <input
                  type="text"
                  value={content.phone}
                  onChange={(e) => setContent({ ...content, phone: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب تلفن (فارسی)</label>
                <input
                  type="text"
                  value={content.phoneLabelFa}
                  onChange={(e) => setContent({ ...content, phoneLabelFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب تلفن (انگلیسی)</label>
                <input
                  type="text"
                  value={content.phoneLabelEn}
                  onChange={(e) => setContent({ ...content, phoneLabelEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">ایمیل نمایش داده شده</label>
                <input
                  type="text"
                  value={content.email}
                  onChange={(e) => setContent({ ...content, email: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب ایمیل (فارسی)</label>
                <input
                  type="text"
                  value={content.emailLabelFa}
                  onChange={(e) => setContent({ ...content, emailLabelFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">برچسب ایمیل (انگلیسی)</label>
                <input
                  type="text"
                  value={content.emailLabelEn}
                  onChange={(e) => setContent({ ...content, emailLabelEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-mint mb-2">متن زمان پاسخگویی (فارسی)</label>
                <input
                  type="text"
                  value={content.responseTimeFa}
                  onChange={(e) => setContent({ ...content, responseTimeFa: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-mint mb-2">متن زمان پاسخگویی (انگلیسی)</label>
                <input
                  type="text"
                  value={content.responseTimeEn}
                  onChange={(e) => setContent({ ...content, responseTimeEn: e.target.value })}
                  className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/10 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-primary to-primary-hover text-white font-black text-sm border border-primary/40 shadow-md hover:scale-105 transition-all"
            >
              {savingSettings ? "در حال ذخیره‌سازی..." : "ذخیره تغییرات بخش تماس"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
