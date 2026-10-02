"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  isObjectIdOrHexString,
  type QueryFilter,
  type SortOrder,
  type Types,
} from "mongoose";

import { EMPLOYMENT_TYPES, JOBS_PAGE_SIZE, type EmploymentType } from "@/constants/jobs";
import Job, { type IJob } from "@/database/job.model";
import User from "@/database/user.model";
import { JobSchema, type JobFormInput, type JobFormValues } from "@/lib/job-validation";
import { toSearchRegex } from "@/lib/utils";

import type {
  ActionResult,
  DeleteJobParams,
  GetJobByIdParams,
  GetJobsParams,
  JobDTO,
} from "../types/job.types";
import { withDatabase } from "./with-database";

/* -------------------------------------------------------------------------- */
/*                         Helpers (tidak diekspor)                           */
/* -------------------------------------------------------------------------- */

const AUTHOR_FIELDS = "_id clerkId name picture";

type PopulatedJob = Omit<IJob, "postedBy"> & {
  postedBy: { _id: Types.ObjectId; clerkId: string; name: string; picture: string };
};

/** Dokumen Mongo → objek polos yang aman dikirim ke client */
function toJobDTO(job: PopulatedJob): JobDTO {
  return {
    id: String(job._id),
    title: job.title,
    description: job.description,
    company: {
      name: job.company.name,
      logo: job.company.logo,
      website: job.company.website,
    },
    location: { country: job.location.country, city: job.location.city },
    isRemote: job.isRemote,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    salary: {
      min: job.salary?.min,
      max: job.salary?.max,
      currency: job.salary?.currency ?? "IDR",
      period: job.salary?.period ?? "month",
    },
    skills: job.skills,
    applyUrl: job.applyUrl,
    status: job.status,
    postedBy: {
      id: String(job.postedBy._id),
      clerkId: job.postedBy.clerkId,
      name: job.postedBy.name,
      picture: job.postedBy.picture,
    },
    createdAt: job.createdAt.toISOString(),
  };
}

/** Field form (datar) → bentuk dokumen (bersarang) */
function toJobDocument(values: JobFormValues) {
  return {
    title: values.title,
    description: values.description,
    company: {
      name: values.companyName,
      logo: values.companyLogo,
      website: values.companyWebsite,
    },
    location: { country: values.country, city: values.city },
    isRemote: values.isRemote,
    employmentType: values.employmentType,
    experienceLevel: values.experienceLevel,
    salary: {
      min: values.salaryMin,
      max: values.salaryMax,
      currency: values.currency,
      period: values.salaryPeriod,
    },
    skills: values.skills,
    applyUrl: values.applyUrl,
  };
}

const isEmploymentType = (value: string): value is EmploymentType =>
  EMPLOYMENT_TYPES.some((type) => type === value);

/** Terjemahkan ?filter= menjadi kondisi query + sort */
function buildFilter(filter?: string): {
  query: QueryFilter<IJob>;
  sort: Record<string, SortOrder>;
} {
  const newest: Record<string, SortOrder> = { createdAt: -1 };

  if (filter === "highest_salary") return { query: {}, sort: { "salary.max": -1, ...newest } };
  if (filter === "remote") return { query: { isRemote: true }, sort: newest };
  if (filter && isEmploymentType(filter)) return { query: { employmentType: filter }, sort: newest };

  return { query: {}, sort: newest };
}

/**
 * User yang sedang login, diambil dari session Clerk di SERVER.
 * Jangan pernah percaya `userId` yang dikirim dari client —
 * server action bisa dipanggil siapa saja dengan argumen apa saja.
 */
async function getCurrentUserId(): Promise<Types.ObjectId | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await User.findOne({ clerkId }).select("_id").lean<{ _id: Types.ObjectId }>();
  return user?._id ?? null;
}

function parseJobInput(input: JobFormInput): ActionResult<never> | JobFormValues {
  const parsed = JobSchema.safeParse(input);
  if (parsed.success) return parsed.data;

  return {
    success: false,
    error: "Please check the highlighted fields.",
    fieldErrors: parsed.error.flatten().fieldErrors,
  };
}

