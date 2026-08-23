import QuestionForm from "@/components/forms/QuestionForm";
import { getQuestionById } from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { ParamsProps } from "@/types";
import { auth } from "@clerk/nextjs/server";

const Page = async ({ params }: ParamsProps) => {
  const { id } = await params;

  const authObject = await auth();
  if (!authObject.userId) return null;

  const mongoUser = await getUserById({ userId: authObject.userId });
  if (!mongoUser) return null;

  const { question } = await getQuestionById({ questionId: id });
  if (!question) return null;

  const plainQuestion = JSON.parse(JSON.stringify(question));
  const mongoUserId = mongoUser?._id ? String(mongoUser._id) : "";

  console.log(plainQuestion);

  return (
    <div className="flex w-full flex-col gap-6">
      <h1 className="h1-bold text-dark100_light900">Edit Question</h1>

      <div className="mt-9">
        <QuestionForm
          mode="edit"
          questionDetails={{
            _id: plainQuestion._id,
            title: plainQuestion.title,
            explanation: plainQuestion.content,
            tags: plainQuestion.tags || [],
          }}
          mongoUserId={mongoUserId}
        />
      </div>
    </div>
  );
};

export default Page;
