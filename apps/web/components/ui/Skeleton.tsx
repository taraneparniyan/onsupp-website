import React from "react";

/**
 * Base Skeleton Primitive
 * Renders an accessible placeholder with subtle pulse/shimmer animation,
 * strictly honoring `prefers-reduced-motion: reduce`.
 */
export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse motion-reduce:animate-none bg-foreground/[0.08] rounded-lg ${className}`}
      {...props}
    />
  );
}

/**
 * Skeleton for Admin / Dashboard Stat Metrics Cards
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-panel p-5 sm:p-6 rounded-2xl border border-foreground/10 space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-11 h-11 rounded-xl bg-foreground/10" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="w-24 h-3.5" />
        <Skeleton className="w-16 h-8 rounded-md" />
      </div>
      <div className="pt-2 border-t border-foreground/10 flex items-center justify-between">
        <Skeleton className="w-28 h-3" />
        <Skeleton className="w-12 h-3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Dashboard Analytics Section & Tracking Chart
 */
export function AnalyticsChartSkeleton() {
  return (
    <div className="bg-panel p-6 sm:p-7 rounded-2xl border border-white/10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-2">
          <Skeleton className="w-48 h-5" />
          <Skeleton className="w-64 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-8 rounded-xl" />
          <Skeleton className="w-16 h-8 rounded-xl" />
          <Skeleton className="w-16 h-8 rounded-xl" />
        </div>
      </div>

      {/* Simulated Chart Bars / Curves */}
      <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-4 pt-8 px-2">
        {[40, 65, 30, 85, 55, 90, 45, 75, 60, 95, 70, 80].map((heightPct, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <Skeleton
              className="w-full rounded-t-lg bg-white/[0.08]"
              style={{ height: `${heightPct}%` }}
            />
            <Skeleton className="w-6 h-2.5" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <Skeleton className="w-20 h-3" />
            <Skeleton className="w-12 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Blog / Article Cards
 */
export function ArticleCardSkeleton() {
  return (
    <article className="rounded-2xl border border-white/10 bg-panel overflow-hidden flex flex-col">
      {/* Thumbnail Aspect Ratio */}
      <Skeleton className="w-full aspect-[16/10] rounded-none bg-white/[0.06]" />

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-12 h-3" />
          </div>
          <Skeleton className="w-5/6 h-5" />
          <Skeleton className="w-full h-3.5" />
          <Skeleton className="w-4/5 h-3.5" />
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-20 h-3" />
          </div>
          <Skeleton className="w-14 h-4 rounded-md" />
        </div>
      </div>
    </article>
  );
}

/**
 * Skeleton for Services Page Department Items
 */
export function ServiceCardSkeleton() {
  return (
    <article className="rounded-2xl border border-white/10 bg-panel/80 p-5 sm:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-start sm:items-center gap-3.5">
          <Skeleton className="w-10 h-7 rounded-lg" />
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-4 rounded" />
            <Skeleton className="w-48 sm:w-64 h-6" />
            <Skeleton className="w-72 sm:w-96 h-3.5" />
          </div>
        </div>
        <Skeleton className="w-24 h-4" />
      </div>

      {/* Subservices Grid */}
      <div className="space-y-3">
        <Skeleton className="w-36 h-3.5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-background/80 border border-white/5 p-4 flex items-start gap-3">
              <Skeleton className="w-5 h-5 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-1/2 h-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Links & Action */}
      <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-6 rounded-lg" />
          <Skeleton className="w-24 h-6 rounded-lg" />
        </div>
        <Skeleton className="w-36 h-8 rounded-lg" />
      </div>
    </article>
  );
}

/**
 * Skeleton for Media Management Grid
 */
export function MediaGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-white/10 bg-panel overflow-hidden p-2 space-y-2">
          <Skeleton className="w-full aspect-square rounded-lg bg-white/[0.06]" />
          <Skeleton className="w-3/4 h-3 rounded" />
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="w-10 h-2.5 rounded" />
            <Skeleton className="w-4 h-4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Data Tables (Users, Contacts, Submissions)
 */
export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full divide-y divide-white/5 rounded-xl border border-white/10 bg-panel overflow-hidden">
      {/* Table Header */}
      <div className="px-5 py-3.5 bg-white/[0.03] flex items-center justify-between">
        <Skeleton className="w-28 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-12 h-4" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-44 h-3" />
            </div>
          </div>
          <Skeleton className="w-20 h-6 rounded-full shrink-0" />
          <Skeleton className="w-16 h-6 rounded-full shrink-0" />
          <div className="flex items-center gap-2 shrink-0">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for Article Detail Page
 */
export function ArticleDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Article Header */}
      <div className="space-y-4">
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-5/6 sm:w-3/4 h-10 sm:h-12 rounded-xl" />
        <div className="flex items-center gap-4 pt-2">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="w-28 h-3.5" />
            <Skeleton className="w-20 h-3" />
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <Skeleton className="w-full aspect-[21/9] rounded-2xl bg-white/[0.06]" />

      {/* Main Content & TOC Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-4/5 h-4" />
          <Skeleton className="w-1/2 h-6 pt-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-full h-4" />
          <Skeleton className="w-3/4 h-4" />
        </div>
        <div className="hidden lg:block space-y-3">
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-full h-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

