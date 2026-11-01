import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-2">
          <Skeleton className="w-48 h-7 rounded-lg" />
          <Skeleton className="w-64 h-4" />
        </div>
        <Skeleton className="w-36 h-10 rounded-xl" />
      </div>

      <TableRowSkeleton rows={6} />
    </div>
  );
}
