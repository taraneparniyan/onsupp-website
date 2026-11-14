import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import ClientsPartners from "@/components/sections/ClientsPartners";
import ClientLogoMarquee from "@/components/sections/ClientLogoMarquee";
import StatsSatisfaction from "@/components/sections/StatsSatisfaction";
import Services from "@/components/sections/Services";
import CaseStudies from "@/components/sections/CaseStudies";
import ContactCTA from "@/components/sections/ContactCTA";
import Testimonials from "@/components/sections/Testimonials";
import BlogArticles from "@/components/sections/BlogArticles";
import Footer from "@/components/layout/Footer";
import { getHomepageSections, getServices, getSiteSettings } from "@/lib/publicApi";

export const dynamic = "force-dynamic";

const DEFAULT_SECTION_ORDER = [
  "hero",
  "clients-partners",
  "client-marquee",
  "services",
  "stats",
  "casestudies",
  "contact-cta",
  "testimonials",
  "blog-articles",
];

const SECTION_KEY_ALIASES: Record<string, string> = {
  partners: "clients-partners",
  logos: "client-marquee",
  case_studies: "casestudies",
  contact: "contact-cta",
  articles: "blog-articles",
};

export default async function HomePage() {
  const [sections, settings, services] = await Promise.all([
    getHomepageSections(),
    getSiteSettings(),
    getServices(),
  ]);

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    "clients-partners": <ClientsPartners key="clients-partners" />,
    "client-marquee": <ClientLogoMarquee key="client-marquee" />,
    services: <Services key="services" initialServices={services} />,
    stats: <StatsSatisfaction key="stats" />,
    casestudies: <CaseStudies key="casestudies" />,
    "contact-cta": <ContactCTA key="contact-cta" />,
    testimonials: <Testimonials key="testimonials" />,
    "blog-articles": <BlogArticles key="blog-articles" />,
  };

  let orderedKeys: string[] = DEFAULT_SECTION_ORDER;
  if (Array.isArray(sections) && sections.length > 0) {
    const normalized = sections
      .filter((s) => s.isEnabled !== false)
      .map((s) => ({
        ...s,
        canonicalKey: SECTION_KEY_ALIASES[s.key] ?? s.key,
      }))
      .filter((s) => s.canonicalKey in sectionComponents)
      .sort((a, b) => {
        const posDiff = (a.position ?? 0) - (b.position ?? 0);
        if (posDiff !== 0) return posDiff;
        const orderDiff =
          DEFAULT_SECTION_ORDER.indexOf(a.canonicalKey) -
          DEFAULT_SECTION_ORDER.indexOf(b.canonicalKey);
        if (orderDiff !== 0) return orderDiff;
        return (a.id ?? 0) - (b.id ?? 0);
      });

    const deduped: string[] = [];
    for (const s of normalized) {
      if (!deduped.includes(s.canonicalKey)) {
        deduped.push(s.canonicalKey);
      }
    }

    if (deduped.length > 0) {
      orderedKeys = deduped;
    }
  }

  return (
    <div className="flex min-h-screen flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        {orderedKeys.map((key) => sectionComponents[key])}
      </main>
      <Footer initialSettings={settings} />
    </div>
  );
}
