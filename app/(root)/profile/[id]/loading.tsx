import { LoadingSection } from "@/components/skeletons/LoadingSection";
import {
  ProfileHeaderSkeleton,
  ProfileStatsSkeleton,
  ProfileTabsSkeleton,
} from "@/components/skeletons/ProfileSkeletons";

export default function Loading() {
  return (
    <LoadingSection label="Loading profile">
      <ProfileHeaderSkeleton />
      <ProfileStatsSkeleton />
      <ProfileTabsSkeleton />
    </LoadingSection>
  );
}
