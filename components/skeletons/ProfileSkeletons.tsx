import { Skeleton } from "@/components/ui/skeleton";

import { QuestionListSkeleton } from "./ListSkeletons";

const range = (count: number) => Array.from({ length: count }, (_, i) => i);

/** Avatar, nama, username, link/lokasi/tanggal join, bio */
export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-start gap-4 lg:flex-row">
      <Skeleton className="h-36 w-36 rounded-full" />

      <div className="mt-3">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-3 h-7 w-20" />

        <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
          {range(3).map((i) => (
            <Skeleton key={i} className="h-9 w-36" />
          ))}
        </div>

        <Skeleton className="mt-8 h-7 w-9/12" />
      </div>
    </div>
  );
}

/** Judul "Stats" + 4 kartu (total Q&A dan 3 badge) */
export function ProfileStatsSkeleton() {
  return (
    <div className="mb-12 mt-10">
      <Skeleton className="h-7 w-full" />

      <div className="mt-5 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        {range(4).map((i) => (
          <Skeleton key={i} className="h-28 rounded-md" />
        ))}
      </div>
    </div>
  );
}

/** Tab Questions/Answers + daftar, dan kolom Top Tags di kanan */
export function ProfileTabsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="mt-10 flex gap-10">
      <div className="flex flex-1 flex-col">
        <div className="flex">
          <Skeleton className="h-11 w-24 rounded-r-none" />
          <Skeleton className="h-11 w-24 rounded-l-none" />
        </div>

        <QuestionListSkeleton count={count} className="mt-5 w-full" />
      </div>

      <div className="flex min-w-69.5 flex-col max-lg:hidden">
        <Skeleton className="h-7 w-10" />

        <div className="mt-7 flex flex-col gap-4">
          {range(5).map((i) => (
            <Skeleton key={i} className="h-7" />
          ))}
        </div>
      </div>
    </div>
  );
}
