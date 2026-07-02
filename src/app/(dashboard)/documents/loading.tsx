import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentsLoading() {
  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-64" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-6">
        <Skeleton className="h-96 w-52 hidden lg:block" />
        <Skeleton className="h-96 flex-1 rounded-xl" />
      </div>
    </div>
  );
}
