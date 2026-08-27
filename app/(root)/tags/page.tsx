import GenericCard from "@/components/shared/GenericCard";
import NoResult from "@/components/shared/NoResult";
import LocalSearchBar from "@/components/shared/LocalSearchBar";
import Filter from "@/components/shared/Filter";
import { getAllTags, TagListItem } from "@/lib/actions/tags.action";
import { SearchParamsProps } from "@/types";

const Page = async ({ searchParams }: SearchParamsProps) => {
  const { q } = searchParams;
  const { tags } = await getAllTags({ searchQuery: q });

  return (
    <>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/tags"
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="Search for tags"
          otherClasses="flex-1"
        />

        <Filter filters={[]} otherClasses="min-h-[56px] sm:min-w-[170px]" />
      </div>

      <GenericCard<TagListItem>
        title="All Tags"
        items={tags}
        getLinkHref={(tag) => `/tags/${tag._id}`}
        renderCard={(tag) => (
          <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-65">
            <div className="background-light800_dark400 w-fit rounded-sm px-5 py-1.5">
              <p className="paragraph-semibold text-dark400_light500">
                {tag.name}
              </p>
            </div>

            <p className="small-medium text-dark400_light500 mt-3.5">
              <span className="body-semibold primary-text-gradient mr-2.5">
                {tag.questions.length}+
              </span>{" "}
              Questions
            </p>
          </article>
        )}
        noResultsMessage={
          <NoResult
            title="No Tags Found"
            description="It looks like there are no tags found."
            link="/ask-question"
            linkTitle="Ask a question"
          />
        }
        cardClassName="shadow-light100_darknone"
      />
    </>
  );
};

export default Page;
