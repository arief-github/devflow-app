import QuestionCard from "@/components/shared/QuestionCard";
import NoResult from "@/components/shared/NoResult";
import LocalSearchBar from "@/components/shared/LocalSearchBar";
import { QuestionCardProps } from "@/lib/types/sharedtypes";
import { getQuestionsByTagId } from "@/lib/actions/tags.action";
import { URLProps } from "@/types";

const Page = async ({ params, searchParams }: URLProps) => {
  const { id } = await params;
  const { q } = await searchParams;

  const result = await getQuestionsByTagId({
    tagId: id,
    page: 1,
    searchQuery: q,
  });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">
        {result.tagTitle} has {result.questions.length} questions
      </h1>

      <div className="mt-11 w-full">
        <LocalSearchBar
          route={`/tags/${id}`}
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="Search tag questions"
          otherClasses="flex-1"
        />
      </div>

      <div className="mt-10 flex w-full flex-col gap-6">
        {result.questions.length > 0 ? (
          result.questions.map((question: QuestionCardProps) => (
            <QuestionCard
              key={question._id}
              _id={question._id}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))
        ) : (
          <NoResult
            title="There’s no tag question saved to show"
            description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
            link="/ask-question"
            linkTitle="Ask a Question"
          />
        )}
      </div>
    </>
  );
};

export default Page;
