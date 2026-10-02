import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import CompanyLogo from "@/components/jobs/CompanyLogo";
import DeleteJobButton from "@/components/jobs/DeleteJobButton";
import { formatLocation, formatPostedDate, formatSalary } from "@/components/jobs/job-format";
import { Button } from "@/components/ui/button";
import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL } from "@/constants/jobs";
import { getJobById } from "@/lib/actions/job.action";

type Params = Promise<{ id: string }>;

export default async function JobDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  const [job, { userId }] = await Promise.all([getJobById({ jobId: id }), auth()]);
  if (!job) notFound();

  const isOwner = userId === job.postedBy.clerkId;
  const isClosed = job.status === "closed";
  const salary = formatSalary(job.salary);

  const facts = [
    { label: "Employment", value: EMPLOYMENT_TYPE_LABEL[job.employmentType] },
    {
      label: "Experience",
      value: job.experienceLevel ? EXPERIENCE_LEVEL_LABEL[job.experienceLevel] : "Not specified",
    },
    { label: "Location", value: formatLocation(job) },
    { label: "Salary", value: salary ?? "Not disclosed" },
  ];

  return (
    <article>
      <Link href="/jobs" className="body-medium text-dark400_light700 hover:underline">
        ← Back to jobs
      </Link>

      {/* Header */}
      <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-5">
          <CompanyLogo name={job.company.name} logo={job.company.logo} size={72} />
          <div className="flex flex-col gap-1">
            <h1 className="h2-bold text-dark100_light900">{job.title}</h1>
            {job.company.website ? (
              <a
                href={job.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="paragraph-medium text-primary-500 hover:underline"
              >
                {job.company.name}
              </a>
            ) : (
              <p className="paragraph-medium text-dark400_light700">{job.company.name}</p>
            )}
            <p className="small-regular text-dark400_light700">
              Posted {formatPostedDate(job.createdAt)} by{" "}
              <Link href={`/profile/${job.postedBy.clerkId}`} className="hover:underline">
                {job.postedBy.name}
              </Link>
            </p>
          </div>
        </div>

        <div className="flex gap-3 max-sm:w-full">
          {isOwner && (
            <>
              <Button asChild variant="outline" className="min-h-[46px] px-4 py-3">
                <Link href={`/jobs/${job.id}/edit`}>Edit</Link>
              </Button>
              <DeleteJobButton jobId={job.id} />
            </>
          )}

          {isClosed ? (
            <Button disabled className="min-h-[46px] px-6 py-3">
              Closed
            </Button>
          ) : (
            <Button asChild className="primary-gradient min-h-[46px] px-6 py-3 !text-light-900">
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer nofollow">
                Apply now
              </a>
            </Button>
          )}
        </div>
      </header>

      {/* Ringkasan */}
      <dl className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-4">
        {facts.map(({ label, value }) => (
          <div key={label} className="light-border background-light900_dark300 rounded-md border p-5">
            <dt className="small-regular text-dark400_light700">{label}</dt>
            <dd className="paragraph-semibold text-dark200_light900 mt-1">{value}</dd>
          </div>
        ))}
      </dl>

      {/* Skills */}
      {job.skills.length > 0 && (
        <section className="mt-10">
          <h2 className="h3-semibold text-dark200_light900">Skills</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <li
                key={skill}
                className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md px-4 py-2"
              >
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Deskripsi — dirender sebagai teks biasa, BUKAN HTML, supaya aman dari XSS */}
      <section className="mt-10">
        <h2 className="h3-semibold text-dark200_light900">About the role</h2>
        <p className="paragraph-regular text-dark400_light800 mt-4 whitespace-pre-line">
          {job.description}
        </p>
      </section>
    </article>
  );
}
