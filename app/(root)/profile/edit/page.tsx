import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Page = async () => {
  const authObject = await auth();

  if (!authObject.userId) {
    redirect("/sign-in");
  }

  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-dark50_light700 bg-white_dark900 p-8 shadow-sm">
      <h1 className="h2-bold mb-4 text-dark100_light900">Edit Profile</h1>
      <p className="paragraph-regular text-dark400_light800">
        This page is reserved for authenticated users. Implement your edit form here.
      </p>
    </div>
  );
};

export default Page;
