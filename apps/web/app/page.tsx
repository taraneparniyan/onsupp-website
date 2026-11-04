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

export default function HomePage() {
  return (
    // w-full ensures no accidental centering or capping at the page root level
    <div className="flex min-h-screen flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        {/* 1. Hero: full viewport width */}
        <Hero />

        {/* 2. Clients & Partners: immediately following Hero (Mandatory Section Order) */}
        <ClientsPartners />

        {/* 3. Statistics & Client Satisfaction: full-bleed unified glassmorphism section */}
        <StatsSatisfaction />

        {/* 4. Services: immediately after Statistics */}
        <Services />

        {/* 5. About OnSupp */}
        <About />

        {/* 6. Client Logo Marquee: برندهایی که به ما اعتماد کرده‌اند */}
        <ClientLogoMarquee />

        {/* 7. Our Work / Portfolio */}
        <CaseStudies />

        {/* 6. CTA / Contact */}
        <ContactCTA />

        {/* 7. Client Testimonials */}
        <Testimonials />

        {/* 8. Articles */}
        <BlogArticles />
      </main>
      <Footer />
    </div>
  );
}
