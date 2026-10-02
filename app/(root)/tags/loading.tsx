import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  CardGridSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";

// Samakan dengan pageSize default di getAllTags
const PAGE_SIZE = 9;

export default function Loading() {
  return (
    <LoadingSection label="Loading tags">
      <h1 className="h1-bold text-dark100_light900">Tags</h1>
      <SearchBarSkeleton />
      <CardGridSkeleton count={PAGE_SIZE} />
    </LoadingSection>
  );
}
