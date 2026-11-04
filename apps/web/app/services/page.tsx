import type { Metadata } from "next";
import { Suspense } from "react";
import ServicesPageView from "@/components/services/ServicesPageView";

export const metadata: Metadata = {
  title: "خدمات تخصصی و دپارتمان‌های آن‌ساپ | OnSupp Core Services",
  description:
    "معماری جامع خدمات دیجیتال آن‌ساپ: مدیریت و هویت‌سازی فضای مجازی، استودیو و تصویربرداری، انیمیشن و موشن‌گرافیک، طراحی سایت و وب‌اپلیکیشن، سئو تکنیکال، اتوماسیون فروش و برنامه‌نویسی سامانه‌های اختصاصی.",
  keywords: [
    "خدمات دیجیتال مارکتینگ",
    "طراحی سایت اختصاصی",
    "سئو تکنیکال",
    "هویت بصری برند",
    "تولید تیزر و استودیو",
    "موشن گرافیک",
    "استقرار CRM",
    "برنامه‌نویسی اختصاصی",
    "آن‌ساپ",
    "OnSupp Services",
  ],
  openGraph: {
    title: "خدمات تخصصی آن‌ساپ | OnSupp Core Services",
    description:
      "۷ دپارتمان تخصصی برای طراحی، فناوری و استراتژی برندهای پیشرو.",
    type: "website",
    url: "/services",
  },
};

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServicesPageView />
    </Suspense>
  );
}
