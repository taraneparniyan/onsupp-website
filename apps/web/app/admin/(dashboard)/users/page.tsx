"use client";

import { useEffect, useState, useMemo } from "react";
import { adminFetch } from "@/lib/adminApi";

export type RoleType =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR"
  | "CONTENT_SEO_MANAGER"
  | "SUPPORT"
  | "PROJECT_MANAGER"
  | "EMPLOYEE"
  | "USER";

export interface UserItem {
  id: number;
  name: string | null;
  email: string;
  role: RoleType;
  isActive: boolean;
  phone: string | null;
  department: string | null;
  position: string | null;
  createdAt: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  role: RoleType;
  name?: string | null;
}

export interface AuditLogItem {
  id: number;
  userId: number | null;
  action: string;
  targetId: number | null;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    email: string;
    name: string | null;
    role: RoleType;
  } | null;
}

const ROLE_LABELS: Record<RoleType, string> = {
  SUPER_ADMIN: "مدیر ارشد کل",
  ADMIN: "مدیر سایت",
  HR: "مدیر منابع انسانی",
  CONTENT_SEO_MANAGER: "مدیر محتوا و سئو",
  SUPPORT: "کارشناس پشتیبانی",
  PROJECT_MANAGER: "مدیر پروژه",
  EMPLOYEE: "کارمند",
  USER: "کاربر عادی",
};

const ROLE_BADGE_CLASSES: Record<RoleType, string> = {
  SUPER_ADMIN: "bg-purple-950/70 text-purple-300 border-purple-500/40",
  ADMIN: "bg-blue-950/70 text-blue-300 border-blue-500/40",
  HR: "bg-amber-950/70 text-amber-300 border-amber-500/40",
  CONTENT_SEO_MANAGER: "bg-emerald-950/70 text-emerald-300 border-emerald-500/40",
  SUPPORT: "bg-cyan-950/70 text-cyan-300 border-cyan-500/40",
  PROJECT_MANAGER: "bg-indigo-950/70 text-indigo-300 border-indigo-500/40",
  EMPLOYEE: "bg-teal-950/70 text-teal-300 border-teal-500/40",
  USER: "bg-gray-800 text-gray-300 border-gray-600",
};

