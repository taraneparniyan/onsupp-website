"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";
import ServicesHero from "./ServicesHero";
import ServicesOverviewGrid from "./ServicesOverviewGrid";
import ServicesDeepDive from "./ServicesDeepDive";
import ServicesCTASection from "./ServicesCTASection";
import { DETAILED_SERVICES_DATA } from "./services-data";
import { scrollToSection } from "@/lib/scroll";

export default function ServicesPageView() {
  const { lang } = useLanguage();
  const isRtl = lang === "fa";
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [consultationServiceId, setConsultationServiceId] = useState<string>("seo");

  // Sync initial category parameter from URL
  useEffect(() => {
    if (categoryParam && DETAILED_SERVICES_DATA.some((s) => s.id === categoryParam)) {
      setSelectedCategory(categoryParam);
      setConsultationServiceId(categoryParam);

      // Smooth scroll to the targeted section after initial mount
      const timer = setTimeout(() => {
        scrollToSection(categoryParam);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setSelectedCategory("all");
    }
  }, [categoryParam]);

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId !== "all") {
      setConsultationServiceId(categoryId);
    }

    // Update URL query parameter without full reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (categoryId === "all") {
        url.searchParams.delete("category");
      } else {
        url.searchParams.set("category", categoryId);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const handleConsultationRequest = (serviceId: string) => {
    setConsultationServiceId(serviceId);
  };

  return (
    <div
      className="min-h-screen flex flex-col w-full bg-background text-foreground antialiased selection:bg-mint/20 selection:text-foreground"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      <main className="flex-1 w-full pt-20 sm:pt-28">
        {/* Section 01: Services Overview (Glassmorphism Cards Grid) */}
        <ServicesOverviewGrid isRtl={isRtl} />

        {/* Section 02: Individual Service Details (Varied Editorial Compositions) */}
        <ServicesDeepDive
          isRtl={isRtl}
          onConsultationRequest={handleConsultationRequest}
        />

        {/* Section 04: Call to Action (Closing Section) */}
        <ServicesCTASection
          isRtl={isRtl}
          selectedServiceId={consultationServiceId}
        />
      </main>

      <Footer />
    </div>
  );
}
