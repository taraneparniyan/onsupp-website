"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scrollToSection, scrollToTop } from "@/lib/scroll";
import { SERVICES_MENU_ITEMS, type ServiceCategory } from "@/config/services";

const translations = {
  fa: [
    { name: "صفحه اصلی", href: "/" },
    { name: "خدمات", href: "/services", isServices: true },
    { name: "نمونه‌کارها", href: "/portfolio" },
    { name: "پلن‌ها و تعرفه‌ها", href: "/pricing" },
    { name: "مقالات", href: "/blog" },
    { name: "درباره ما", href: "/#about" },
  ],
  en: [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services", isServices: true },
    { name: "Portfolio", href: "/portfolio" },
    { name: "Pricing", href: "/pricing" },
    { name: "Articles", href: "/blog" },
    { name: "About Us", href: "/#about" },
  ],
};

type NavLinksProps = {
  className?: string;
  linkClassName?: (isActive: boolean, isHome: boolean) => string;
  onLinkClick?: () => void;
};

// ─── Service Category Icon ───────────────────────────────────────────────────

function ServiceCategoryIcon({ type }: { type: ServiceCategory["iconType"] }) {
  switch (type) {
    case "social":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      );
    case "studio":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    case "motion":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "web":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    case "seo":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <polyline points="11 8 13 10 11 14" />
        </svg>
      );
    case "crm":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "software":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" strokeWidth="1.5" />
        </svg>
      );
  }
}

