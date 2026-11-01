"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import NavLinks from "@/components/layout/NavLinks";
import { useLanguage } from "@/context/LanguageContext";
import { scrollToSection, scrollToTop, setScrollLocked } from "@/lib/scroll";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { lang, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const isRtl = lang === "fa";

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
      const isSamePage =
        pathPart === "" ||
        pathPart === pathname ||
        (pathPart === "/" && (pathname === "/" || pathname === ""));

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
      className={`fixed top-0 z-40 w-full transition-all duration-500 ${
        scrolled
          ? "bg-panel border-b border-foreground/10 shadow-md"
          : "bg-panel/40 backdrop-blur-xl backdrop-saturate-[180%] border-b border-transparent"
      }`}
    >
      <div className={`mx-auto w-full max-w-[1600px] flex h-16 items-center justify-between px-4 sm:px-6 lg:px-[24px] ${isRtl ? "flex-row-reverse lg:flex-row" : "flex-row"}`}>
        
        {/* Leading Side (Right in RTL desktop, Left in RTL mobile): Brand Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={(e) => {
              closeMobileMenu();
              if ((pathname === "/" || pathname === "") && (window.scrollY > 0 || window.location.hash)) {
                e.preventDefault();
                scrollToTop({ clearHash: true });
              }
            }}
            className="flex items-center gap-2 text-2xl font-display font-bold text-foreground tracking-wide hover:opacity-90 transition-opacity"
          >
            {/* Mobile Brand Mark (Leaf Icon matching reference) */}
            <svg
              className="w-5 h-5 text-mint shrink-0 lg:hidden"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
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
            <span>Onsupp</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Hidden on mobile per reference) */}
        <div className="hidden lg:flex items-center justify-center flex-1 text-foreground">
          <NavLinks />
        </div>

        {/* Trailing Side (Left in RTL, Right in LTR) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Discreet Admin Portal Link (For authorized team members) */}
          <Link
            href="/admin"
            title={isRtl ? "ورود همکاران (پنل مدیریت)" : "Admin Portal"}
            aria-label={isRtl ? "ورود همکاران به پنل مدیریت" : "Admin Portal"}
            className="hidden lg:flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-raised/80 text-foreground/70 transition-all duration-300 hover:border-mint/35 hover:bg-panel hover:text-mint active:scale-95"
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

          {/* Desktop Light / Dark Theme Toggle Button */}
          <button
            type="button"
            aria-label={isRtl ? "تغییر حالت روشن و تاریک" : "Toggle light and dark mode"}
            title={isRtl ? "تغییر حالت روشن / تاریک" : "Light / Dark mode"}
            className="hidden lg:flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-raised/80 text-foreground/75 transition-all duration-300 hover:border-mint/35 hover:bg-panel hover:text-mint active:scale-95 cursor-pointer"
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
          </button>

          {/* Desktop Language Switcher Pill */}
          <div className="hidden lg:flex items-center gap-1 sm:gap-1.5 border border-foreground/10 rounded-full p-1 bg-raised/80">
            <button
              type="button"
              onClick={() => lang !== "fa" && toggleLanguage()}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-full transition-colors min-h-[30px] min-w-[32px] flex items-center justify-center ${
                lang === "fa" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
              }`}
              aria-label="تغییر زبان به فارسی"
            >
              FA
            </button>
            <button
              type="button"
              onClick={() => lang !== "en" && toggleLanguage()}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-full transition-colors min-h-[30px] min-w-[32px] flex items-center justify-center ${
                lang === "en" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
              }`}
              aria-label="Switch language to English"
            >
              EN
            </button>
          </div>

          {/* Desktop Primary Call To Action (CTA) Button */}
          <Link
            href="/#contact"
            onClick={(e) => {
              if ((pathname === "/" || pathname === "") && scrollToSection("contact")) {
                e.preventDefault();
              }
            }}
            className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-lime text-ink text-xs sm:text-sm font-bold shadow-[0_0_16px_rgba(178,248,0,0.22)] hover:shadow-[0_0_22px_rgba(178,248,0,0.38)] transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>{isRtl ? "شروع پروژه" : "Start Project"}</span>
            <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Mobile Hamburger Toggle Button (Left in RTL, Right in LTR) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? (isRtl ? "بستن منو" : "Close menu") : (isRtl ? "باز کردن منو" : "Open menu")}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-transparent text-foreground transition-all hover:text-mint active:scale-95"
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
            className="lg:hidden fixed inset-0 top-[64px] z-40 bg-black/50 backdrop-blur-md overflow-y-auto p-4 sm:p-6"
            onClick={closeMobileMenu}
          >
            <motion.div
              key="mobile-nav-box"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-md p-5 flex flex-col bg-panel rounded-2xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              dir={isRtl ? "rtl" : "ltr"}
            >
              {/* Drawer Top Bar: Language & Theme Controls */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-foreground/10">
                <div className="flex items-center gap-1.5 border border-foreground/10 rounded-full p-1 bg-raised/80">
                  <button
                    type="button"
                    onClick={() => lang !== "fa" && toggleLanguage()}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors min-h-[30px] min-w-[34px] flex items-center justify-center ${
                      lang === "fa" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
                    }`}
                    aria-label="تغییر زبان به فارسی"
                  >
                    FA
                  </button>
                  <button
                    type="button"
                    onClick={() => lang !== "en" && toggleLanguage()}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors min-h-[30px] min-w-[34px] flex items-center justify-center ${
                      lang === "en" ? "bg-panel shadow-sm text-foreground" : "bg-transparent text-foreground/70 hover:text-foreground"
                    }`}
                    aria-label="Switch language to English"
                  >
                    EN
                  </button>
                </div>

                <button
                  type="button"
                  aria-label={isRtl ? "تغییر حالت روشن و تاریک" : "Toggle light and dark mode"}
                  title={isRtl ? "تغییر حالت روشن / تاریک" : "Light / Dark mode"}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-foreground/10 bg-raised/80 text-foreground/75 transition-all duration-300 hover:border-mint/35 hover:bg-panel hover:text-mint active:scale-95"
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

              <div className="mt-6 pt-6 border-t border-foreground/10 space-y-3">
                <Link
                  href="/#contact"
                  onClick={(e) => {
                    closeMobileMenu();
                    if ((pathname === "/" || pathname === "") && scrollToSection("contact")) {
                      e.preventDefault();
                    }
                  }}
                  className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-lime text-ink font-bold shadow-[0_0_16px_rgba(178,248,0,0.2)] active:scale-95 transition-all text-sm"
                >
                  <span>{isRtl ? "مشاوره و آغاز پروژه" : "Start a Project"}</span>
                  <svg className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
