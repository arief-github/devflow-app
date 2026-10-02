import { z } from "zod";

import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_PERIODS,
} from "@/constants/jobs";
import type { JobDTO } from "@/lib/types/job.types";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

/**
 * Hanya izinkan protokol tertentu.
 * PENTING: tanpa ini, user bisa mengisi `javascript:alert(1)` sebagai applyUrl,
 * dan script tersebut jalan saat orang lain mengklik tombol "Apply".
 */
const hasProtocol = (value: string, protocols: string[]) => {
  try {
    return protocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** Teks opsional: "" → undefined */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} characters`)
    .transform((v) => (v === "" ? undefined : v));

/** URL https opsional: "" → undefined */
const optionalHttpsUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || hasProtocol(v, ["https:"]), "Must be a valid https:// URL")
  .transform((v) => (v === "" ? undefined : v));

/** Angka opsional dari input text: "" → undefined, "5000000" → 5000000 */
const optionalAmount = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d{1,12}$/.test(v), "Numbers only")
  .transform((v) => (v === "" ? undefined : Number(v)));

/** "React, Next.js, react" → ["react", "next.js"] */
const skillList = z
  .string()
  .transform((v) => [
    ...new Set(
      v
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  ])
  .refine((list) => list.length <= 10, "Maximum 10 skills")
  .refine((list) => list.every((s) => s.length <= 30), "Each skill max 30 characters");

/* -------------------------------------------------------------------------- */
/*                                   Schema                                   */
/* -------------------------------------------------------------------------- */

export const JobSchema = z
  .object({
    title: z.string().trim().min(5, "Minimum 5 characters").max(120),
    companyName: z.string().trim().min(2, "Minimum 2 characters").max(80),
    companyLogo: optionalHttpsUrl,
    companyWebsite: optionalHttpsUrl,

    country: z.string().trim().min(2, "Minimum 2 characters").max(60),
    city: optionalText(60),
    isRemote: z.boolean(),

    employmentType: z.enum(EMPLOYMENT_TYPES),
    experienceLevel: z
      .union([z.enum(EXPERIENCE_LEVELS), z.literal("none")])
      .transform((v) => (v === "none" ? undefined : v)),

    salaryMin: optionalAmount,
    salaryMax: optionalAmount,
    currency: z.enum(CURRENCIES),
    salaryPeriod: z.enum(SALARY_PERIODS),

    skills: skillList,
    description: z
      .string()
      .trim()
      .min(50, "Minimum 50 characters")
      .max(5000, "Maximum 5000 characters"),
    applyUrl: z
      .string()
      .trim()
      .refine(
        (v) => hasProtocol(v, ["https:", "mailto:"]),
        "Must start with https:// or mailto:",
      ),
  })
  .refine(
    (d) => d.salaryMin === undefined || d.salaryMax === undefined || d.salaryMin <= d.salaryMax,
    { path: ["salaryMax"], message: "Must be greater than or equal to minimum salary" },
  );

/** State di form (semua input berupa string/boolean) */
export type JobFormInput = z.input<typeof JobSchema>;
/** Hasil validasi (angka, array skills, undefined untuk field kosong) */
export type JobFormValues = z.output<typeof JobSchema>;

export const EMPTY_JOB_FORM: JobFormInput = {
  title: "",
  companyName: "",
  companyLogo: "",
  companyWebsite: "",
  country: "",
  city: "",
  isRemote: false,
  employmentType: "full_time",
  experienceLevel: "none",
  salaryMin: "",
  salaryMax: "",
  currency: "IDR",
  salaryPeriod: "month",
  skills: "",
  description: "",
  applyUrl: "",
};

/** Data Job yang sudah ada → nilai awal form edit */
export function jobToFormInput(job: JobDTO): JobFormInput {
  return {
    title: job.title,
    companyName: job.company.name,
    companyLogo: job.company.logo ?? "",
    companyWebsite: job.company.website ?? "",
    country: job.location.country,
    city: job.location.city ?? "",
    isRemote: job.isRemote,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel ?? "none",
    salaryMin: job.salary.min?.toString() ?? "",
    salaryMax: job.salary.max?.toString() ?? "",
    currency: job.salary.currency,
    salaryPeriod: job.salary.period,
    skills: job.skills.join(", "),
    description: job.description,
    applyUrl: job.applyUrl,
  };
}
