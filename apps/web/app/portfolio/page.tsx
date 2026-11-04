import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllCaseStudies } from "@/lib/case-studies";
import PortfolioPageView from "@/components/portfolio/PortfolioPageView";

export const metadata: Metadata = {
  title: "نمونه‌کارها و پروژه‌های شاخص | OnSupp Portfolio",
  description:
    "ویترین پروژه‌های منتخب، طراحی وب‌سایت‌های سازمانی، هویت بصری برند، مهندسی نرم‌افزار مقیاس‌پذیر و تولیدات سینمایی استودیو آن‌ساپ برای کسب‌وکارهای پیشرو.",
  openGraph: {
    title: "نمونه‌کارها و پروژه‌های شاخص آن‌ساپ | OnSupp Portfolio Showcase",
    description:
      "روایت بصری پروژه‌ها، مهندسی ایده‌ها تا خلق تمایز پایدار با طراحی سیستم‌محور و کدنویسی بدون مصالحه.",
    url: "https://onsupp.ir/portfolio",
    siteName: "OnSupp Digital Agency",
    locale: "fa_IR",
    type: "website",
  },
  alternates: {
    canonical: "/portfolio",
  },
};

export default function PortfolioPage() {
  const allProjects = getAllCaseStudies();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#111416] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#38534A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <PortfolioPageView allProjects={allProjects} />
    </Suspense>
  );
}
