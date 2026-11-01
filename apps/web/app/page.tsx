import Header from "@/components/layout/Header";
import Hero from "@/components/sections/Hero";
import StatsBanner from "@/components/sections/StatsBanner";
import Services from "@/components/sections/Services";
import BrandLogos from "@/components/sections/BrandLogos";
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

        {/* 2. Statistics / Trust strip: immediately below Hero */}
        <div className="w-full bg-[#131618] border-b border-white/5">
          <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-12 lg:px-24 py-6 sm:py-8">
            <StatsBanner />
          </div>
        </div>

        {/* 3. Services: immediately after Statistics */}
        <Services />

        {/* 4. Brand Partners / Trust Logos: between Services and About */}
        <BrandLogos />

        {/* 5. About OnSupp */}
        <About />

        {/* 5. Our Work / Portfolio */}
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
