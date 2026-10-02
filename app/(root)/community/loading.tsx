import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  CardGridSkeleton,
  SearchBarSkeleton,
} from "@/components/skeletons/ListSkeletons";

// getAllUsers belum punya pagination; sesuaikan jika nanti ditambahkan
const CARD_COUNT = 10;

export default function Loading() {
  return (
    <LoadingSection label="Loading users">
      <h1 className="h1-bold text-dark100_light900">All Users</h1>
      <SearchBarSkeleton />
      <CardGridSkeleton count={CARD_COUNT} />
    </LoadingSection>
  );
}
