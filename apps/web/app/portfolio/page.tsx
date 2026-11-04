import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchCaseStudies } from "@/lib/case-studies";
import PortfolioPageView from "@/components/portfolio/PortfolioPageView";
import { getPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeo("/portfolio", {
    title: "نمونه‌کارها و پروژه‌های شاخص | OnSupp Portfolio",
    description:
      "ویترین پروژه‌های منتخب، طراحی وب‌سایت‌های سازمانی، هویت بصری برند، مهندسی نرم‌افزار مقیاس‌پذیر و تولیدات سینمایی استودیو آن‌ساپ برای کسب‌وکارهای پیشرو.",
  });
}

export default async function PortfolioPage() {
  const allProjects = await fetchCaseStudies();

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
