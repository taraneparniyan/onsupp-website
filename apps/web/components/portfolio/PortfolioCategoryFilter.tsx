"use client";

import React from "react";
import { CaseStudyItem } from "@/lib/case-studies";

export type PortfolioCategoryKey = string;

export interface CategoryTab {
  id: PortfolioCategoryKey;
  labelFa: string;
  labelEn: string;
  color?: string;
  icon?: string;
}

export const PORTFOLIO_CATEGORY_TABS: CategoryTab[] = [
  { id: "all", labelFa: "همه پروژه‌ها", labelEn: "All Projects" },
  { id: "web-design", labelFa: "طراحی سایت و وب‌اپلیکیشن", labelEn: "Web & Apps" },
  { id: "instagram", labelFa: "هویت بصری و اینستاگرام", labelEn: "Brand & Social" },
  { id: "coding", labelFa: "برنامه‌نویسی و سامانه‌ها", labelEn: "Custom Software" },
  { id: "video", labelFa: "استودیو و تیزر صنعتی", labelEn: "Studio & Cinema" },
  { id: "animation", labelFa: "انیمیشن و موشن گرافیک", labelEn: "Animation & Motion" },
  { id: "seo", labelFa: "سئو و رشد ارگانیک", labelEn: "SEO & Growth" },
];

export function matchesCategory(
  project: CaseStudyItem,
  catId: PortfolioCategoryKey
): boolean {
  if (catId === "all") return true;

  // 1. Direct ID or Slug match from Dynamic Portfolio Category
  if (project.category?.slug && project.category.slug === catId) return true;
  if (project.categoryId !== undefined && project.categoryId !== null && String(project.categoryId) === String(catId)) return true;

  // Dynamic cross-matching with canonical seed categories
  if (catId === "web-design" && (project.category?.slug === "website-design" || project.category?.slug === "web-design")) return true;
  if (catId === "website-design" && (project.category?.slug === "web-design" || project.category?.slug === "website-design")) return true;
  if (catId === "instagram" && (project.category?.slug === "instagram-management" || project.category?.slug === "branding")) return true;
  if (catId === "instagram-management" && (project.category?.slug === "instagram" || project.category?.slug === "instagram-management")) return true;
  if (catId === "seo" && (project.category?.slug === "seo-growth" || project.category?.slug === "seo")) return true;
  if (catId === "seo-growth" && (project.category?.slug === "seo" || project.category?.slug === "seo-growth")) return true;
  if (catId === "branding" && (project.category?.slug === "branding" || project.category?.slug === "instagram-management")) return true;

  const text = [
    project.categoryFa,
    project.categoryEn,
    project.titleFa,
    project.titleEn,
    project.taglineFa,
    project.taglineEn,
    project.client,
    project.clientEn,
    ...(project.servicesFa || []),
    ...(project.servicesEn || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  switch (catId) {
    case "web-design":
    case "website-design":
      return (
        project.projectType === "website" ||
        project.previewType === "web" ||
        text.includes("وب") ||
        text.includes("web") ||
        text.includes("سایت") ||
        text.includes("نکست") ||
        text.includes("next.js")
      );
    case "instagram":
    case "instagram-management":
      return (
        project.projectType === "instagram" ||
        text.includes("اینستاگرام") ||
        text.includes("instagram") ||
        text.includes("هویت") ||
        text.includes("برندینگ") ||
        text.includes("شبکه‌های اجتماعی")
      );
    case "branding":
      return (
        text.includes("برندینگ") ||
        text.includes("هویت بصری") ||
        text.includes("لوگو") ||
        text.includes("branding")
      );
    case "coding":
      return (
        project.projectType === "app" ||
        project.previewType === "platform" ||
        text.includes("برنامه‌نویسی") ||
        text.includes("سامانه") ||
        text.includes("نرم‌افزار") ||
        text.includes("software") ||
        text.includes("کلود") ||
        text.includes("تله‌متری")
      );
    case "video":
      return (
        project.projectType === "video" ||
        text.includes("تصویربرداری") ||
        text.includes("استودیو") ||
        text.includes("تیزر") ||
        text.includes("ویدیو") ||
        text.includes("فیلم‌برداری") ||
        text.includes("video") ||
        text.includes("studio")
      );
    case "animation":
      return (
        project.projectType === "animation" ||
        text.includes("انیمیشن") ||
        text.includes("موشن") ||
        text.includes("animation") ||
        text.includes("motion")
      );
    case "seo":
    case "seo-growth":
      return (
        project.projectType === "seo" ||
        text.includes("سئو") ||
        text.includes("seo") ||
        text.includes("ارگانیک") ||
        text.includes("رتبه‌بندی")
      );
    default:
      return text.includes(catId.toLowerCase());
  }
}

export default function PortfolioCategoryFilter({
  isRtl,
  activeCategory,
  selectedCategory,
  onSelectCategory,
  allProjects = [],
  counts,
  tabs = PORTFOLIO_CATEGORY_TABS,
}: {
  isRtl: boolean;
  activeCategory?: PortfolioCategoryKey;
  selectedCategory?: PortfolioCategoryKey;
  onSelectCategory: (id: PortfolioCategoryKey) => void;
  allProjects?: CaseStudyItem[];
  counts?: Record<PortfolioCategoryKey, number>;
  tabs?: CategoryTab[];
}) {
  const currentCategory = activeCategory || selectedCategory || "all";

  const getCount = (catId: PortfolioCategoryKey) => {
    if (counts && counts[catId] !== undefined) return counts[catId];
    if (Array.isArray(allProjects) && allProjects.length > 0) {
      if (catId === "all") return allProjects.length;
      return allProjects.filter((p) => matchesCategory(p, catId)).length;
    }
    return 0;
  };

  const toFaDigits = (num: number) =>
    String(num).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]);

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 select-none">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
        {tabs.map((cat) => {
          const isSelected = currentCategory === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? "bg-[#38534A] dark:bg-[#8AB3A0] text-white dark:text-[#17221E] border-[#38534A] dark:border-[#8AB3A0] shadow-md shadow-[#38534A]/20"
                  : "bg-white/70 dark:bg-white/[0.05] border-black/[0.08] dark:border-white/10 text-foreground/75 hover:border-[#38534A]/40 dark:hover:border-[#8AB3A0]/40 hover:text-foreground hover:bg-white dark:hover:bg-white/[0.08]"
              }`}
            >
              <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected
                    ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#17221E]"
                    : "bg-black/[0.05] dark:bg-white/[0.08] text-foreground/60"
                }`}
              >
                {isRtl ? toFaDigits(count) : count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