const isActionResult = (v: ActionResult<never> | JobFormValues): v is ActionResult<never> =>
  "success" in v;

/* -------------------------------------------------------------------------- */
/*                                   Reads                                    */
/* -------------------------------------------------------------------------- */

const getJobs = withDatabase(
  "getJobs",
  async ({
    searchQuery,
    filter,
    page = 1,
    pageSize = JOBS_PAGE_SIZE,
  }: GetJobsParams): Promise<{ jobs: JobDTO[]; isNext: boolean }> => {
    const skipAmount = (page - 1) * pageSize;
    const { query: filterQuery, sort } = buildFilter(filter);

    const query: QueryFilter<IJob> = { status: "open", ...filterQuery };

    if (searchQuery) {
      const regex = toSearchRegex(searchQuery);
      query.$or = [
        { title: { $regex: regex } },
        { "company.name": { $regex: regex } },
        { skills: { $regex: regex } },
        { "location.country": { $regex: regex } },
        { "location.city": { $regex: regex } },
      ];
    }

    const [totalJobs, jobs] = await Promise.all([
      Job.countDocuments(query),
      Job.find(query)
        .sort(sort)
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: "postedBy", model: User, select: AUTHOR_FIELDS })
        .lean<PopulatedJob[]>(),
    ]);

    return {
      jobs: jobs.map(toJobDTO),
      isNext: totalJobs > skipAmount + jobs.length,
    };
  },
);

const getJobById = withDatabase(
  "getJobById",
  async ({ jobId }: GetJobByIdParams): Promise<JobDTO | null> => {
    // ID tidak valid → anggap tidak ditemukan (hindari CastError)
    if (!isObjectIdOrHexString(jobId)) return null;

    const job = await Job.findById(jobId)
      .populate({ path: "postedBy", model: User, select: AUTHOR_FIELDS })
      .lean<PopulatedJob>();

    return job ? toJobDTO(job) : null;
  },
);

/* -------------------------------------------------------------------------- */
/*                                 Mutations                                  */
/* -------------------------------------------------------------------------- */

const createJob = withDatabase(
  "createJob",
  async (input: JobFormInput): Promise<ActionResult<{ id: string }>> => {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "You must be signed in to post a job." };

    const values = parseJobInput(input);
    if (isActionResult(values)) return values;

    const job = await Job.create({ ...toJobDocument(values), postedBy: userId });

    revalidatePath("/jobs");

    return { success: true, data: { id: String(job._id) } };
  },
);

const updateJob = withDatabase(
  "updateJob",
  async ({
    jobId,
    input,
  }: {
    jobId: string;
    input: JobFormInput;
  }): Promise<ActionResult<{ id: string }>> => {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "You must be signed in." };

    if (!isObjectIdOrHexString(jobId)) return { success: false, error: "Job not found." };

    const job = await Job.findById(jobId);
    if (!job) return { success: false, error: "Job not found." };
    if (!job.postedBy.equals(userId)) {
      return { success: false, error: "You can only edit your own job posts." };
    }

    const values = parseJobInput(input);
    if (isActionResult(values)) return values;

    // .set() + .save(): field yang dikosongkan (undefined) ikut terhapus dari dokumen
    job.set(toJobDocument(values));
    await job.save();

    revalidatePath("/jobs");
    revalidatePath(`/jobs/${jobId}`);

    return { success: true, data: { id: jobId } };
  },
);

const deleteJob = withDatabase(
  "deleteJob",
  async ({ jobId }: DeleteJobParams): Promise<ActionResult> => {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: "You must be signed in." };

    if (!isObjectIdOrHexString(jobId)) return { success: false, error: "Job not found." };

    // Filter postedBy sekaligus = cek kepemilikan dalam 1 query
    const deleted = await Job.findOneAndDelete({ _id: jobId, postedBy: userId });
    if (!deleted) {
      return { success: false, error: "Job not found or you are not the owner." };
    }

    revalidatePath("/jobs");

    return { success: true, data: undefined };
  },
);

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export { createJob, deleteJob, getJobById, getJobs, updateJob };
