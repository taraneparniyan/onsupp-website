import { Skeleton, MediaGridSkeleton } from "@/components/ui/Skeleton";

export default function AdminMediaLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-2">
          <Skeleton className="w-48 h-7 rounded-lg" />
          <Skeleton className="w-72 h-4" />
        </div>
        <Skeleton className="w-36 h-10 rounded-xl" />
      </div>

      {/* Media Grid Skeleton */}
      <MediaGridSkeleton count={12} />
    </div>
  );
}
