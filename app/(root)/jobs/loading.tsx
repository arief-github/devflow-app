import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  QuestionListSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";
import { JOBS_PAGE_SIZE } from "@/constants/jobs";

export default function Loading() {
  return (
    <LoadingSection label="Loading jobs">
      <h1 className="h1-bold text-dark100_light900">Find Jobs</h1>
      <SearchBarSkeleton />
      <QuestionListSkeleton count={JOBS_PAGE_SIZE} />
    </LoadingSection>
  );
}
