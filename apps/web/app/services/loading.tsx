import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton, ServiceCardSkeleton } from "@/components/ui/Skeleton";

export default function ServicesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full pt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-16 h-4" />
            <span className="text-white/20">/</span>
            <Skeleton className="w-20 h-4" />
          </div>

          {/* Page Header skeleton */}
          <header className="mb-10 sm:mb-14 border-b border-white/10 pb-8 sm:pb-10 space-y-4">
            <Skeleton className="w-44 h-6 rounded-full" />
            <Skeleton className="w-80 sm:w-96 h-10 rounded-xl" />
            <Skeleton className="w-full max-w-2xl h-4" />
            <Skeleton className="w-3/4 max-w-xl h-4" />
          </header>

          {/* Filter tabs skeleton */}
          <div className="mb-10 space-y-3">
            <Skeleton className="w-48 h-3.5" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="w-32 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
              <Skeleton className="w-36 h-9 rounded-xl" />
              <Skeleton className="w-28 h-9 rounded-xl" />
              <Skeleton className="w-32 h-9 rounded-xl" />
            </div>
          </div>

          {/* Cards skeleton list */}
          <div className="space-y-6 sm:space-y-8">
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
