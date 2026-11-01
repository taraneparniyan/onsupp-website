import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PricingLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full pt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <header className="mb-12 border-b border-white/10 pb-8 text-center space-y-4">
            <Skeleton className="w-36 h-6 rounded-full mx-auto" />
            <Skeleton className="w-80 h-10 rounded-xl mx-auto" />
            <Skeleton className="w-full max-w-xl h-4 mx-auto" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-panel p-6 sm:p-8 space-y-6">
                <Skeleton className="w-24 h-5 rounded-full" />
                <Skeleton className="w-40 h-8 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-xl" />
                <div className="space-y-3 pt-4 border-t border-white/5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                      <Skeleton className="w-full h-3.5" />
                    </div>
                  ))}
                </div>
                <Skeleton className="w-full h-11 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
