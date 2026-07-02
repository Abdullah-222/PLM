import { Skeleton } from "@/components/ui/skeleton";

export default function RevisionsLoading() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
