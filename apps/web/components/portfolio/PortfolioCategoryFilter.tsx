"use client";

import React from "react";
import { CaseStudyItem } from "@/lib/case-studies";

export type PortfolioCategoryKey =
  | "all"
  | "web-design"
  | "instagram"
  | "coding"
  | "video"
  | "animation"
  | "seo";

export interface CategoryTab {
  id: PortfolioCategoryKey;
  labelFa: string;
  labelEn: string;
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
      return (
        project.projectType === "instagram" ||
        text.includes("اینستاگرام") ||
        text.includes("instagram") ||
        text.includes("هویت") ||
        text.includes("برندینگ") ||
        text.includes("شبکه‌های اجتماعی")
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
      return (
        project.projectType === "seo" ||
        text.includes("سئو") ||
        text.includes("seo") ||
        text.includes("ارگانیک") ||
        text.includes("رتبه‌بندی")
      );
    default:
      return true;
  }
}

export default function PortfolioCategoryFilter({
  isRtl,
  activeCategory,
  selectedCategory,
  onSelectCategory,
  allProjects = [],
  counts,
}: {
  isRtl: boolean;
  activeCategory?: PortfolioCategoryKey;
  selectedCategory?: PortfolioCategoryKey;
  onSelectCategory: (id: PortfolioCategoryKey) => void;
  allProjects?: CaseStudyItem[];
  counts?: Record<PortfolioCategoryKey, number>;
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
    <div className="w-full select-none border-b border-[#1F1F1E]/12 dark:border-white/10 pb-1">
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
        {PORTFOLIO_CATEGORY_TABS.map((cat) => {
          const isSelected = currentCategory === cat.id;
          const count = getCount(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`group/tab relative inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-none transition-all duration-200 border cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-[#38534A] text-white dark:bg-[#8AB3A0] dark:text-[#121413] border-[#38534A] dark:border-[#8AB3A0] shadow-sm font-bold"
                  : "bg-[#EAEBE7]/80 dark:bg-[#1A1D1C]/80 border-[#1F1F1E]/10 dark:border-white/10 text-foreground/75 hover:bg-[#E2E5E1] dark:hover:bg-[#222624] hover:text-foreground hover:border-[#1F1F1E]/25 dark:hover:border-white/20"
              }`}
            >
              <span>{isRtl ? cat.labelFa : cat.labelEn}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-none ${
                  isSelected
                    ? "bg-white/20 dark:bg-black/20 text-white dark:text-[#121413]"
                    : "bg-black/[0.06] dark:bg-white/[0.08] text-foreground/60"
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
