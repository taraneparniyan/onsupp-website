import type { Metadata } from "next";
import { Suspense } from "react";
import ServicesPageView from "@/components/services/ServicesPageView";
import { DETAILED_SERVICES_DATA, type ServiceDetailItem } from "@/components/services/services-data";
import { getPageSeo } from "@/lib/seo";
import { BACKEND_URL } from "@/config/api";

export async function generateMetadata(): Promise<Metadata> {
  return getPageSeo("/services", {
    title: "خدمات تخصصی و دپارتمان‌های آن‌ساپ | OnSupp Core Services",
    description:
      "معماری جامع خدمات دیجیتال آن‌ساپ: مدیریت و هویت‌سازی فضای مجازی، استودیو و تصویربرداری، انیمیشن و موشن‌گرافیک، طراحی سایت و وب‌اپلیکیشن، سئو تکنیکال، اتوماسیون فروش و برنامه‌نویسی سامانه‌های اختصاصی.",
  });
}

function mergeServicesFromDb(dbList: any[]): ServiceDetailItem[] {
  return dbList.map((item: any, idx: number) => {
    const slug = item.slug || String(item.id);
    const match = DETAILED_SERVICES_DATA.find((s) => s.id === slug || s.titleFa === item.title);

    if (match) {
      return {
        ...match,
        titleFa: item.title || match.titleFa,
        titleEn: item.titleEn || match.titleEn,
        tagFa: item.tagFa || match.tagFa,
        tagEn: item.tagEn || match.tagEn,
        headlineFa: item.headlineFa || match.headlineFa,
        headlineEn: item.headlineEn || match.headlineEn,
        descriptionFa: item.description || match.descriptionFa,
        descriptionEn: item.descriptionEn || match.descriptionEn,
        detailedNarrativeFa: item.detailedNarrativeFa || match.detailedNarrativeFa,
        detailedNarrativeEn: item.detailedNarrativeEn || match.detailedNarrativeEn,
        businessValueFa: item.businessValueFa || match.businessValueFa,
        businessValueEn: item.businessValueEn || match.businessValueEn,
        image: item.imageUrl || match.image,
        subservices: Array.isArray(item.subservices) && item.subservices.length > 0 ? item.subservices : match.subservices,
        metrics: Array.isArray(item.metrics) && item.metrics.length > 0 ? item.metrics : match.metrics,
        relatedLinks: Array.isArray(item.relatedPathways) && item.relatedPathways.length > 0 ? item.relatedPathways : match.relatedLinks,
      };
    }

    return {
      id: slug as any,
      index: idx + 1,
      numStrFa: String(idx + 1).padStart(2, "0"),
      numStrEn: String(idx + 1).padStart(2, "0"),
      iconType: item.iconType || "web",
      tagFa: item.tagFa || "خدمات",
      tagEn: item.tagEn || "Services",
      titleFa: item.title || "",
      titleEn: item.titleEn || "",
      headlineFa: item.headlineFa || item.title || "",
      headlineEn: item.headlineEn || item.titleEn || "",
      descriptionFa: item.description || "",
      descriptionEn: item.descriptionEn || "",
      detailedNarrativeFa: item.detailedNarrativeFa || item.description || "",
      detailedNarrativeEn: item.detailedNarrativeEn || item.descriptionEn || "",
      businessValueTitleFa: "ارزش استراتژیک برای کسب‌وکار شما",
      businessValueTitleEn: "Strategic Business Value",
      businessValueFa: item.businessValueFa || "",
      businessValueEn: item.businessValueEn || "",
      image: item.imageUrl || "/images/services/web-development.webp",
      subservices: Array.isArray(item.subservices) ? item.subservices : [],
      metrics: Array.isArray(item.metrics) ? item.metrics : [],
      relatedLinks: Array.isArray(item.relatedPathways) ? item.relatedPathways : [],
      ctaLabelFa: "درخواست مشاوره اختصاصی",
      ctaLabelEn: "Request Consultation",
    };
  });
}

async function getServices(): Promise<ServiceDetailItem[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/services`, {
      next: { tags: ["services"] },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return mergeServicesFromDb(data);
      }
    }
  } catch {
    // Non-blocking fallback to canonical data
  }
  return DETAILED_SERVICES_DATA;
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-8 h-8 border-2 border-mint border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ServicesPageView initialServices={services} />
    </Suspense>
  );
}
