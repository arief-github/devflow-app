import type {
  Currency,
  EmploymentType,
  ExperienceLevel,
  JobStatus,
  SalaryPeriod,
} from "@/constants/jobs";

/**
 * Bentuk data Job yang dikirim ke page & client component.
 * Semua ObjectId & Date sudah jadi string → aman diserialisasi.
 */
export type JobDTO = {
  id: string;
  title: string;
  description: string;
  company: { name: string; logo?: string; website?: string };
  location: { country: string; city?: string };
  isRemote: boolean;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salary: { min?: number; max?: number; currency: Currency; period: SalaryPeriod };
  skills: string[];
  applyUrl: string;
  status: JobStatus;
  postedBy: { id: string; clerkId: string; name: string; picture: string };
  createdAt: string;
};

export type GetJobsParams = {
  searchQuery?: string;
  filter?: string;
  page?: number;
  pageSize?: number;
};

export type GetJobByIdParams = { jobId: string };
export type DeleteJobParams = { jobId: string };

/**
 * Hasil mutasi. Error dikembalikan sebagai nilai (bukan di-throw),
 * karena Next.js menyembunyikan pesan error yang di-throw dari server action
 * di mode production — user tidak akan pernah melihat pesannya.
 */
export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
