"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { login, State } from "@/lib/actions/auth";
import { useTheme } from "@/context/ThemeContext";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    login,
    undefined,
  );

  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const { theme, setTheme, isReady } = useTheme();
  const isLightTheme = isReady && theme === "light";
  const isDarkTheme = isReady && theme === "dark";

  const activeError = clientError || state?.error;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setClientError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = (formData.get("email") as string || "").trim();
    const password = (formData.get("password") as string || "").trim();

    if (!email) {
      e.preventDefault();
      setClientError("لطفاً ایمیل کاربری را وارد کنید.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      setClientError("فرمت ایمیل نامعتبر است. نمونه: admin@onsupp.ir");
      return;
    }

    if (!password) {
      e.preventDefault();
      setClientError("لطفاً کلمه عبور را وارد کنید.");
      return;
    }
  };

  return (
    <main
      className="admin-shell relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-8 font-sans selection:bg-primary/25 selection:text-foreground"
      dir="rtl"
    >
      {/* Top-Left Accessible Segmented Theme Switcher */}
      <div className="absolute top-6 left-6 z-20">
        <div
          role="group"
          aria-label="انتخاب تم"
          className="inline-flex items-center p-1 rounded-2xl bg-panel border border-border shadow-sm"
        >
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-pressed={isLightTheme}
            title="حالت روشن (Light Mode)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isLightTheme
                ? "bg-lime text-ink shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>روشن</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-pressed={isDarkTheme}
            title="حالت تاریک (Dark Mode)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isDarkTheme
                ? "bg-lime text-ink shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            <span>تاریک</span>
          </button>
        </div>
      </div>

      {/* Ambient background glow matching OnSupp design system */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-35 blur-3xl"
        aria-hidden="true"
      >
        <div className="h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#38534a]/25 via-[#38534a]/15 to-transparent" />
      </div>

      {/* Login Card Frame */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-border bg-panel p-8 sm:p-10 shadow-2xl">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          {/* Official OnSupp Brand Icon Container */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-[#38534a] shadow-md p-3">
            <Image
              src="/images/logo/logo-light.webp"
              alt="OnSupp"
              width={40}
              height={40}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Typography Hierarchy */}
          <h1 className="text-2xl font-black tracking-wide text-foreground sm:text-3xl">
            ورود به پنل مدیریت
          </h1>
          <p className="mt-2 text-xs text-muted sm:text-sm">
            برای مدیریت محتوای وب‌سایت OnSupp، وارد حساب شوید
          </p>
        </div>

        {/* Error Alert Message */}
        {activeError && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-burgundy/30 bg-burgundy/10 px-4 py-3 text-xs text-burgundy shadow-xs"
          >
            <svg
              className="h-4 w-4 shrink-0 text-burgundy"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{activeError}</span>
          </div>
        )}

        {/* Form Container */}
        <form
          action={formAction}
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 space-y-5"
        >
          {/* Email Pill Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block pr-2 text-xs font-semibold text-foreground"
            >
              ایمیل کاربری
            </label>
            <div className="group relative flex h-[52px] w-full items-center rounded-full border border-border bg-raised px-5 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <svg
                className="h-5 w-5 shrink-0 text-muted transition-colors group-focus-within:text-mint"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                dir="ltr"
                placeholder="admin@onsupp.ir"
                onChange={() => {
                  if (clientError) setClientError(null);
                }}
                className="h-full w-full bg-transparent px-3 text-left text-sm text-foreground placeholder-muted/60 outline-none"
              />
            </div>
          </div>

          {/* Password Pill Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block pr-2 text-xs font-semibold text-foreground"
            >
              کلمه عبور
            </label>
            <div className="group relative flex h-[52px] w-full items-center rounded-full border border-border bg-raised px-5 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <svg
                className="h-5 w-5 shrink-0 text-muted transition-colors group-focus-within:text-mint"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                dir="ltr"
                placeholder="••••••••"
                onChange={() => {
                  if (clientError) setClientError(null);
                }}
                className="h-full w-full bg-transparent px-3 text-left text-sm text-foreground placeholder-muted/60 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 p-1 text-muted transition-colors hover:text-mint focus:outline-none focus:ring-1 focus:ring-primary/50 rounded-full cursor-pointer"
                aria-label={showPassword ? "مخفی کردن کلمه عبور" : "نمایش کلمه عبور"}
                tabIndex={0}
              >
                {showPassword ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Primary Brand Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="admin-login-submit-btn"
              disabled={isPending}
              aria-disabled={isPending}
              aria-label="ورود به پنل"
              className="group relative flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-lime text-ink font-bold shadow-lg border border-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:text-white active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  <span>در حال بررسی اطلاعات...</span>
                </>
              ) : (
                <>
                  <span>ورود به پنل</span>
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Card Footer: Back to main site link & security note */}
        <div className="mt-8 border-t border-border pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-mint transition-colors hover:text-foreground"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <span>بازگشت به وب‌سایت اصلی OnSupp</span>
          </Link>
          <p className="mt-3 text-[11px] text-muted">
            سامانه امنیتی احراز هویت متمرکز OnSupp • نسخه ۲.۰
          </p>
        </div>
      </div>
    </main>
  );
}
