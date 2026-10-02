import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  QuestionListSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";

// Samakan dengan pageSize default di getQuestionsByTagId
const PAGE_SIZE = 5;

export default function Loading() {
  return (
    <LoadingSection label="Loading tag questions">
      {/* Nama tag berasal dari database, jadi tetap skeleton */}
      <Skeleton className="h-12 w-52" />
      <SearchBarSkeleton filter="none" />
      <QuestionListSkeleton count={PAGE_SIZE} className="mt-10" />
    </LoadingSection>
  );
}