export default function NavLinks({ className, linkClassName, onLinkClick }: NavLinksProps) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const links = translations[lang];
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");

  // Desktop Dropdown State
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const dropdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Accordion State
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);

  const toggleMobileCategory = (categoryId: string) => {
    setActiveMobileCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  const isMobileLayout = Boolean(linkClassName);

  const openDesktopDropdown = () => {
    if (isMobileLayout) return;
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setIsDesktopDropdownOpen(true);
  };

  const closeDesktopDropdown = () => {
    if (isMobileLayout) return;
    dropdownTimerRef.current = setTimeout(() => {
      setIsDesktopDropdownOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash);
    };
    handleHashChange();

    if ((pathname === "/" || pathname === "") && window.location.hash) {
      const hash = window.location.hash;
      const timer = window.setTimeout(() => {
        scrollToSection(hash, { updateHash: false });
      }, 60);
      window.addEventListener("hashchange", handleHashChange);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("hashchange", handleHashChange);
      };
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [pathname]);

  // Close dropdown on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDesktopDropdownOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLinkClick = (href: string, isHash: boolean, isHome: boolean, e?: React.MouseEvent) => {
    if (onLinkClick) onLinkClick();
    setIsDesktopDropdownOpen(false);
    setActiveMobileCategory(null);

    if (isHome && (pathname === "/" || pathname === "")) {
      if (window.scrollY > 0 || window.location.hash) {
        if (e) e.preventDefault();
        scrollToTop({ clearHash: true });
        setActiveHash("");
      }
      return;
    }

    if (isHash && (pathname === "/" || pathname === "")) {
      const targetId = href.substring(href.indexOf("#") + 1);
      if (scrollToSection(targetId)) {
        if (e) e.preventDefault();
        setActiveHash(`#${targetId}`);
      }
    }
  };

  return (
    <nav className={className || "flex items-center gap-6 xl:gap-8 relative"}>
      {links.map((link) => {
        const isHome = link.href === "/";
        const isHash = link.href.includes("#");
        let isActive = false;

        if (isHash) {
          const hashPart = link.href.substring(link.href.indexOf("#"));
          isActive = pathname === "/" && activeHash === hashPart;
        } else {
          isActive = isHome ? pathname === "/" && !activeHash : pathname.startsWith(link.href);
        }

        const defaultClass = "text-sm font-medium transition-all hover:text-foreground no-underline";
        const desktopActiveStyle = isActive
          ? "text-mint font-semibold"
          : "text-foreground/70";

        const resolvedClass = linkClassName
          ? linkClassName(isActive, isHome)
          : `${defaultClass} ${desktopActiveStyle}`;

        // ─── Services Menu Item ──────────────────────────────────────────────
        if (link.isServices) {
          // MOBILE ACCORDION VARIANT
          if (isMobileLayout) {
            return (
              <div key={link.href} className="w-full">
                <div
                  className={`${resolvedClass} cursor-pointer select-none`}
                  onClick={() => setIsMobileServicesOpen((prev) => !prev)}
                >
                  <span className="flex items-center gap-2">
                    <span>{link.name}</span>
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-lime/10 text-lime border border-lime/20">
                      {isRtl ? "۷ دسته تخصصی" : "7 Categories"}
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 text-foreground/60 transition-transform duration-200 ${
                      isMobileServicesOpen ? "rotate-180 text-mint" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Mobile Expanded Categories List */}
                <AnimatePresence>
                  {isMobileServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden pr-2 pl-2 mt-1 space-y-2.5 pb-2"
                    >
                      {SERVICES_MENU_ITEMS.map((service) => {
                        const isCategoryOpen = activeMobileCategory === service.id;
                        return (
                          <div
                            key={service.id}
                            className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                              isCategoryOpen
                                ? "bg-[#161a1d] border-lime/30 shadow-md"
                                : "bg-[#131719]/90 border-white/5 hover:border-white/10"
                            }`}
                          >
                            {/* Category Accordion Header */}
                            <button
                              type="button"
                              onClick={() => toggleMobileCategory(service.id)}
                              className="w-full flex items-center justify-between p-3 text-start focus:outline-none cursor-pointer select-none"
                              aria-expanded={isCategoryOpen}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg border shrink-0 transition-colors ${
                                    isCategoryOpen
                                      ? "bg-lime text-ink border-lime shadow-[0_0_8px_rgba(178,248,0,0.3)]"
                                      : "bg-lime/10 text-lime border-lime/20"
                                  }`}
                                >
                                  <ServiceCategoryIcon type={service.iconType} />
                                </span>
                                <span
                                  className={`text-xs font-bold transition-colors truncate ${
                                    isCategoryOpen ? "text-lime" : "text-white"
                                  }`}
                                >
                                  {isRtl ? service.titleFa : service.titleEn}
                                </span>
                              </div>

                              {/* Arrow icon showing open/closed state */}
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-md transition-transform duration-200 shrink-0 ${
                                  isCategoryOpen
                                    ? "rotate-180 text-lime bg-lime/10"
                                    : "text-foreground/50"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </span>
                            </button>

                            {/* Subservices Accordion Panel */}
                            <AnimatePresence initial={false}>
                              {isCategoryOpen && (
                                <motion.div
                                  key={`subservices-${service.id}`}
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 pt-1 border-t border-white/[0.06]">
                                    <ul
                                      className={`space-y-1 ${
                                        isRtl
                                          ? "border-r-2 border-lime/30 pr-3 mr-3"
                                          : "border-l-2 border-lime/30 pl-3 ml-3"
                                      } mt-1.5`}
                                    >
                                      {(isRtl
                                        ? service.subservicesFa
                                        : service.subservicesEn
                                      ).map((sub, i) => (
                                        <li key={i}>
                                          <Link
                                            href={service.href}
                                            onClick={(e) =>
                                              handleLinkClick(
                                                service.href,
                                                service.href.includes("#"),
                                                false,
                                                e
                                              )
                                            }
                                            className="flex items-center gap-2 text-[11.5px] font-medium text-foreground/75 hover:text-white active:text-lime transition-colors py-1.5"
                                          >
                                            <span className="w-1.5 h-1.5 rounded-full bg-lime/60 shrink-0" />
                                            <span>{sub}</span>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}

                      <Link
                        href="/services"
                        onClick={(e) => handleLinkClick("/services", false, false, e)}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-bold text-mint hover:bg-white/[0.08] transition-all text-center mt-2"
                      >
                        <span>{isRtl ? "مشاهده ساختار کامل در صفحه خدمات" : "View Full Services Page"}</span>
                        <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          // DESKTOP DROPDOWN VARIANT
          return (
            <div
              key={link.href}
              className="relative"
              onMouseEnter={openDesktopDropdown}
              onMouseLeave={closeDesktopDropdown}
            >
              <Link
                href={link.href}
                onClick={(e) => handleLinkClick(link.href, isHash, isHome, e)}
                className={`inline-flex items-center gap-1.5 ${resolvedClass} ${
                  isDesktopDropdownOpen ? "text-mint font-semibold" : ""
                }`}
                aria-expanded={isDesktopDropdownOpen}
                aria-haspopup="true"
              >
                <span>{link.name}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isDesktopDropdownOpen ? "rotate-180 text-mint" : "opacity-60"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Desktop Mega-Menu Dropdown Panel */}
              <AnimatePresence>
                {isDesktopDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50 w-[780px] xl:w-[840px] pointer-events-auto"
                    dir={isRtl ? "rtl" : "ltr"}
                  >
                    <div className="relative rounded-2xl bg-[#0e1113]/98 backdrop-blur-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-5 overflow-hidden">
                      {/* Top Accent Beam Line */}
                      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-lime/50 to-transparent" />

                      {/* Header Title Bar */}
                      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-lime animate-pulse shadow-[0_0_8px_#b2f800]" />
                          <span className="text-xs font-bold text-white tracking-wide">
                            {isRtl ? "ساختار خدمات تخصصی OnSupp" : "OnSupp Core Services & Solutions"}
                          </span>
                        </div>
                        <span className="text-[11px] text-white/40 font-mono">
                          {isRtl ? "۷ دپارتمان تخصصی" : "7 Specialized Departments"}
                        </span>
                      </div>

                      {/* ─── Categories & Sub-Services Grid ─── */}
                      <div className="grid grid-cols-3 gap-3.5">
                        {SERVICES_MENU_ITEMS.map((service, index) => {
                          const isFeatured = index < 3; // First 3 are the newly structured creative & media services
                          return (
                            <div
                              key={service.id}
                              className={`rounded-xl p-3 transition-all duration-200 group border ${
                                isFeatured
                                  ? "bg-white/[0.03] border-white/10 hover:border-lime/40 hover:bg-white/[0.05]"
                                  : "bg-white/[0.015] border-white/5 hover:border-mint/30 hover:bg-white/[0.04]"
                              }`}
                            >
                              {/* Category Header Link */}
                              <Link
                                href={service.href}
                                onClick={(e) => handleLinkClick(service.href, service.href.includes("#"), false, e)}
                                className="flex items-center gap-2 text-xs font-bold text-white group-hover:text-lime transition-colors mb-2"
                              >
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-lg border shrink-0 transition-colors ${
                                    isFeatured
                                      ? "bg-lime/10 border-lime/30 text-lime group-hover:bg-lime group-hover:text-ink shadow-[0_0_8px_rgba(178,248,0,0.15)]"
                                      : "bg-white/[0.04] border-white/10 text-white/80 group-hover:border-mint/40 group-hover:text-mint"
                                  }`}
                                >
                                  <ServiceCategoryIcon type={service.iconType} />
                                </span>
                                <span className="truncate">{isRtl ? service.titleFa : service.titleEn}</span>
                              </Link>

                              {/* Subservices List */}
                              <ul className="space-y-1 pr-1.5 pl-1.5 text-[11px] leading-[18px]">
                                {(isRtl ? service.subservicesFa : service.subservicesEn).map((sub, i) => (
                                  <li key={i}>
                                    <Link
                                      href={service.href}
                                      onClick={(e) => handleLinkClick(service.href, service.href.includes("#"), false, e)}
                                      className="text-white/60 hover:text-white transition-colors flex items-center gap-1.5 group/item"
                                    >
                                      <span className="w-1 h-1 rounded-full bg-white/30 group-hover/item:bg-lime shrink-0 transition-colors" />
                                      <span className="truncate">{sub}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Quick Action Bar */}
                      <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-xs">
                        <Link
                          href="/services"
                          onClick={(e) => handleLinkClick("/services", false, false, e)}
                          className="inline-flex items-center gap-1.5 text-mint hover:text-white font-semibold transition-colors"
                        >
                          <span>{isRtl ? "مشاهده صفحه جامع ساختار خدمات" : "Explore full services page"}</span>
                          <svg className={`w-3.5 h-3.5 ${isRtl ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </Link>

                        <Link
                          href="/#contact"
                          onClick={(e) => handleLinkClick("/#contact", true, false, e)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime text-ink font-bold hover:shadow-[0_0_12px_rgba(178,248,0,0.3)] transition-all"
                        >
                          <span>{isRtl ? "درخواست مشاوره اختصاصی" : "Request Consultation"}</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }

        // Standard Nav Link
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => handleLinkClick(link.href, isHash, isHome, e)}
            className={resolvedClass}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
}
