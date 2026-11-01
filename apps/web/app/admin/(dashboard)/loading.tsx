import { Skeleton, StatsCardSkeleton, AnalyticsChartSkeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8" dir="rtl">
      {/* Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-panel border border-white/10 space-y-4">
        <Skeleton className="w-36 h-5 rounded-full" />
        <Skeleton className="w-64 h-8 rounded-lg" />
        <Skeleton className="w-full max-w-xl h-4" />
      </div>

      {/* Primary Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Analytics Chart Skeleton */}
      <AnalyticsChartSkeleton />
    </div>
  );
}
