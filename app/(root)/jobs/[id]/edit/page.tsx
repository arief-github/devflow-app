import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import JobForm from "@/components/jobs/JobForm";
import { getJobById } from "@/lib/actions/job.action";
import { jobToFormInput } from "@/lib/job-validation";

type Params = Promise<{ id: string }>;

export default async function EditJobPage({ params }: { params: Params }) {
  const { id } = await params;

  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const job = await getJobById({ jobId: id });
  if (!job) notFound();

  // Hanya pemilik yang boleh membuka form edit.
  // (updateJob juga mengecek ulang di server.)
  if (job.postedBy.clerkId !== userId) redirect(`/jobs/${id}`);

  return (
    <>
      <h1 className="h1-bold text-dark100_light900">Edit Job</h1>
      <JobForm mode="edit" jobId={job.id} defaultValues={jobToFormInput(job)} />
    </>
  );
}
