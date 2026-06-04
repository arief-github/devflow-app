import QuestionForm from "@/components/forms/QuestionForm";
import { getUserById } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

const AskQuestionpage = async () => {
  // mock user id
  const userId = "clerk_user_1";

  if (!userId) redirect("/sign-in");

  const mongoUser = await getUserById({ userId });

  console.log("mongo user => ", mongoUser);

  return (
    <div>
      <h1 className="h1-bold text-dark100_light900">Ask a Question</h1>

      <div className="mt-9">
        <QuestionForm mongoUserId={mongoUser} />
      </div>
    </div>
  );
};

export default AskQuestionpage;
