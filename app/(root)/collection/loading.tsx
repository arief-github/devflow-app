import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  QuestionListSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";

// Samakan dengan pageSize default di getSavedQuestions
const PAGE_SIZE = 5;

export default function Loading() {
  return (
    <LoadingSection label="Loading saved questions">
      <h1 className="h1-bold text-dark100_light900">Saved Questions</h1>
      <SearchBarSkeleton />
      <QuestionListSkeleton count={PAGE_SIZE} />
    </LoadingSection>
  );
}
