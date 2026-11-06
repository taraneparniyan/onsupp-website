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
import Testimonials from "@/components/sections/Testimonials";
import Footer from "@/components/layout/Footer";
import { getHomepageSections, getServices, getSiteSettings } from "@/lib/publicApi";

const DEFAULT_SECTION_ORDER = [
  "hero",
  "clients-partners",
  "stats",
  "services",
  "about",
  "client-marquee",
  "casestudies",
  "contact-cta",
  "testimonials",
  "blog-articles",
];

export default async function HomePage() {
  const [sections, settings, services] = await Promise.all([
    getHomepageSections(),
    getSiteSettings(),
    getServices(),
  ]);

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: <Hero key="hero" />,
    "clients-partners": <ClientsPartners key="clients-partners" />,
    stats: <StatsSatisfaction key="stats" />,
    services: <Services key="services" initialServices={services} />,
    about: <About key="about" />,
    "client-marquee": <ClientLogoMarquee key="client-marquee" />,
    casestudies: <CaseStudies key="casestudies" />,
    "contact-cta": <ContactCTA key="contact-cta" />,
    testimonials: <Testimonials key="testimonials" />,
    "blog-articles": <BlogArticles key="blog-articles" />,
  };

  let orderedKeys: string[] = DEFAULT_SECTION_ORDER;
  if (Array.isArray(sections) && sections.length > 0) {
    const valid = sections
      .filter((s) => s.isEnabled)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((s) => s.key)
      .filter((key) => key in sectionComponents);

    if (valid.length > 0) {
      orderedKeys = valid;
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
