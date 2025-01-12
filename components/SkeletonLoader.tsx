import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-full bg-violet-200 dark:bg-violet-700" />
      <Skeleton className="h-8 w-3/4 bg-violet-200 dark:bg-violet-700" />
      <Skeleton className="h-8 w-5/6 bg-violet-200 dark:bg-violet-700" />
      <Skeleton className="h-8 w-2/3 bg-violet-200 dark:bg-violet-700" />
    </div>
  )
}

