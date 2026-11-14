"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminApi";

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  phone: string | null;
  department: string | null;
  position: string | null;
  createdAt?: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "مدیر ارشد کل",
  ADMIN: "مدیر سایت",
  HR: "مدیر منابع انسانی",
  CONTENT_SEO_MANAGER: "مدیر محتوا و سئو",
  SUPPORT: "کارشناس پشتیبانی",
  PROJECT_MANAGER: "مدیر پروژه",
  EMPLOYEE: "کارمند",
  USER: "کاربر عادی",
};

const ROLE_BADGE_CLASSES: Record<string, string> = {
  SUPER_ADMIN: "bg-primary/15 text-mint border-primary/35",
  ADMIN: "bg-primary/10 text-mint border-primary/25",
  HR: "bg-burgundy/10 text-burgundy border-burgundy/25",
  CONTENT_SEO_MANAGER: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  SUPPORT: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  PROJECT_MANAGER: "bg-primary/10 text-mint border-primary/25",
  EMPLOYEE: "bg-raised text-muted border-border",
  USER: "bg-raised text-muted border-border",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
        }
      } else {
        setStatusMessage({
          type: "error",
          text: "خطا در دریافت مشخصات حساب کاربری.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "خطای ارتباط با سرور.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setStatusMessage(null);

    if (newPassword && newPassword.length < 8) {
      setStatusMessage({
        type: "error",
        text: "رمز عبور جدید باید حداقل ۸ کاراکتر باشد.",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({
        type: "error",
        text: "تکرار رمز عبور جدید با رمز واردشده مطابقت ندارد.",
      });
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        name,
        phone: phone.trim() || null,
      };

      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await adminFetch(`/api/v1/users/${profile.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({
          type: "success",
          text: "اطلاعات پروفایل شما با موفقیت بروزرسانی شد.",
        });
        setNewPassword("");
        setConfirmPassword("");
        await loadProfile();
      } else {
        setStatusMessage({
          type: "error",
          text: data.error || "خطا در بروزرسانی اطلاعات.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({
        type: "error",
        text: "خطای ارتباط با سرور هنگام ذخیره پروفایل.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-mint gap-3" dir="rtl">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm">در حال بارگذاری پروفایل کاربری...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center text-mint bg-panel rounded-2xl border border-foreground/10" dir="rtl">
        مشخصات کاربری یافت نشد. لطفاً مجدداً وارد شوید.
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto" dir="rtl">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-lime text-ink flex items-center justify-center text-2xl font-black shadow-md border border-primary/30">
            {profile.name ? profile.name.charAt(0) : "پ"}
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{profile.name || "کاربر گرامی"}</h1>
            <p className="text-xs text-mint/80 font-mono mt-1" dir="ltr">
              {profile.email}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1.5">
          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${ROLE_BADGE_CLASSES[profile.role] || "bg-raised text-mint"}`}>
            {ROLE_LABELS[profile.role] || profile.role}
          </span>
          <span className="text-[11px] text-mint/60">
            وضعیت حساب: {profile.isActive ? "فعال و معتبر" : "غیرفعال"}
          </span>
        </div>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-panel border border-foreground/10 rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl"
      >
        {/* Read-Only Organizational Information */}
        <div>
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>مشخصات سازمانی و امنیتی</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-raised border border-foreground/10">
            <div>
              <span className="text-[11px] text-mint/60 block mb-1">شناسه کاربری</span>
              <span className="text-xs font-mono text-white font-bold">#{profile.id}</span>
            </div>
            <div>
              <span className="text-[11px] text-mint/60 block mb-1">واحد سازمانی</span>
              <span className="text-xs text-white font-medium">
                {profile.department || "تعیین نشده"}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-mint/60 block mb-1">سمت کاری</span>
              <span className="text-xs text-white font-medium">
                {profile.position || "تعیین نشده"}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-mint/50 mt-2">
            * تغییر نقش و مشخصات سازمانی تنها از طریق مدیر منابع انسانی یا مدیر ارشد کل امکان‌پذیر است.
          </p>
        </div>

        {/* Editable Personal Information */}
        <div className="pt-4 border-t border-foreground/10">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>اطلاعات فردی و تماس</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-mint mb-2">نام و نام خانوادگی</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="نام کامل خود را وارد کنید"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">شماره تماس همراه</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="pt-4 border-t border-foreground/10">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>تغییر کلمه عبور</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                کلمه عبور جدید (اختیاری)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="حداقل ۸ کاراکتر"
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                تکرار کلمه عبور جدید
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="تکرار رمز عبور جدید"
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-foreground/10 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 rounded-xl bg-lime text-ink font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <span>در حال ذخیره...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>ذخیره تغییرات پروفایل</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
