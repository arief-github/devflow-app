import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Bikin array [0..count-1] untuk di-map */
const range = (count: number) => Array.from({ length: count }, (_, i) => i);

/* -------------------------------------------------------------------------- */
/*                          Search bar (+ filter)                             */
/* -------------------------------------------------------------------------- */

type SearchBarSkeletonProps = {
  /**
   * - "always": filter dropdown selalu tampil (tags, collection, community)
   * - "mobile": hanya tampil di layar < md (home, karena di desktop pakai HomeFilters)
   * - "none"  : tanpa filter (tags/[id])
   */
  filter?: "always" | "mobile" | "none";
};

export function SearchBarSkeleton({
  filter = "always",
}: SearchBarSkeletonProps) {
  if (filter === "none") {
    return <Skeleton className="mb-12 mt-11 h-14 w-full" />;
  }

  return (
    <div className="mb-12 mt-11 flex flex-wrap items-center justify-between gap-5">
      <Skeleton className="h-14 flex-1" />
      {filter === "always" ? (
        <Skeleton className="h-14 w-28" />
      ) : (
        <div className="hidden max-md:block">
          <Skeleton className="h-14 w-28" />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Filter chips (desktop)                            */
/* -------------------------------------------------------------------------- */

export function HomeFiltersSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="my-10 hidden flex-wrap gap-6 md:flex">
      {range(count).map((i) => (
        <Skeleton key={i} className="h-9 w-40" />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Daftar question / answer                           */
/* -------------------------------------------------------------------------- */

type QuestionListSkeletonProps = {
  count?: number;
  className?: string;
};

export function QuestionListSkeleton({
  count = 5,
  className,
}: QuestionListSkeletonProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {range(count).map((i) => (
        <Skeleton key={i} className="h-48 w-full rounded-xl" />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Grid card (tags & community)                         */
/* -------------------------------------------------------------------------- */

export function CardGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-4">
      {range(count).map((i) => (
        <Skeleton key={i} className="h-60 w-full rounded-2xl sm:w-65" />
      ))}
    </div>
  );
}
