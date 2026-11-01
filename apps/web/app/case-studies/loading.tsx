import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton, ArticleCardSkeleton } from "@/components/ui/Skeleton";

export default function CaseStudiesLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full pt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <header className="mb-10 sm:mb-12 border-b border-white/10 pb-8 space-y-4">
            <Skeleton className="w-36 h-6 rounded-full" />
            <Skeleton className="w-72 h-10 rounded-xl" />
            <Skeleton className="w-full max-w-xl h-4" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
            <ArticleCardSkeleton />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
