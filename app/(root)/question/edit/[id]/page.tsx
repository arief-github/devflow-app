import QuestionForm from "@/components/forms/QuestionForm";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";

const Page = async ({ params }: ParamsProps) => {
  const authObject = await auth();
  if (!authObject.userId) return null;

  const mongoUser = await getUserById({ userId: authObject.userId });
  if (!mongoUser) return null;

  const { question } = await getQuestionById({ questionId: params.id });
  if (!question) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>

      <div className="mt-9">
        <QuestionForm
          mode="edit"
          questionDetails={{
            title: question.title,
            explanation: question.content,
            tags: question.tags || [],
          }}
          mongoUserId={String(mongoUser._id)}
        />
      </div>
    </div>
  );
};

export default Page;
