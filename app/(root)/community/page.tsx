import GenericCard from "@/components/shared/GenericCard";
import Filter from "@/components/shared/Filter";
import LocalSearchBar from "@/components/shared/LocalSearchBar";
import User from "@/database/user.model";
import { connectToDatabase } from "@/lib/mongoose";
import Image from "next/image";
import Link from "next/link";

const Page = async () => {
  let users: Record<string, unknown>[] = [];
  let error = false;

  try {
    connectToDatabase();
    const result = await User.find({}).sort({ joinedAt: -1 });
    users = JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.error("Error fetching users:", err);
    error = true;
  }

  if (error) {
    return (
      <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
        <p>Failed to load users</p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/community"
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="Search for amazing minds"
          otherClasses="flex-1"
        />

        <Filter filters={[]} otherClasses="min-h-[56px] sm:min-w-[170px]" />
      </div>

      <GenericCard
        title="All Users"
        items={
          users as Array<{
            _id: string;
            picture: string;
            name: string;
            username: string;
            bio?: string;
            reputation?: number;
          }>
        }
        getLinkHref={(user) => `/community/${user._id}`}
        renderCard={(user) => {
          const userData = user as Record<string, unknown>;
          return (
            <div className="shadow-light100_darknone background-light900_dark200 light-border rounded-2xl border px-8 py-10">
              <div className="flex items-center gap-4">
                <Image
                  src={userData.picture as string}
                  alt={userData.name as string}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="h3-semibold text-dark200_light900">
                    {userData.name as string}
                  </p>
                  <p className="body-regular text-dark400_light500">
                    @{userData.username as string}
                  </p>
                </div>
              </div>
              {userData.bio ? (
                <p className="body-regular text-dark400_light500 mt-3">
                  {userData.bio as string}
                </p>
              ) : null}
              <p className="small-semibold text-dark300_light700 mt-3">
                Reputation: {(userData.reputation ?? 0) as number}
              </p>
            </div>
          );
        }}
        noResultsMessage={
          <div className="paragraph-regular text-dark200_light800">
            <p>No users yet</p>
            <Link href="/sign-up" className="mt-2 font-bold text-accent-blue">
              Join to be the first!
            </Link>
          </div>
        }
        containerClassName="mt-12 flex flex-wrap gap-4"
      />
    </>
  );
};

export default Page;
