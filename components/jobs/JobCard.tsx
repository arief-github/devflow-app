import Link from "next/link";

import { EMPLOYMENT_TYPE_LABEL, EXPERIENCE_LEVEL_LABEL } from "@/constants/jobs";
import type { JobDTO } from "@/lib/types/job.types";

import CompanyLogo from "./CompanyLogo";
import { formatLocation, formatPostedDate, formatSalary } from "./job-format";

const MAX_SKILLS_SHOWN = 4;

export default function JobCard({ job }: { job: JobDTO }) {
  const salary = formatSalary(job.salary);
  const extraSkills = job.skills.length - MAX_SKILLS_SHOWN;

  return (
    <article className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex items-start gap-5">
        <CompanyLogo name={job.company.name} logo={job.company.logo} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={`/jobs/${job.id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1">
              {job.title}
            </h3>
          </Link>
          <p className="body-medium text-dark400_light700">{job.company.name}</p>
          <p className="small-regular text-dark400_light700">{formatLocation(job)}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md px-4 py-2 uppercase">
          {EMPLOYMENT_TYPE_LABEL[job.employmentType]}
        </span>
        {job.experienceLevel && (
          <span className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md px-4 py-2 uppercase">
            {EXPERIENCE_LEVEL_LABEL[job.experienceLevel]}
          </span>
        )}
        {job.skills.slice(0, MAX_SKILLS_SHOWN).map((skill) => (
          <span
            key={skill}
            className="subtle-medium background-light800_dark300 text-light400_light500 rounded-md px-4 py-2"
          >
            {skill}
          </span>
        ))}
        {extraSkills > 0 && (
          <span className="subtle-medium text-dark400_light700 px-2 py-2">+{extraSkills}</span>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="body-semibold text-dark300_light700">{salary ?? "Salary not disclosed"}</p>
        <p className="small-regular text-dark400_light700">
          Posted {formatPostedDate(job.createdAt)}
        </p>
      </div>
    </article>
  );
}
