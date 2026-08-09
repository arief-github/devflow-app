import { getUserInfo } from "@/lib/actions/user.action";
import { URLProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { getJoinedDate } from "@/lib/utils";
import ProfileLink from "@/components/shared/ProfileLink";
import Stats from "@/components/shared/Stats";

interface StatsCardProps {
  imgUrl: string;
  value: number;
  title: string;
}

const StatsCardItems: StatsCardProps[] = [
  {
    imgUrl: "/icons/gold-medal.svg",
    value: 0,
    title: "Gold Badges",
  },
  {
    imgUrl: "/icons/silver-medal.svg",
    value: 0,
    title: "Silver Badges",
  },
  {
    imgUrl: "/icons/bronze-medal.svg",
    value: 0,
    title: "Bronze Badges",
  },
];

const Page = async ({ params }: URLProps) => {
  const { id } = await params;
  const authObject = await auth();
  const clerkId = authObject.userId;

  const userInfo = await getUserInfo({ userId: id });

  return (
    <>
      <div className="flex flex-col-reverse items-start justify-between sm:flex-row">
        <div className="flex flex-col items-start gap-4 lg:flex-row">
          <Image
            src={userInfo?.user.picture}
            alt="profile picture"
            width={140}
            height={140}
            className="rounded-full object-cover"
          />

          <div className="mt-3">
            <h2 className="h2-bold text-dark100_light900">
              {userInfo.user.name}
            </h2>
            <p className="paragraph-regular text-dark-200_light800">
              @{userInfo.user.username}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-start gap-5">
              {userInfo.user.portfolioWebsite && (
                <ProfileLink
                  imgUrl="/icons/link.svg"
                  href={userInfo.user.portfolioWebsite}
                  title="Portfolio"
                />
              )}

              {userInfo.user.location && (
                <ProfileLink
                  imgUrl="/icons/location.svg"
                  title={userInfo.user.location}
                />
              )}

              <ProfileLink
                imgUrl="/icons/calendar.svg"
                title={getJoinedDate(userInfo.user.joinedAt)}
              />
            </div>
            {userInfo.user.bio && (
              <p className="paragraph-regular text-dark400_light800 mt-8">
                {userInfo.user.bio}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end max-sm:mb-5 max-sm:w-full sm:mt-3 gap-3">
          {clerkId === userInfo.user.clerkId && (
            <Link href="/profile/edit">
              <Button className="paragraph-medium btn-secondary text-dark300_light900 h-11 w-44 px-4 py-3">
                Edit Profile
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Stats
        totalQuestions={userInfo.totalQuestion}
        totalAnswers={userInfo.totalAnswers}
        badgesItems={StatsCardItems}
      />
    </>
  );
};

export default Page;