export default function AdminUsersPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "form">("list");
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Audit Logs modal (Super Admin only)
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE" as RoleType,
    phone: "",
    department: "",
    position: "",
    isActive: true,
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const isHR = currentUser?.role === "HR";

  // Available roles for assignment
  const assignableRoles: RoleType[] = useMemo(() => {
    if (isSuperAdmin) {
      return [
        "SUPER_ADMIN",
        "ADMIN",
        "HR",
        "CONTENT_SEO_MANAGER",
        "SUPPORT",
        "PROJECT_MANAGER",
        "EMPLOYEE",
        "USER",
      ];
    }
    if (isHR) {
      // HR cannot assign SUPER_ADMIN or ADMIN
      return [
        "EMPLOYEE",
        "SUPPORT",
        "CONTENT_SEO_MANAGER",
        "PROJECT_MANAGER",
        "HR",
        "USER",
      ];
    }
    return ["EMPLOYEE"];
  }, [isSuperAdmin, isHR]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get current logged in user
      const meRes = await adminFetch("/api/v1/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setCurrentUser(meData.user);
      }

      // 2. Get users list
      const usersRes = await adminFetch("/api/v1/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
      }
    } catch (err) {
      console.error("Failed to load users data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadAuditLogs = async () => {
    if (!isSuperAdmin) return;
    setLoadingAudit(true);
    try {
      const res = await adminFetch("/api/v1/users/audit-logs");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAuditLogs(data);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleOpenForm = (user?: UserItem) => {
    setFormError(null);
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "", // empty means leave unchanged
        role: user.role,
        phone: user.phone || "",
        department: user.department || "",
        position: user.position || "",
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "EMPLOYEE",
        phone: "",
        department: "",
        position: "",
        isActive: true,
      });
    }
    setViewMode("form");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const url = editingUser
        ? `/api/v1/users/${editingUser.id}`
        : "/api/v1/users";
      const method = editingUser ? "PUT" : "POST";

      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone || null,
        department: formData.department || null,
        position: formData.position || null,
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const res = await adminFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "خطا در ذخیره اطلاعات کاربر");
        setFormSubmitting(false);
        return;
      }

      setViewMode("list");
      await loadData();
    } catch (err) {
      console.error(err);
      setFormError("خطای ارتباط با سرور");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    const actionLabel = user.isActive ? "غیرفعال" : "فعال";
    const confirmMsg = user.isActive
      ? `آیا از غیرفعال‌سازی حساب «${user.name || user.email}» اطمینان دارید؟ با این کار دسترسی او به پنل فوراً مسدود می‌شود.`
      : `آیا از فعال‌سازی مجدد حساب «${user.name || user.email}» اطمینان دارید؟`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await adminFetch(`/api/v1/users/${user.id}/toggle-status`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        await loadData();
      } else {
        alert(data.error || `خطا در ${actionLabel} کردن حساب`);
      }
    } catch (err) {
      console.error(err);
      alert("خطای ارتباط با سرور");
    }
  };

  const handleDelete = async (user: UserItem) => {
    if (!isSuperAdmin) {
      alert("تنها مدیر ارشد کل مجاز به حذف حساب کاربری است.");
      return;
    }

    if (
      !confirm(
        `آیا از حذف کامل حساب «${user.name || user.email}» اطمینان دارید؟ توصیه می‌شود به جای حذف، حساب را غیرفعال کنید.`,
      )
    ) {
      return;
    }

    try {
      const res = await adminFetch(`/api/v1/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        await loadData();
      } else {
        alert(data.error || "خطا در حذف کاربر");
      }
    } catch (err) {
      console.error(err);
      alert("خطای ارتباط با سرور");
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role filter
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;

      // Status filter
      if (statusFilter === "ACTIVE" && !u.isActive) return false;
      if (statusFilter === "INACTIVE" && u.isActive) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesName = u.name?.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesPhone = u.phone?.toLowerCase().includes(q);
        const matchesDept = u.department?.toLowerCase().includes(q);
        const matchesPos = u.position?.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesPhone || matchesDept || matchesPos;
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, searchQuery]);

  // Form View
  if (viewMode === "form") {
    return (
      <div className="space-y-8 w-full" dir="rtl">
        {/* Form Header */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-white">
              {editingUser
                ? `ویرایش اطلاعات پرسنل: ${editingUser.name || editingUser.email}`
                : "ثبت کاربر و کارمند جدید"}
            </h1>
            <p className="text-xs text-mint mt-1">
              تعیین نقش، مشخصات پرسنلی، بخش کاری، شماره تماس و دسترسی امنیتی.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className="px-4 py-2.5 rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white text-xs font-bold transition-all hover:bg-raised/80"
          >
            ← بازگشت به لیست
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSave}
          className="bg-panel border border-foreground/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl w-full max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                نام و نام خانوادگی <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: علی محمدی"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                آدرس ایمیل (شناسه ورود) <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@onsupp.ir"
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                {editingUser
                  ? "رمز عبور جدید (در صورت عدم تغییر، خالی بگذارید)"
                  : "رمز عبور اولیه *"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingUser ? "••••••••" : "حداقل ۸ کاراکتر"}
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                سطح دسترسی (نقش سیستمی) <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as RoleType })}
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              >
                {assignableRoles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]} ({r})
                  </option>
                ))}
              </select>
              {isHR && (
                <p className="text-[11px] text-mint/60 mt-1">
                  * مدیران منابع انسانی تنها مجاز به انتصاب نقش‌های پرسنلی و عملیاتی هستند.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                شماره تماس پرسنل
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                واحد سازمانی (دپارتمان)
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="مثال: فنی، محتوا، پشتیبانی"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-mint mb-2">
                عنوان شغلی (سمت)
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="مثال: توسعه‌دهنده فرانت‌اند"
                className="w-full bg-raised border border-foreground/10 text-sm text-white rounded-xl py-3 px-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-primary bg-raised border-foreground/20"
              />
              <span className="text-sm font-medium text-white">
                حساب کاربری فعال باشد (در صورت غیرفعال بودن، ورود به پنل مسدود است)
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-foreground/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="px-5 py-3 rounded-xl bg-raised text-mint font-bold text-xs hover:text-white transition-colors"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={formSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-[#070e0d] font-black text-xs shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {formSubmitting ? (
                <span>در حال ثبت...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{editingUser ? "بروزرسانی مشخصات پرسنل" : "ایجاد حساب کاربری"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-8 w-full" dir="rtl">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-panel via-panel to-background border border-foreground/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-raised/70 border border-primary/20 text-mint text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            {isHR ? "سامانه مدیریت پرسنل و منابع انسانی" : "مدیریت جامع کاربران، نقش‌ها و امنیت"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isHR ? "مدیریت کارمندان و پرسنل OnSupp" : "مدیریت کاربران و سطوح دسترسی (RBAC)"}
          </h1>
          <p className="text-xs sm:text-sm text-mint max-w-2xl">
            {isHR
              ? "مدیریت حساب کارمندان، تعریف اطلاعات پرسنلی، ویرایش شماره تماس، سمت شغلی و فعال/غیرفعال‌سازی حساب پرسنل."
              : "مدیریت کامل نقش‌ها (Super Admin، Admin، HR، Employee، سئو و محتوا، پشتیبانی و مدیر پروژه)، بازرسی امنیت و لاگ‌های سیستمی."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isSuperAdmin && (
            <button
              onClick={() => {
                setIsAuditModalOpen(true);
                loadAuditLogs();
              }}
              className="px-4 py-3 rounded-xl bg-raised border border-foreground/10 text-mint hover:text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              title="مشاهده گزارش لاگ‌های امنیتی تغییر نقش و وضعیت"
            >
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>لاگ‌های امنیتی (Audit)</span>
            </button>
          )}

          <button
            onClick={() => handleOpenForm()}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-[#070e0d] font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>{isHR ? "ثبت کارمند جدید" : "تعریف کاربر جدید"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-panel border border-foreground/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو بر اساس نام، ایمیل، شماره تماس، دپارتمان یا سمت..."
            className="w-full bg-raised border border-foreground/10 text-sm text-white placeholder-mint/50 rounded-xl py-2.5 px-4 pr-10 focus:outline-none focus:border-primary transition-all"
          />
          <svg className="w-4 h-4 text-mint absolute top-3.5 right-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-raised border border-foreground/10 text-xs text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary"
          >
            <option value="ALL">همه نقش‌ها</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-raised border border-foreground/10 text-xs text-white rounded-xl py-2.5 px-3 focus:outline-none focus:border-primary"
          >
            <option value="ALL">همه وضعیت‌ها</option>
            <option value="ACTIVE">فقط کاربران فعال</option>
            <option value="INACTIVE">فقط کاربران مسدود / غیرفعال</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      {loading ? (
        <div className="text-center py-20 text-mint flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">در حال بارگذاری لیست کاربران و کارمندان...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-panel rounded-2xl border border-foreground/10 text-mint">
          هیچ حسابی منطبق با فیلترهای انتخابی یافت نشد.
        </div>
      ) : (
        <div className="bg-panel border border-foreground/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-raised text-mint font-bold border-b border-foreground/10 text-xs">
                <tr>
                  <th className="p-4">شناسه</th>
                  <th className="p-4">مشخصات کاربر</th>
                  <th className="p-4">اطلاعات سازمانی</th>
                  <th className="p-4">نقش سیستمی</th>
                  <th className="p-4">وضعیت حساب</th>
                  <th className="p-4">تاریخ ثبت</th>
                  <th className="p-4 text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {filteredUsers.map((u) => {
                  const isTargetSuperAdmin = u.role === "SUPER_ADMIN";
                  const isTargetAdmin = u.role === "ADMIN";
                  const hrRestricted = isHR && (isTargetSuperAdmin || isTargetAdmin);

                  return (
                    <tr key={u.id} className="hover:bg-raised/40 transition-colors">
                      {/* ID */}
                      <td className="p-4 text-mint font-mono font-bold text-xs">#{u.id}</td>

                      {/* Name & Contact */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-hover text-[#070e0d] flex items-center justify-center text-xs font-black shadow-inner">
                            {u.name ? u.name.charAt(0) : "ک"}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">
                              {u.name || "بدون نام"}
                            </p>
                            <p className="text-xs text-mint/80 font-mono mt-0.5" dir="ltr">
                              {u.email}
                            </p>
                            {u.phone && (
                              <p className="text-[11px] text-mint/60 font-mono mt-0.5" dir="ltr">
                                {u.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dept & Position */}
                      <td className="p-4 text-xs">
                        {u.department || u.position ? (
                          <div className="space-y-0.5">
                            {u.department && (
                              <p className="text-white font-medium">واحد: {u.department}</p>
                            )}
                            {u.position && (
                              <p className="text-mint/70">سمت: {u.position}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-mint/40 text-xs">—</span>
                        )}
                      </td>

                      {/* Role Badge */}
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold border ${ROLE_BADGE_CLASSES[u.role] || "bg-raised text-mint"}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => !hrRestricted && handleToggleStatus(u)}
                          disabled={hrRestricted}
                          title={
                            hrRestricted
                              ? "مسئول منابع انسانی اجازه تغییر وضعیت مدیران را ندارد"
                              : u.isActive
                              ? "کلیک جهت غیرفعال‌سازی"
                              : "کلیک جهت فعال‌سازی"
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                            hrRestricted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                          } ${
                            u.isActive
                              ? "bg-emerald-950/50 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/50"
                              : "bg-rose-950/50 text-rose-300 border-rose-500/30 hover:bg-rose-900/50"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                          <span>{u.isActive ? "فعال" : "غیرفعال"}</span>
                        </button>
                      </td>

                      {/* Created Date */}
                      <td className="p-4 text-mint/80 text-xs font-mono">
                        {new Date(u.createdAt).toLocaleDateString("fa-IR")}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          {/* Edit Button */}
                          <button
                            onClick={() => !hrRestricted && handleOpenForm(u)}
                            disabled={hrRestricted}
                            title={
                              hrRestricted
                                ? "امکان ویرایش مدیران برای منابع انسانی غیرفعال است"
                                : "ویرایش مشخصات"
                            }
                            className={`px-3 py-1.5 rounded-xl bg-raised border border-primary/20 text-mint text-xs font-bold transition-all ${
                              hrRestricted
                                ? "opacity-40 cursor-not-allowed"
                                : "hover:bg-primary hover:text-[#070e0d]"
                            }`}
                          >
                            ویرایش
                          </button>

                          {/* Delete Button (Super Admin Only) */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
                              title="حذف کامل کاربر"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Modal (Super Admin Only) */}
      {isAuditModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-panel border border-foreground/10 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>گزارش رویدادهای امنیتی (Audit Logs)</span>
                </h2>
                <p className="text-xs text-mint mt-1">
                  ثبت تمامی عملیات تغییر نقش، تغییر وضعیت و ایجاد حساب‌ها جهت نظارت امنیتی.
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-mint hover:text-white p-2 rounded-xl hover:bg-raised"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingAudit ? (
                <div className="text-center py-12 text-mint">در حال فراخوانی لاگ‌ها...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-12 text-mint">هیچ لاگ امنیتی ثبت نشده است.</div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-raised border border-foreground/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white px-2 py-0.5 rounded bg-primary/20 text-mint border border-primary/30">
                            {log.action}
                          </span>
                          <span className="text-mint font-medium">
                            توسط: {log.user?.name || log.user?.email || `شناسه #${log.userId}`}
                          </span>
                        </div>
                        <p className="text-foreground/80">{log.details || "بدون جزئیات"}</p>
                      </div>

                      <div className="text-left sm:shrink-0 text-mint/60 font-mono text-[11px]" dir="ltr">
                        <div>{new Date(log.createdAt).toLocaleString("fa-IR")}</div>
                        {log.ipAddress && <div>IP: {log.ipAddress}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-foreground/10 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-raised text-mint hover:text-white font-bold text-xs"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
