"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { logout } from "@/lib/actions/auth";
import { adminFetch } from "@/lib/adminApi";
import { useTheme } from "@/context/ThemeContext";

interface AdminUser {
  id: number;
  email: string;
  role: string;
  name?: string | null;
  phone?: string | null;
  department?: string | null;
  position?: string | null;
  isActive?: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "مدیر ارشد کل",
  ADMIN: "مدیر سایت",
  HR: "مدیر منابع انسانی",
  CONTENT_SEO_MANAGER: "مدیر محتوا و سئو",
  SUPPORT: "کارشناس پشتیبانی",
  PROJECT_MANAGER: "مدیر پروژه",
  EMPLOYEE: "کارمند",
  USER: "کاربر",
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

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NotificationCounts {
  unreadContact: number;
  pendingComments: number;
  dbConnected: boolean;
  dbPort: number;
}

function toPersianDigits(n: number | string): string {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (x) => farsiDigits[parseInt(x, 10)]);
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authenticated user state
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Live notifications & DB status
  const [notifications, setNotifications] = useState<NotificationCounts>({
    unreadContact: 0,
    pendingComments: 0,
    dbConnected: true,
    dbPort: 5434,
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Quick navigation search state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const allMenuItems: MenuItem[] = [
    { 
      name: "داشبورد", 
      href: "/admin", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ) 
    },
    { 
      name: "تنظیمات سایت", 
      href: "/admin/settings", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ) 
    },
    { 
      name: "چیدمان بخش‌ها", 
      href: "/admin/sections", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 11a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM4 17a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2z" />
        </svg>
      ) 
    },
    { 
      name: "مدیریت رسانه‌ها", 
      href: "/admin/media", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      name: "اسلایدر هیرو", 
      href: "/admin/hero", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4M4 12h16" />
        </svg>
      ) 
    },
    { 
      name: "خدمات و سرویس‌ها", 
      href: "/admin/services", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) 
    },
    { 
      name: "آمار و ارقام", 
      href: "/admin/stats", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ) 
    },
    { 
      name: "محتوای درباره ما", 
      href: "/admin/about", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
    { 
      name: "اعضای تیم", 
      href: "/admin/team", 
      roles: ["SUPER_ADMIN", "ADMIN", "HR"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) 
    },
    { 
      name: "مدیریت کیس استادی‌ها", 
      href: "/admin/casestudies", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ) 
    },
    { 
      name: "کارفرمایان و همکاران", 
      href: "/admin/clients", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      name: "لوگوی مشتریان", 
      href: "/admin/client-logos", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      name: "رضایت و نظرات مشتریان", 
      href: "/admin/testimonials", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ) 
    },
    { 
      name: "مدیریت مقالات و اخبار", 
      href: "/admin/articles", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      ) 
    },
    { 
      name: "دیدگاه‌ها و نظرات مقالات", 
      href: "/admin/comments", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER", "SUPPORT"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ) 
    },
    { 
      name: "پیام‌ها و فرم‌های تماس", 
      href: "/admin/contact", 
      roles: ["SUPER_ADMIN", "ADMIN", "SUPPORT"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ) 
    },
    { 
      name: "مدیریت پلن‌ها و تعرفه‌ها", 
      href: "/admin/pricing", 
      roles: ["SUPER_ADMIN", "ADMIN"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ) 
    },
    { 
      name: "سئو و بهینه‌سازی صفحات", 
      href: "/admin/seo", 
      roles: ["SUPER_ADMIN", "ADMIN", "CONTENT_SEO_MANAGER"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
      ) 
    },
    { 
      name: "مدیریت کاربران و نقش‌ها", 
      href: "/admin/users", 
      roles: ["SUPER_ADMIN", "HR"],
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) 
    },
    {
      name: "پروفایل من",
      href: "/admin/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const menu = allMenuItems
    .filter((item) => {
      if (!item.roles) return true;
      if (!user) {
        // During initial load, preserve standard admin navigation (excluding users management)
        // to prevent UI layout flash
        return isLoadingUser && item.href !== "/admin/users";
      }
      return item.roles.includes(user.role);
    })
    .map((item) => {
      if (item.href === "/admin/users" && user?.role === "HR") {
        return { ...item, name: "مدیریت پرسنل و کارمندان" };
      }
      return item;
    });

  // Fetch admin profile and notifications on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // 1. Fetch user profile
        const authRes = await adminFetch("/api/v1/auth/me");
        if (authRes.ok) {
          const authData = await authRes.json();
          if (isMounted && authData?.user) {
            setUser(authData.user);
          }
        }

        // 2. Fetch live stats & notification counts
        const statsRes = await adminFetch("/api/v1/dashboard/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (isMounted) {
            setNotifications({
              unreadContact: statsData?.contact?.unread || 0,
              pendingComments: statsData?.comments?.pending || 0,
              dbConnected: statsData?.database?.connected ?? true,
              dbPort: statsData?.database?.port || 5434,
            });
          }
        }
      } catch (err) {
        console.error("[admin layout] error fetching data:", err);
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered menu items for quick-navigation search
  const filteredMenuItems = searchQuery.trim()
    ? menu.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const totalNotifications = notifications.unreadContact + notifications.pendingComments;

  return (
    <div className="admin-shell flex min-h-screen bg-background text-foreground font-sans" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-panel border-l border-border p-5 flex flex-col justify-between fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 shadow-sm ${isSidebarOpen ? "translate-x-0 right-0" : "translate-x-full right-0 lg:translate-x-0"}`}>
        <div className="flex-1 overflow-y-auto min-h-0 pl-1 -mr-2 pr-2">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 mb-6 px-3.5 py-3 bg-raised rounded-2xl border border-border shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#38534a] p-1.5 border border-primary/30 flex items-center justify-center shrink-0 shadow-xs">
              <Image
                src="/images/logo/logo-light.webp"
                alt="OnSupp"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-black text-foreground tracking-wide truncate">پنل مدیریت OnSupp</h1>
              <p className="text-[11px] text-mint font-mono font-semibold">OnSupp Enterprise</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 pb-4">
            {menu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-lime text-ink font-bold shadow-md border border-primary/40"
                      : "text-muted hover:bg-raised hover:text-foreground"
                  }`}
                >
                  <span className={`transition-transform duration-200 shrink-0 ${isActive ? "text-ink" : "text-mint group-hover:text-foreground"}`}>
                    {item.icon}
                  </span>
                  <span className="text-xs font-semibold">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        <div className="mt-4 pt-4 border-t border-border">
          {isLoadingUser ? (
            <div className="p-3 rounded-2xl bg-raised border border-border flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-subtle"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-subtle rounded w-24"></div>
                <div className="h-2.5 bg-subtle rounded w-32"></div>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-raised border border-border flex items-center gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-lime border border-primary/30 flex items-center justify-center font-black text-ink text-sm shrink-0 shadow-xs">
                {user?.name ? user.name[0] : (user?.role ? user.role[0] : "O")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.name || "کاربر سیستم"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${ROLE_BADGE_CLASSES[user?.role || ""] || "bg-panel text-mint border-border"}`}>
                    {ROLE_LABELS[user?.role || ""] || user?.role || "کاربر"}
                  </span>
                </div>
              </div>
              <Link
                href="/admin/profile"
                title="ویرایش پروفایل من"
                className="text-muted hover:text-foreground p-1.5 transition-colors rounded-lg hover:bg-subtle shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
              <button 
                title="خروج از حساب کاربری" 
                onClick={() => logout()}
                className="text-muted hover:text-burgundy p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-subtle shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header - Unified OnSupp Glassmorphism */}
        <header className="h-16 bg-panel/90 border-b border-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-foreground hover:bg-raised rounded-xl transition-colors"
              aria-label="باز کردن منوی سایدبار"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Interactive Quick-Navigation Search */}
            <div ref={searchRef} className="relative w-56 sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setIsSearchOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredMenuItems.length > 0) {
                    router.push(filteredMenuItems[0].href);
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  } else if (e.key === "Escape") {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder="جستجو در بخش‌های پنل..."
                className="w-full bg-raised border border-border text-xs sm:text-sm text-foreground placeholder-muted rounded-xl py-2 px-4 pr-10 pl-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <svg className="w-4 h-4 text-mint absolute top-3 right-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                  className="absolute top-2.5 left-2.5 text-muted hover:text-foreground p-0.5 rounded transition-colors"
                  aria-label="پاک کردن جستجو"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* Quick Navigation Dropdown */}
              {isSearchOpen && searchQuery.trim() && (
                <div className="absolute top-full mt-2 right-0 left-0 bg-panel border border-border rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                  {filteredMenuItems.length > 0 ? (
                    <div className="py-1">
                      {filteredMenuItems.map((item) => (
                        <button
                          key={item.href}
                          onClick={() => {
                            router.push(item.href);
                            setSearchQuery("");
                            setIsSearchOpen(false);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-right text-foreground hover:bg-raised transition-colors"
                        >
                          <span className="text-mint">{item.icon}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-muted">
                      بخشی با عنوان &quot;{searchQuery}&quot; یافت نشد
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Database Status Pill */}
            <div className="hidden md:flex items-center gap-2 bg-raised border border-primary/25 px-3.5 py-1.5 rounded-full text-xs font-semibold text-mint shadow-xs">
              <span className={`w-2 h-2 rounded-full ${notifications.dbConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></span>
              {notifications.dbConnected
                ? `دیتابیس متصل (Port ${toPersianDigits(notifications.dbPort)})`
                : "خطای اتصال دیتابیس"}
            </div>

            {/* Dual Segmented Theme Switcher (Light / Dark) */}
            <div
              role="group"
              aria-label="انتخاب تم پنل مدیریت"
              className="inline-flex items-center p-1 rounded-xl bg-raised border border-border shadow-xs"
            >
              <button
                type="button"
                onClick={() => setTheme("light")}
                aria-pressed={theme === "light"}
                title="حالت روشن (Light Mode)"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "light"
                    ? "bg-lime text-ink shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="hidden sm:inline">روشن</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                aria-pressed={theme === "dark"}
                title="حالت تاریک (Dark Mode)"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "dark"
                    ? "bg-lime text-ink shadow-xs"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="hidden sm:inline">تاریک</span>
              </button>
            </div>

            {/* Functional Notification Icon & Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative p-2.5 rounded-xl bg-raised border border-border text-mint hover:text-foreground hover:border-primary/50 transition-all cursor-pointer shadow-xs"
                aria-label="اعلان‌ها"
              >
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-ink text-[11px] font-black flex items-center justify-center px-1 shadow-xs animate-pulse">
                    {toPersianDigits(totalNotifications)}
                  </span>
                )}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
                </svg>
              </button>

              {/* Notification Popover Dropdown */}
              {isNotificationsOpen && (
                <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 w-72 sm:w-80 bg-panel border border-border rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span>اعلان‌ها و رویدادها</span>
                      {totalNotifications > 0 && (
                        <span className="text-[11px] bg-primary/15 text-mint px-2 py-0.5 rounded-full border border-primary/30 font-bold">
                          {toPersianDigits(totalNotifications)} جدید
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-muted">بروزرسانی زنده</span>
                  </div>

                  <div className="space-y-2.5 mt-3">
                    {/* Unread Contact Submissions */}
                    <Link
                      href="/admin/contact"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-3 rounded-lg bg-raised hover:bg-subtle border border-border hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground group-hover:text-mint transition-colors">
                          پیام‌های فرم تماس
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${notifications.unreadContact > 0 ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30" : "bg-panel text-muted"}`}>
                          {notifications.unreadContact > 0
                            ? `${toPersianDigits(notifications.unreadContact)} خوانده‌نشده`
                            : "بدون پیام جدید"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">
                        {notifications.unreadContact > 0
                          ? "برای پاسخگویی و مشاهده پیام‌ها کلیک کنید."
                          : "همه درخواست‌های مشاوره و پیام‌ها بررسی شده‌اند."}
                      </p>
                    </Link>

                    {/* Pending Comments */}
                    <Link
                      href="/admin/comments"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="block p-3 rounded-lg bg-raised hover:bg-subtle border border-border hover:border-primary/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground group-hover:text-mint transition-colors">
                          دیدگاه‌های مقالات
                        </span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${notifications.pendingComments > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30" : "bg-panel text-muted"}`}>
                          {notifications.pendingComments > 0
                            ? `${toPersianDigits(notifications.pendingComments)} در انتظار تایید`
                            : "بدون دیدگاه معلق"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-1 leading-relaxed">
                        {notifications.pendingComments > 0
                          ? "نظرات کاربران در انتظار تایید و انتشار هستند."
                          : "تمامی دیدگاه‌های ارسالی تعیین وضعیت شده‌اند."}
                      </p>
                    </Link>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border text-center">
                    <span className="text-[11px] text-muted">
                      پایگاه داده: {notifications.dbConnected ? "متصل و فعال" : "قطع ارتباط"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
