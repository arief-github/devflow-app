import GenericCard from "@/components/shared/GenericCard";
import Filter from "@/components/shared/Filter";
import LocalSearchBar from "@/components/shared/LocalSearchBar";
import Image from "next/image";
import Link from "next/link";
import { SearchParamsProps } from "@/types";
import { getAllUsers, UserListItem } from "@/lib/actions/user.action";

const Page = async ({ searchParams }: SearchParamsProps) => {
  const { q } = await searchParams;
  const { users } = await getAllUsers({ searchQuery: q });

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

      <GenericCard<UserListItem>
        title="All Users"
        items={users}
        getLinkHref={(user) => `/community/${user._id}`}
        renderCard={(user) => {
          return (
            <div className="shadow-light100_darknone background-light900_dark200 light-border rounded-2xl border px-8 py-10">
              <div className="flex items-center gap-4">
                <Image
                  src={user.picture}
                  alt={user.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="h3-semibold text-dark200_light900">
                    {user.name}
                  </p>
                  <p className="body-regular text-dark400_light500">
                    @{user.username}
                  </p>
                </div>
              </div>
              {user.bio ? (
                <p className="body-regular text-dark400_light500 mt-3">
                  {user.bio}
                </p>
              ) : null}
              <p className="small-semibold text-dark300_light700 mt-3">
                Reputation: {user.reputation ?? 0}
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
