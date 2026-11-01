"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { login, State } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<State, FormData>(
    login,
    undefined,
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-8 font-sans selection:bg-[#3f6b59]/30 selection:text-white"
      dir="rtl"
    >
      {/* Ambient background glow matching OnSupp design system */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40 blur-3xl"
        aria-hidden="true"
      >
        <div className="h-[450px] w-[450px] rounded-full bg-gradient-to-tr from-[#3f6b59]/25 via-[#25473d]/20 to-transparent" />
      </div>

      {/* Neumorphic Login Card Frame */}
      <div className="relative z-10 w-full max-w-[420px] rounded-[32px] border border-white/[0.08] bg-[#191c1e] p-8 sm:p-10 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_0_rgba(255,255,255,0.12),inset_0_-1px_1px_0_rgba(0,0,0,0.5)]">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          {/* Neumorphic Leaf Icon Container */}
          <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#212629] to-[#15181a] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.6),inset_0_1px_1.5px_0_rgba(255,255,255,0.15)]">
            <svg
              className="h-8 w-8 text-mint drop-shadow-[0_2px_8px_rgba(194,202,173,0.3)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M5 21C5 12.163 12.163 5 21 5c0 8.837-7.163 16-16 16z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M5 21l9-9"
              />
            </svg>
          </div>

          {/* Typography Hierarchy */}
          <h1 className="text-2xl font-black tracking-wide text-white sm:text-3xl">
            ورود به پنل مدیریت
          </h1>
          <p className="mt-2 text-xs text-mint/70 sm:text-sm">
            برای مدیریت محتوای وب‌سایت OnSupp، وارد حساب شوید
          </p>
        </div>

        {/* Error Alert Message */}
        {state?.error && (
          <div
            role="alert"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 shadow-sm"
          >
            <svg
              className="h-4 w-4 shrink-0 text-rose-400"
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
            <span>{state.error}</span>
          </div>
        )}

        {/* Form Container */}
        <form action={formAction} className="mt-8 space-y-5">
          {/* Email Recessed Pill Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block pr-2 text-xs font-medium text-mint/90"
            >
              ایمیل کاربری
            </label>
            <div className="group relative flex h-[52px] w-full items-center rounded-full border border-white/[0.06] bg-[#121416] px-5 shadow-[inset_2px_3px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_3px_rgba(255,255,255,0.04),0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-200 focus-within:border-[#3f6b59] focus-within:ring-2 focus-within:ring-[#3f6b59]/25">
              <svg
                className="h-5 w-5 shrink-0 text-mint/40 transition-colors group-focus-within:text-mint"
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
                className="h-full w-full bg-transparent px-3 text-left text-sm text-white placeholder-mint/35 outline-none selection:bg-[#3f6b59]/40"
              />
            </div>
          </div>

          {/* Password Recessed Pill Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block pr-2 text-xs font-medium text-mint/90"
            >
              کلمه عبور
            </label>
            <div className="group relative flex h-[52px] w-full items-center rounded-full border border-white/[0.06] bg-[#121416] px-5 shadow-[inset_2px_3px_6px_rgba(0,0,0,0.65),inset_-1px_-1px_3px_rgba(255,255,255,0.04),0_1px_1px_rgba(255,255,255,0.05)] transition-all duration-200 focus-within:border-[#3f6b59] focus-within:ring-2 focus-within:ring-[#3f6b59]/25">
              <svg
                className="h-5 w-5 shrink-0 text-mint/40 transition-colors group-focus-within:text-mint"
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
                className="h-full w-full bg-transparent px-3 text-left text-sm text-white placeholder-mint/35 outline-none selection:bg-[#3f6b59]/40"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="shrink-0 p-1 text-mint/40 transition-colors hover:text-mint focus:outline-none focus:ring-1 focus:ring-mint/50 rounded-full"
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

          {/* Raised Convex Pill Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex h-[52px] w-full items-center justify-center gap-2 rounded-full border border-[#8ab3a0]/30 bg-gradient-to-r from-[#3f6b59] to-[#4e826d] font-bold text-white shadow-[0_12px_24px_-6px_rgba(63,107,89,0.5),0_4px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:from-[#477a66] hover:to-[#57947c] hover:shadow-[0_16px_28px_-6px_rgba(63,107,89,0.65),0_6px_10px_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
            >
              {isPending ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
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
        <div className="mt-8 border-t border-white/[0.06] pt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-mint/70 transition-colors hover:text-white"
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
          <p className="mt-3 text-[11px] text-mint/40">
            سامانه امنیتی احراز هویت متمرکز OnSupp • نسخه ۲.۰
          </p>
        </div>
      </div>
    </main>
  );
}
