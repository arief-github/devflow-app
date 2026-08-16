import { SearchParamsProps } from "@/types";
import ProfileCardQorA from "../profile/ProfileCardQorA";
import { getUserQuestions, getUserAnswers } from "@/lib/actions/user.action";
import { QuestionCardProps, AnswerCardProps } from "./sharedTypes";

interface Props extends SearchParamsProps {
  type: "question" | "answer";
  userId: string;
  clerkId?: string | null;
}

export const ProfileTab = async ({
  searchParams,
  userId,
  clerkId,
  type,
}: Props) => {
  const resultQuestion = await getUserQuestions({ userId, page: 1 });
  const resultAnswer = await getUserAnswers({ userId, page: 1 });

  return (
    <>
      {type === "question" ? (
        <>
          {resultQuestion.questions.map((question: QuestionCardProps) => (
            <ProfileCardQorA
              type="question"
              key={question._id}
              _id={question._id}
              clerkId={clerkId}
              title={question.title}
              tags={question.tags}
              author={question.author}
              upvotes={question.upvotes}
              views={question.views}
              answers={question.answers}
              createdAt={question.createdAt}
            />
          ))}
        </>
      ) : null}

      {type === "answer" ? (
        <>
          {resultAnswer.answers.map((answer: AnswerCardProps) => (
            <ProfileCardQorA
              type="answer"
              key={answer._id}
              _id={answer._id}
              clerkId={clerkId}
              question={answer.question}
              author={answer.author}
              upvotes={answer.upvotes}
              createdAt={answer.createdAt}
            />
          ))}
        </>
      ) : null}
    </>
  );
};
