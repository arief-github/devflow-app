import HomeHeader from "@/components/home/HomeHeader";
import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  HomeFiltersSkeleton,
  QuestionListSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";

// Samakan dengan pageSize default di getQuestions
const PAGE_SIZE = 5;

export default function Loading() {
  return (
    <LoadingSection label="Loading questions">
      <HomeHeader />
      <SearchBarSkeleton filter="mobile" />
      <HomeFiltersSkeleton />
      <QuestionListSkeleton count={PAGE_SIZE} />
    </LoadingSection>
  );
}
