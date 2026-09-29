import { getUserById } from "@/lib/actions/user.action";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/shared/ProfileForm";

const Page = async () => {
  const authObject = await auth();

  if (!authObject.userId) {
    redirect("/sign-in");
  }

  const mongoUser = await getUserById({ userId: authObject.userId });

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Profile</h1>

      <div className="mt-9">
        <ProfileForm
          clerkId={authObject.userId}
          user={JSON.stringify(mongoUser)}
        />
      </div>
    </>
  );
};

export default Page;
