import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import ClientsPartners from "@/components/sections/ClientsPartners";
import ClientLogoMarquee from "@/components/sections/ClientLogoMarquee";
import StatsSatisfaction from "@/components/sections/StatsSatisfaction";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import CaseStudies from "@/components/sections/CaseStudies";
import ContactCTA from "@/components/sections/ContactCTA";
import BlogArticles from "@/components/sections/BlogArticles";
import PricingPlans from "@/components/sections/PricingPlans";
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/layout/Footer";
import { BACKEND_URL } from "@/config/api";
import { getPageSeo } from "@/lib/seo";

const DEFAULT_SECTIONS = [
  { key: "hero", position: 1, isEnabled: true },
  { key: "partners", position: 2, isEnabled: true },
  { key: "stats", position: 3, isEnabled: true },
  { key: "about", position: 4, isEnabled: true },
  { key: "services", position: 5, isEnabled: true },
  { key: "case_studies", position: 6, isEnabled: true },
  { key: "articles", position: 7, isEnabled: true },
  { key: "pricing", position: 8, isEnabled: true },
  { key: "contact", position: 9, isEnabled: true },
];

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  hero: Hero,
  partners: ClientsPartners,
  stats: StatsSatisfaction,
  about: About,
  services: Services,
  case_studies: CaseStudies,
  articles: BlogArticles,
  pricing: PricingPlans,
  contact: ContactCTA,
  logos: ClientLogoMarquee,
  testimonials: Testimonials,
};

async function getHomeSections() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/home-sections`, {
      next: { tags: ["home-sections"] },
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_SECTIONS;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return DEFAULT_SECTIONS;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

async function getServicesData() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/services`, {
      next: { tags: ["services"] },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getClientPartnersData() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/client-partners`, {
      next: { tags: ["client-partners"] },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getStatsData() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/stats`, {
      next: { tags: ["stats"] },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  return getPageSeo("/", {
    title: "آن‌ساپ | آژانس دیجیتال مارکتینگ و توسعه نرم‌افزار",
    description: "آژانس خلاق دیجیتال مارکتینگ آن‌ساپ، پیشرو در طراحی سایت مدرن، سئو تکنیکال، برندینگ و اتوماسیون سازمانی.",
  });
}

export default async function HomePage() {
  const [sections, services, partners, stats] = await Promise.all([
    getHomeSections(),
    getServicesData(),
    getClientPartnersData(),
    getStatsData(),
  ]);

  const activeSections = sections
    .filter((s: any) => s.isEnabled !== false)
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="flex min-h-screen flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        {activeSections.map((sec: any) => {
          if (sec.key === "services") {
            return <Services key="services" initialServices={services} />;
          }
          if (sec.key === "partners") {
            return <ClientsPartners key="partners" initialPartners={partners} />;
          }
          if (sec.key === "stats") {
            return <StatsSatisfaction key="stats" initialStats={stats} />;
          }
          const Comp = COMPONENT_MAP[sec.key];
          if (!Comp) return null;
          return <Comp key={sec.key} />;
        })}
      </main>
      <Footer />
    </div>
  );
}
