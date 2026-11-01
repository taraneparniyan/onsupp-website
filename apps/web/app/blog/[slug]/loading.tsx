import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Skeleton, ArticleDetailSkeleton } from "@/components/ui/Skeleton";

export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground" dir="rtl">
      <Header />

      <main className="flex-1 w-full pt-24 pb-16 sm:pb-24">
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="w-16 h-4" />
            <span className="text-white/20">/</span>
            <Skeleton className="w-16 h-4" />
            <span className="text-white/20">/</span>
            <Skeleton className="w-32 h-4" />
          </div>

          <ArticleDetailSkeleton />
        </div>
      </main>

      <Footer />
    </div>
  );
}
