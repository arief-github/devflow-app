import Link from "next/link";
import { Suspense } from "react";

import JobCard from "@/components/jobs/JobCard";
import Filter from "@/components/shared/Filter";
import LocalSearchBar from "@/components/shared/LocalSearchBar";
import NoResult from "@/components/shared/NoResult";
import Pagination from "@/components/shared/Pagination";
import { QuestionListSkeleton } from "@/components/skeletons/ListSkeletons";
import { Button } from "@/components/ui/button";
import { JOB_FILTERS, JOBS_PAGE_SIZE } from "@/constants/jobs";
import { getJobs } from "@/lib/actions/job.action";

type SearchParams = Promise<{ q?: string; filter?: string; page?: string }>;

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q = "", filter = "", page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);

  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="h1-bold text-dark100_light900">Find Jobs</h1>

        <div className="flex justify-end max-sm:w-full">
          <Button
            asChild
            className="primary-gradient min-h-11.5 px-4 py-3 text-light-900!"
          >
            <Link href="/jobs/new">Post a Job</Link>
          </Button>
        </div>
      </div>

      <div className="mb-12 mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearchBar
          route="/jobs"
          iconPosition="left"
          imgSrc="/icons/search.svg"
          placeholder="Search job title, company, skill, or location"
          otherClasses="flex-1"
        />
        <Filter
          filters={JOB_FILTERS}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
        />
      </div>

      <Suspense
        key={`${q}-${filter}-${pageNumber}`}
        fallback={<QuestionListSkeleton count={JOBS_PAGE_SIZE} />}
      >
        <JobList searchQuery={q} filter={filter} page={pageNumber} />
      </Suspense>
    </>
  );
}

async function JobList({
  searchQuery,
  filter,
  page,
}: {
  searchQuery: string;
  filter: string;
  page: number;
}) {
  const { jobs, isNext } = await getJobs({ searchQuery, filter, page });

  if (jobs.length === 0) {
    return (
      <NoResult
        title="No jobs found"
        description="Try a different keyword or filter, or be the first to post a job for the community."
        link="/jobs/new"
        linkTitle="Post a Job"
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      <div className="mt-10">
        <Pagination pageNumber={page} isNext={isNext} />
      </div>
    </>
  );
}
