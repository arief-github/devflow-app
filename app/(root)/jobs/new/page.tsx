import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import JobForm from "@/components/jobs/JobForm";

export default async function NewJobPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Post a Job</h1>
      <JobForm mode="create" />
    </>
  );
}
