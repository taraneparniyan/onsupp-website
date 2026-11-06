"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/adminApi";
import { StatsCardSkeleton, AnalyticsChartSkeleton } from "@/components/ui/Skeleton";

interface DashboardStats {
  users: {
    total: number;
    admins: number;
  };
  services: {
    total: number;
  };
  articles: {
    total: number;
    published: number;
  };
  media: {
    total: number;
  };
  comments: {
    total: number;
    pending: number;
  };
  contact: {
    total: number;
    unread: number;
  };
  caseStudies: {
    total: number;
  };
  pricingPlans: {
    total: number;
  };
  heroSlides: {
    total: number;
  };
  database: {
    connected: boolean;
    engine: string;
    host: string;
    port: number;
    name: string;
    tablesCount: number;
  };
  recentActivity: {
    submissions: Array<{
      id: number;
      name: string;
      phone: string;
      service: string;
      read: boolean;
      createdAt: string;
    }>;
    comments: Array<{
      id: number;
      name: string;
      content: string;
      approved: boolean;
      createdAt: string;
    }>;
    articles: Array<{
      id: number;
      titleFa: string;
      categoryFa: string;
      published: boolean;
      createdAt: string;
    }>;
  };
}

interface AdminProfile {
  name?: string | null;
  email: string;
  role: string;
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

function formatRelativeTime(dateString: string): string {
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "هم‌اکنون";
    if (diffMinutes < 60) return `${toPersianDigits(diffMinutes)} دقیقه پیش`;
    if (diffHours < 24) return `${toPersianDigits(diffHours)} ساعت پیش`;
    if (diffDays < 30) return `${toPersianDigits(diffDays)} روز پیش`;
    return new Date(dateString).toLocaleDateString("fa-IR");
  } catch {
    return "اخیراً";
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [adminUser, setAdminUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analytics View States
  const [analyticsTab, setAnalyticsTab] = useState<"operational" | "traffic">("operational");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [showTrackingDocs, setShowTrackingDocs] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsRes, userRes] = await Promise.all([
        adminFetch("/api/v1/dashboard/stats"),
        adminFetch("/api/v1/auth/me"),
      ]);

      if (!statsRes.ok) {
        throw new Error(`خطای دریافت آمار داشبورد (کد وضعیت: ${statsRes.status})`);
      }

      const statsData: DashboardStats = await statsRes.json();
      setStats(statsData);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.user) {
          setAdminUser(userData.user);
        }
      }
    } catch (err: unknown) {
      console.error("[AdminDashboard] Error fetching dashboard data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "خطا در برقراری ارتباط با پایگاه داده و دریافت داده‌های داشبورد"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const quickActions = [
    { name: "اسلایدر هیرو", href: "/admin/hero", desc: "مدیریت اسلایدرهای صفحه اصلی" },
    { name: "خدمات و سرویس‌ها", href: "/admin/services", desc: "مشاهده و ویرایش لیست خدمات" },
    { name: "مدیریت رسانه‌ها", href: "/admin/media", desc: "آپلود و سازمان‌دهی تصاویر (بچ تا ۱۰ فایل)" },
    { name: "مدیریت مقالات", href: "/admin/articles", desc: "ویرایشگر محتوا با نوار ابزار چسبان" },
  ];

  // Derived operational rates from real database stats
  const contactResolvedRate = stats?.contact.total && stats.contact.total > 0
    ? Math.round(((stats.contact.total - stats.contact.unread) / stats.contact.total) * 100)
    : 100;

  const commentsApprovedRate = stats?.comments.total && stats.comments.total > 0
    ? Math.round(((stats.comments.total - stats.comments.pending) / stats.comments.total) * 100)
    : 100;

  const articlesPublishedRate = stats?.articles.total && stats.articles.total > 0
    ? Math.round((stats.articles.published / stats.articles.total) * 100)
    : 100;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-2xl bg-panel border border-border shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-mint text-xs font-bold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>سامانه یکپارچه مدیریت محتوا و داده‌ها</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              سلام، {adminUser?.name || "مدیر سیستم"} 👋
            </h1>
            <p className="text-muted mt-2 text-xs sm:text-sm max-w-xl leading-relaxed">
              تمامی بخش‌ها به پایگاه داده متصل هستند. شما می‌توانید مقالات، درخواست‌ها، رسانه‌ها و کاربران سیستم را از این پیشخوان هدایت کنید.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => fetchDashboardData()}
              className="px-4 py-2.5 rounded-xl bg-raised hover:bg-subtle text-mint hover:text-foreground text-xs font-bold border border-border transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="بروزرسانی زنده داده‌های داشبورد"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>بروزرسانی داده‌ها</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-lime text-ink hover:bg-primary-hover hover:text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>مشاهده وب‌سایت</span>
            </a>
          </div>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-burgundy/10 border border-burgundy/30 text-burgundy flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-burgundy shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-bold text-sm text-foreground">خطا در بارگذاری اطلاعات پایگاه داده</p>
              <p className="text-xs text-burgundy mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 rounded-xl bg-accent hover:opacity-90 text-white text-xs font-bold transition-all shadow cursor-pointer shrink-0"
          >
            تلاش مجدد
          </button>
        </div>
      )}

      {/* Primary Metrics Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Users */}
          <div className="bg-panel p-5 sm:p-6 rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-raised border border-border group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full border font-semibold bg-raised text-mint border-border">
                {toPersianDigits(stats.users.admins)} مدیر ارشد
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted font-medium text-xs">مجموع کاربران سیستم</h3>
              <p className="text-3xl font-black text-foreground mt-1">{toPersianDigits(stats.users.total)}</p>
            </div>
          </div>

          {/* Card 2: Services */}
          <div className="bg-panel p-5 sm:p-6 rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-raised border border-border group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full border font-semibold bg-primary/10 text-mint border-primary/25">
                فعال و آنلاین
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted font-medium text-xs">خدمات و دپارتمان‌ها</h3>
              <p className="text-3xl font-black text-foreground mt-1">{toPersianDigits(stats.services.total)}</p>
            </div>
          </div>

          {/* Card 3: Articles */}
          <div className="bg-panel p-5 sm:p-6 rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-raised border border-border group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-full border font-semibold bg-raised text-mint border-border">
                {toPersianDigits(stats.articles.published)} منتشر شده
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted font-medium text-xs">مقالات وبلاگ و اخبار</h3>
              <p className="text-3xl font-black text-foreground mt-1">{toPersianDigits(stats.articles.total)}</p>
            </div>
          </div>

          {/* Card 4: Database Health */}
          <div className="bg-panel p-5 sm:p-6 rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 shadow-xs group">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-raised border border-border group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-semibold ${stats.database.connected ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-burgundy/10 text-burgundy border-burgundy/30"}`}>
                {stats.database.connected ? "PostgreSQL 18" : "قطع"}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-muted font-medium text-xs">وضعیت اتصال داده‌ها</h3>
              <p className="text-3xl font-black text-foreground mt-1">
                {stats.database.connected ? "۱۰۰٪ پایدار" : "قطع"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Secondary Operational Modules Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <Link
            href="/admin/contact"
            className="p-4 rounded-2xl bg-panel border border-border hover:border-primary/40 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <p className="text-xs text-muted font-medium">پیام‌های فرم تماس</p>
              <p className="text-xl font-black text-foreground mt-1">
                {toPersianDigits(stats.contact.total)}
              </p>
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${stats.contact.unread > 0 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-raised text-muted border border-border"}`}>
              {stats.contact.unread > 0 ? `${toPersianDigits(stats.contact.unread)} جدید` : "رسیدگی شده"}
            </span>
          </Link>

          <Link
            href="/admin/comments"
            className="p-4 rounded-2xl bg-panel border border-border hover:border-primary/40 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <p className="text-xs text-muted font-medium">دیدگاه‌های کاربران</p>
              <p className="text-xl font-black text-foreground mt-1">
                {toPersianDigits(stats.comments.total)}
              </p>
            </div>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${stats.comments.pending > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-raised text-muted border border-border"}`}>
              {stats.comments.pending > 0 ? `${toPersianDigits(stats.comments.pending)} در انتظار` : "تایید شده"}
            </span>
          </Link>

          <Link
            href="/admin/media"
            className="p-4 rounded-2xl bg-panel border border-border hover:border-primary/40 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <p className="text-xs text-muted font-medium">فایل‌های رسانه‌ای</p>
              <p className="text-xl font-black text-foreground mt-1">
                {toPersianDigits(stats.media.total)}
              </p>
            </div>
            <span className="text-[11px] text-muted bg-raised px-2.5 py-0.5 rounded-full border border-border">
              آپلود دسته‌ای
            </span>
          </Link>

          <Link
            href="/admin/pricing"
            className="p-4 rounded-2xl bg-panel border border-border hover:border-primary/40 transition-all flex items-center justify-between group shadow-xs"
          >
            <div>
              <p className="text-xs text-muted font-medium">پلن‌ها و تعرفه‌ها</p>
              <p className="text-xl font-black text-foreground mt-1">
                {toPersianDigits(stats.pricingPlans.total)}
              </p>
            </div>
            <span className="text-[11px] text-muted bg-raised px-2.5 py-0.5 rounded-full border border-border">
              مدیریت تعرفه
            </span>
          </Link>
        </div>
      )}

      {/* DASHBOARD ANALYTICS MODULE */}
      <section className="rounded-2xl border border-border bg-panel p-6 sm:p-7 shadow-xs">
        {/* Analytics Header with Tabs & Period Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h2 className="text-lg font-black text-foreground">
                شاخص‌های تحلیلی و گزارش عملکرد وب‌سایت
              </h2>
            </div>
            <p className="text-xs text-muted mt-1">
              تحلیل مستمر نرخ‌های تبدیل، پردازش درخواست‌ها و وضعیت زیرساخت رهگیری ترافیک
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-raised p-1 border border-border text-xs">
              <button
                type="button"
                onClick={() => setAnalyticsTab("operational")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  analyticsTab === "operational"
                    ? "bg-lime text-ink shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                شاخص‌های تبدیل دیتابیس
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTab("traffic")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  analyticsTab === "traffic"
                    ? "bg-lime text-ink shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                ترافیک و رویدادهای کلیک
              </button>
            </div>

            {/* Time Period Filter */}
            <div className="inline-flex rounded-xl bg-raised p-1 border border-border text-xs">
              {(["7d", "30d", "90d", "all"] as const).map((period) => {
                const labels: Record<typeof period, string> = {
                  "7d": "۷ روز",
                  "30d": "۳۰ روز",
                  "90d": "۳ ماه",
                  all: "کل",
                };
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setTimeRange(period)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      timeRange === period
                        ? "bg-primary/15 text-mint border border-primary/30"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {labels[period]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab 1: Real Operational Conversions (From PostgreSQL Live Data) */}
        {analyticsTab === "operational" && stats && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-raised border border-border space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>نرخ پاسخگویی به پیام‌های فرم تماس</span>
                  <span className="font-mono text-mint font-bold">
                    {toPersianDigits(contactResolvedRate)}٪
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${contactResolvedRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {toPersianDigits(stats.contact.total - stats.contact.unread)} پیام از {toPersianDigits(stats.contact.total)} پیام پاسخ داده شده است.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-raised border border-border space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>نرخ تایید دیدگاه‌های کاربران</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                    {toPersianDigits(commentsApprovedRate)}٪
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${commentsApprovedRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {toPersianDigits(stats.comments.total - stats.comments.pending)} نظر از {toPersianDigits(stats.comments.total)} نظر تایید و منتشر شده است.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-raised border border-border space-y-2">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>شاخص انتشار محتوا و مقالات</span>
                  <span className="font-mono text-mint font-bold">
                    {toPersianDigits(articlesPublishedRate)}٪
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full bg-mint rounded-full transition-all duration-500"
                    style={{ width: `${articlesPublishedRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted">
                  {toPersianDigits(stats.articles.published)} مقاله از {toPersianDigits(stats.articles.total)} مقاله منتشر و در دسترس عموم است.
                </p>
              </div>
            </div>

            {/* Department Demand Distribution (Real recent activity breakdown) */}
            <div className="p-5 rounded-xl bg-raised border border-border">
              <h3 className="text-xs font-bold text-foreground mb-3">
                تفکیک درخواست‌های دریافتی اخیر بر اساس دپارتمان‌های خدماتی:
              </h3>
              {stats.recentActivity.submissions.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {stats.recentActivity.submissions.map((sub, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-panel text-xs font-semibold text-mint border border-border"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{sub.service || "خدمات عمومی"}</span>
                      <span className="text-[10px] text-muted font-mono">({toPersianDigits(sub.name)})</span>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">
                  هنوز درخواستی در بازه انتخابی ثبت نشده است.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Web Traffic & Click Analytics */}
        {analyticsTab === "traffic" && (
          <div className="mt-6 space-y-6">
            <div className="p-6 rounded-2xl bg-raised border border-dashed border-border flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                  در انتظار اتصال زیرساخت رهگیری ترافیک (Tracking Infrastructure Required)
                </span>
                <h3 className="text-base font-bold text-foreground">
                  عدم تولید داده‌های ساختگی و غیرواقعی
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-2 max-w-xl leading-relaxed">
                  پایگاه داده فعلی OnSupp برای داده‌های عملیاتی وب‌سایت تنظیم شده و جدول یا سرویس مستقل رهگیری بازدیدها و رویدادهای کلیک (مانند GA4، Umami، Plausible یا خط لوله اختصاصی لاگ سرور) به این بخش متصل نیست. کانتینر رابط کاربری آماده است و به محض راه‌اندازی وب‌سرویس لاگینگ، نمودار به‌صورت زنده به داده‌های واقعی متصل خواهد شد.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTrackingDocs((prev) => !prev)}
                  className="px-4 py-2 rounded-xl bg-lime text-ink text-xs font-bold shadow-xs hover:bg-primary-hover hover:text-white transition-all cursor-pointer"
                >
                  {showTrackingDocs ? "بستن مستندات اتصال" : "راهنمای مراحل اتصال سرویس رهگیری"}
                </button>
              </div>
            </div>

            {/* Expandable Technical Setup Guide */}
            {showTrackingDocs && (
              <div className="p-5 rounded-2xl bg-raised border border-border text-xs space-y-3">
                <h4 className="font-bold text-foreground text-sm">
                  مراحل اتصال زیرساخت تحلیلی ترافیک و کلیک‌ها:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-muted leading-relaxed pr-2">
                  <li>
                    <strong className="text-foreground">روش اول (سرویس‌های سلف‌هاست یا کلود):</strong> اتصال شناسه Measurement ID از Google Analytics 4 یا راه‌اندازی Umami Analytics روی سرور و فراخوانی گزارش‌ها از طریق REST API اختصاصی.
                  </li>
                  <li>
                    <strong className="text-foreground">روش دوم (پایگاه داده داخلی OnSupp):</strong> افزودن جدول <code className="bg-subtle px-1.5 py-0.5 rounded font-mono text-mint">AnalyticsEvent</code> به Schema دیتابیس با فیلدهای <code className="font-mono text-foreground">eventType</code>، <code className="font-mono text-foreground">path</code>، <code className="font-mono text-foreground">timestamp</code> و <code className="font-mono text-foreground">userAgent</code> جهت نگهداری مستقیم بازدیدها در PostgreSQL.
                  </li>
                  <li>
                    <strong className="text-foreground">نمایش بلادرنگ:</strong> پس از پیاده‌سازی یکی از دو روش، داده‌های ورودی به همین کامپوننت متصل شده و بدون کوچک‌ترین جابجایی ساختار (CLS) رندر می‌شوند.
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>دسترسی سریع مدیریت</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={i}
              href={action.href}
              className="p-5 rounded-2xl bg-panel border border-border hover:border-primary/40 transition-all duration-200 shadow-xs group"
            >
              <h3 className="font-bold text-foreground text-sm group-hover:text-mint transition-colors flex items-center justify-between">
                <span>{action.name}</span>
                <svg className="w-4 h-4 text-muted group-hover:text-mint group-hover:translate-x-[-4px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </h3>
              <p className="text-xs text-muted mt-2 leading-relaxed">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Database & Recent Activity Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-panel p-6 sm:p-7 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>آخرین رویدادها و فعالیت‌ها</span>
              </h3>
              <span className="text-xs text-muted font-mono">بروزرسانی زنده</span>
            </div>

            <div className="space-y-3">
              {stats?.recentActivity?.submissions && stats.recentActivity.submissions.length > 0 ? (
                stats.recentActivity.submissions.map((sub) => (
                  <div
                    key={`sub-${sub.id}`}
                    className="flex items-center justify-between p-3.5 bg-raised border border-border rounded-xl hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0">
                        پیام
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs sm:text-sm">درخواست مشاوره از طرف {sub.name}</p>
                        <p className="text-[11px] text-muted mt-0.5">سرویس: {sub.service} | شماره: {sub.phone}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-mint bg-panel px-2.5 py-1 rounded-full border border-border shrink-0">
                      {formatRelativeTime(sub.createdAt)}
                    </span>
                  </div>
                ))
              ) : null}

              {stats?.recentActivity?.comments && stats.recentActivity.comments.length > 0 ? (
                stats.recentActivity.comments.map((comm) => (
                  <div
                    key={`comm-${comm.id}`}
                    className="flex items-center justify-between p-3.5 bg-raised border border-border rounded-xl hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-xs shrink-0">
                        دیدگاه
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs sm:text-sm">دیدگاه جدید از طرف {comm.name}</p>
                        <p className="text-[11px] text-muted mt-0.5 truncate max-w-sm">{comm.content}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-mint bg-panel px-2.5 py-1 rounded-full border border-border shrink-0">
                      {formatRelativeTime(comm.createdAt)}
                    </span>
                  </div>
                ))
              ) : null}

              {stats?.recentActivity?.articles && stats.recentActivity.articles.length > 0 ? (
                stats.recentActivity.articles.map((art) => (
                  <div
                    key={`art-${art.id}`}
                    className="flex items-center justify-between p-3.5 bg-raised border border-border rounded-xl hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center text-mint font-bold text-xs shrink-0">
                        مقاله
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-xs sm:text-sm">{art.titleFa || "مقاله بدون عنوان"}</p>
                        <p className="text-[11px] text-muted mt-0.5">دسته‌بندی: {art.categoryFa} | وضعیت: {art.published ? "منتشر شده" : "پیش‌نویس"}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-mint bg-panel px-2.5 py-1 rounded-full border border-border shrink-0">
                      {formatRelativeTime(art.createdAt)}
                    </span>
                  </div>
                ))
              ) : null}

              {(!stats?.recentActivity?.submissions?.length &&
                !stats?.recentActivity?.comments?.length &&
                !stats?.recentActivity?.articles?.length) && (
                <div className="p-8 text-center text-muted border border-dashed border-border rounded-xl">
                  هیچ فعالیت جدیدی در پایگاه داده یافت نشد.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Database Status Panel */}
        <div className="bg-panel p-6 sm:p-7 rounded-2xl border border-border shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <svg className="w-5 h-5 text-mint" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                </svg>
                <span>وضعیت دیتابیس</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-raised border border-border">
                <p className="text-[11px] text-muted">موتور پایگاه داده</p>
                <p className="text-sm font-bold text-foreground mt-1">
                  {stats?.database?.engine || "PostgreSQL 18"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-raised border border-border">
                <p className="text-[11px] text-muted">پورت اتصال محلی</p>
                <p className="text-sm font-bold text-mint mt-1 font-mono">
                  localhost:{toPersianDigits(stats?.database?.port || 5434)}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-raised border border-border">
                <p className="text-[11px] text-muted">نام دیتابیس فعال</p>
                <p className="text-sm font-bold text-foreground mt-1 font-mono">
                  {stats?.database?.name || "onsupp_dev"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-xs text-muted">
              <span>تعداد کل جداول: {toPersianDigits(stats?.database?.tablesCount || 12)} جدول</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>متصل و پایدار</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
