import { getQuestionById } from "@/lib/actions/question.action";
import NoResult from "@/components/shared/NoResult";
import Link from "next/link";
import Image from "next/image";
import Metric from "@/components/shared/Metric";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RenderTag";
import { auth } from "@clerk/nextjs/server";
import { getUserById } from "@/lib/actions/user.action";
import AnswerForm from "@/components/forms/AnswerForm";
import AnswerList from "@/components/shared/AnswerList";

const DetailQuestionPage = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const authObject = await auth();

  const mongoUser = !authObject.userId
    ? null
    : await getUserById({ userId: authObject.userId });

  const { question } = await getQuestionById({ questionId: id });

  if (!question) {
    return (
      <NoResult
        title="Question not found"
        description="The question you are looking for does not exist or has been removed."
        link="/"
        linkTitle="Go back to Home"
      />
    );
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              className="rounded-full"
              width={22}
              height={22}
              alt="profile"
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>
          <div className="flex justify-end">VOTING</div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {question.title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimestamp(question.createdAt)}`}
          title=" Asked"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message"
          value={formatAndDivideNumber(question.answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(question.views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      <ParseHTML data={question.content} />

      <div className="mt-8 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      {/* Show All Previous Answer */}
      <AnswerList
        questionId={question._id}
        userId={JSON.stringify(mongoUser?._id) || ""}
        totalAnswers={question.answers.length}
      />

      {/* Show Form Input for Answer */}
      <AnswerForm
        questionId={JSON.stringify(question._id)}
        question={question.content}
        authorId={JSON.stringify(mongoUser?._id) || ""}
      />
    </>
  );
};

export default DetailQuestionPage;
