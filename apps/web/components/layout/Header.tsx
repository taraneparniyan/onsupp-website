"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavLinks from "@/components/layout/NavLinks";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { scrollToSection, scrollToTop, setScrollLocked } from "@/lib/scroll";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const isRtl = lang === "fa";
  const isHome = pathname === "/" || pathname === "";
  const isOverHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body & Lenis scroll when mobile menu is open
  useEffect(() => {
    setScrollLocked(isMobileMenuOpen);
    return () => {
      setScrollLocked(false);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Global fallback for any internal `#hash` or `/#hash` anchor link on the current page
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || !href.includes("#")) return;

      const hashIdx = href.indexOf("#");
      const pathPart = href.slice(0, hashIdx);
      const isCurrentHome = pathname === "/" || pathname === "";
      const isSamePage =
        pathPart === "" ||
        pathPart === pathname ||
        (pathPart === "/" && isCurrentHome);

      if (isSamePage) {
        const hashId = href.slice(hashIdx + 1);
        if (hashId && scrollToSection(hashId)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [pathname]);

  const closeMobileMenu = () => {
    setScrollLocked(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-colors duration-300 ${
          isOverHero
            ? "bg-transparent"
            : "bg-background"
        }`}
      >
        <div
          className={`relative mx-auto w-full max-w-[1600px] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12 ${
            isRtl ? "flex-row-reverse lg:flex-row" : "flex-row"
          }`}
        >
          {/* Leading Side: Brand Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              onClick={(e) => {
                closeMobileMenu();
                if (isHome && (window.scrollY > 0 || window.location.hash)) {
                  e.preventDefault();
                  scrollToTop({ clearHash: true });
                }
              }}
              className="flex items-center transition-opacity hover:opacity-90 focus:outline-none"
              aria-label="OnSupp Homepage"
            >
              {/* Over dark hero: always display light/white logo. Scrolled: dark mode displays light logo */}
              <Image
                src="/images/logo/Linear-logo-light.webp"
                alt="OnSupp"
                width={124}
                height={40}
                priority
                className={`${isOverHero ? "block" : "hidden dark:block"} h-8 sm:h-9 w-auto object-contain`}
              />
              {/* Light mode past hero: display dark charcoal logo */}
              <Image
                src="/images/logo/Linear-Logo-dark.webp"
                alt="OnSupp"
                width={124}
                height={40}
                priority
                className={`${isOverHero ? "hidden" : "block dark:hidden"} h-8 sm:h-9 w-auto object-contain`}
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <NavLinks isOverHero={isOverHero} />
          </div>

          {/* Trailing Side: Controls & CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Discreet Admin Portal Link (Height 36px) */}
            <Link
              href="/admin"
              title={isRtl ? "ورود همکاران (پنل مدیریت)" : "Admin Portal"}
              aria-label={isRtl ? "ورود همکاران به پنل مدیریت" : "Admin Portal"}
              className={`hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-control border transition-all duration-300 active:scale-95 ${
                isOverHero
                  ? "border-white/15 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:border-white/25"
                  : "border-foreground/10 bg-raised/80 text-foreground/70 hover:border-mint/35 hover:bg-panel hover:text-mint"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </Link>

            {/* Desktop Light / Dark Theme Toggle Button (Height 36px) */}
            <button
              type="button"
              data-testid="theme-toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? isRtl
                    ? "تغییر به حالت روشن"
                    : "Switch to light theme"
                  : isRtl
                  ? "تغییر به حالت تاریک"
                  : "Switch to dark theme"
              }
              title={
                theme === "dark"
                  ? isRtl
                    ? "حالت روشن"
                    : "Light mode"
                  : isRtl
                  ? "حالت تاریک"
                  : "Dark mode"
              }
              className={`hidden lg:flex h-9 w-9 shrink-0 items-center justify-center rounded-control border transition-all duration-300 active:scale-95 cursor-pointer ${
                isOverHero
                  ? "border-white/15 bg-white/10 text-white/85 hover:bg-white/20 hover:text-white hover:border-white/25"
                  : "border-foreground/10 bg-raised/80 text-foreground/75 hover:border-mint/35 hover:bg-panel hover:text-mint"
              }`}
            >
              {theme === "dark" ? (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              )}
            </button>

            {/* Desktop Language Switcher Box (Height exactly 36px, matched) */}
            <div
              className={`hidden lg:flex h-9 items-center border rounded-control p-0.5 transition-colors box-border ${
                isOverHero
                  ? "border-white/15 bg-white/10 text-white"
                  : "border-foreground/10 bg-raised/80 text-foreground"
              }`}
            >
              <button
                type="button"
                onClick={() => lang !== "fa" && toggleLanguage()}
                className={`h-full w-8 text-xs font-semibold rounded-control-inner transition-all flex items-center justify-center cursor-pointer ${
                  lang === "fa"
                    ? isOverHero
                      ? "bg-white/25 text-white"
                      : "bg-panel shadow-sm text-foreground"
                    : isOverHero
                    ? "bg-transparent text-white/70 hover:text-white"
                    : "bg-transparent text-foreground/70 hover:text-foreground"
                }`}
                aria-label="تغییر زبان به فارسی"
              >
                FA
              </button>
              <button
                type="button"
                onClick={() => lang !== "en" && toggleLanguage()}
                className={`h-full w-8 text-xs font-semibold rounded-control-inner transition-all flex items-center justify-center cursor-pointer ${
                  lang === "en"
                    ? isOverHero
                      ? "bg-white/25 text-white"
                      : "bg-panel shadow-sm text-foreground"
                    : isOverHero
                    ? "bg-transparent text-white/70 hover:text-white"
                    : "bg-transparent text-foreground/70 hover:text-foreground"
                }`}
                aria-label="Switch language to English"
              >
                EN
              </button>
            </div>

            {/* Desktop Primary Call To Action (CTA) Button (Height exactly 36px, matched) */}
            <Link
              href="/#contact"
              onClick={(e) => {
                if (isHome && scrollToSection("contact")) {
                  e.preventDefault();
                }
              }}
              className={`hidden lg:inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-control text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-[0.98] shrink-0 border border-transparent box-border ${
                isOverHero
                  ? "bg-white text-[#1f1f1e] hover:bg-white/90 shadow-sm"
                  : "bg-foreground text-background hover:opacity-90 shadow-sm"
              }`}
            >
              <span>{isRtl ? "شروع پروژه" : "Start Project"}</span>
              <svg
                className={`w-3.5 h-3.5 ${isRtl ? "-rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? (isRtl ? "بستن منو" : "Close menu") : (isRtl ? "باز کردن منو" : "Open menu")}
              aria-expanded={isMobileMenuOpen}
              className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-control bg-transparent transition-all active:scale-95 ${
                isOverHero ? "text-white hover:text-white/80" : "text-foreground hover:text-mint"
              }`}
            >
              <svg
                className="h-6 w-6 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-0 top-[64px] z-40 bg-black/60 overflow-y-auto p-4 sm:p-6"
            onClick={closeMobileMenu}
          >
            <motion.div
              key="mobile-nav-box"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-md p-5 flex flex-col bg-panel rounded-panel border border-foreground/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Drawer Top Bar: Language & Theme Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-foreground/10">
                <div className="flex h-9 items-center border border-foreground/10 rounded-control p-0.5 bg-raised/80">
                  <button
                    type="button"
                    onClick={() => lang !== "fa" && toggleLanguage()}
                    className={`h-full w-8 text-xs font-bold rounded-control-inner transition-colors flex items-center justify-center ${
                      lang === "fa" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
                    }`}
                    aria-label="تغییر زبان به فارسی"
                  >
                    FA
                  </button>
                  <button
                    type="button"
                    onClick={() => lang !== "en" && toggleLanguage()}
                    className={`h-full w-8 text-xs font-bold rounded-control-inner transition-colors flex items-center justify-center ${
                      lang === "en" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
                    }`}
                    aria-label="Switch language to English"
                  >
                    EN
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="theme-toggle-mobile"
                  onClick={toggleTheme}
                  aria-label={
                    theme === "dark"
                      ? isRtl
                        ? "تغییر به حالت روشن"
                        : "Switch to light theme"
                      : isRtl
                      ? "تغییر به حالت تاریک"
                      : "Switch to dark theme"
                  }
                  title={
                    theme === "dark"
                      ? isRtl
                        ? "حالت روشن"
                        : "Light mode"
                      : isRtl
                      ? "حالت تاریک"
                      : "Dark mode"
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-control border border-foreground/10 bg-raised/80 text-foreground/75 transition-all duration-300 hover:border-mint/35 hover:bg-panel hover:text-mint active:scale-95 cursor-pointer shadow-sm"
                >
                  {theme === "dark" ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                </button>
              </div>

              <NavLinks
                className="flex flex-col space-y-1"
                linkClassName={(isActive) =>
                  `flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold transition-all no-underline ${
                    isActive
                      ? "bg-mint/15 text-mint"
                      : "text-foreground/80 hover:bg-raised"
                  }`
                }
                onLinkClick={closeMobileMenu}
              />

              <div className="mt-5 pt-4 border-t border-foreground/10 space-y-3">
                <Link
                  href="/#contact"
                  onClick={(e) => {
                    closeMobileMenu();
                    if (isHome && scrollToSection("contact")) {
                      e.preventDefault();
                    }
                  }}
                  className="flex w-full h-11 items-center justify-center gap-2 rounded-card-sm bg-foreground text-background font-semibold hover:opacity-90 active:scale-[0.98] transition-all text-xs sm:text-sm shadow-sm"
                >
                  <span>{isRtl ? "شروع پروژه" : "Start Project"}</span>
                  <svg
                    className={`w-3.5 h-3.5 ${isRtl ? "-rotate-90" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </Link>

                <div className="text-center pt-1">
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="inline-flex items-center gap-1.5 text-xs text-foreground/50 hover:text-mint transition-colors py-1.5 px-3 rounded-lg hover:bg-raised"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{isRtl ? "ورود همکاران (پنل مدیریت)" : "Staff / Admin Portal"}</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
