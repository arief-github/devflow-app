import QuestionForm from "@/components/forms/QuestionForm";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAllTags } from "@/lib/actions/tags.action";

const AskQuestionpage = async () => {
  const authObject = await auth();
  const { tags } = await getAllTags();

  if (!authObject.userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId: authObject.userId });

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>

      <div className="mt-9">
        <QuestionForm mongoUserId={mongoUser} tagSuggestions={tags} />
      </div>
    </div>
  );
};

export default AskQuestionpage;
