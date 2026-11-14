"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import ServicesHero from "./ServicesHero";
import ServicesOverviewGrid from "./ServicesOverviewGrid";
import ServicesWhyUsSection from "./ServicesWhyUsSection";
import ServicesDeepDive from "./ServicesDeepDive";
import ServicesCTASection from "./ServicesCTASection";
import { mergeServicesWithDatabase } from "./services-data";
import { scrollToSection } from "@/lib/scroll";
import type { ServiceData } from "@/lib/publicApi";

export default function ServicesPageView({
  initialServices,
}: {
  initialServices?: ServiceData[] | null;
}) {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  // Merge CMS records with presentation metadata; database content strictly takes precedence
  const { services } = React.useMemo(
    () => mergeServicesWithDatabase(initialServices),
    [initialServices]
  );

  const [consultationServiceId, setConsultationServiceId] = useState<string>("web-development");

  // Sync initial category parameter from URL
  useEffect(() => {
    if (categoryParam && services.some((s) => s.id === categoryParam)) {
      setConsultationServiceId(categoryParam);

      // Smooth scroll to the targeted section after initial mount
      const timer = setTimeout(() => {
        scrollToSection(categoryParam);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [categoryParam, services]);

  const handleConsultationRequest = (serviceId: string) => {
    setConsultationServiceId(serviceId);
  };

  return (
    <div
      className="min-h-screen flex flex-col w-full bg-background text-foreground antialiased selection:bg-mint/20 selection:text-foreground"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ─── Header: STRICTLY UNTOUCHED AS MANDATED ─── */}
      <Header />

      <main className="flex-1 w-full">
        {/* Section 01: Hero Section (Inspired by Reference Layout) */}
        <ServicesHero isRtl={isRtl} />

        {/* Section 02: Services Overview Grid (Icons Only, Minimalist Glassmorphic Cards) */}
        <ServicesOverviewGrid isRtl={isRtl} services={services} />

        {/* Section 03: Why Us Section (background-attachment: fixed on Desktop, scroll on Mobile) */}
        <ServicesWhyUsSection isRtl={isRtl} />

        {/* Section 04: Specialized Department Feature Dossiers (Alternating Cards with Real Project Images) */}
        <ServicesDeepDive
          isRtl={isRtl}
          services={services}
          onConsultationRequest={handleConsultationRequest}
        />

        {/* Section 05: Call to Action (Streamlined Booking Box) */}
        <ServicesCTASection
          isRtl={isRtl}
          selectedServiceId={consultationServiceId}
        />
      </main>

      {/* ─── Footer: STRICTLY UNTOUCHED AS MANDATED ─── */}
      <Footer />
    </div>
  );
}
