/* -------------------------------------------------------------------------- */
/*            Nilai enum Job — dipakai model, validasi, dan UI                */
/*            (file ini aman di-import dari client maupun server)             */
/* -------------------------------------------------------------------------- */

export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
  "internship",
  "freelance",
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EXPERIENCE_LEVELS = ["junior", "mid", "senior", "lead"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const CURRENCIES = ["IDR", "USD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const SALARY_PERIODS = ["month", "year"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

export const JOB_STATUSES = ["open", "closed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

/* -------------------------------------------------------------------------- */
/*                                   Label                                    */
/* -------------------------------------------------------------------------- */

export const EMPLOYMENT_TYPE_LABEL: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

export const EXPERIENCE_LEVEL_LABEL: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
};

export const SALARY_PERIOD_LABEL: Record<SalaryPeriod, string> = {
  month: "/ month",
  year: "/ year",
};

/* -------------------------------------------------------------------------- */
/*                Filter di halaman /jobs (format komponen Filter)            */
/* -------------------------------------------------------------------------- */

export const JOB_FILTERS = [
  { name: "Newest", value: "newest" },
  { name: "Highest Salary", value: "highest_salary" },
  { name: "Remote", value: "remote" },
  ...EMPLOYMENT_TYPES.map((type) => ({
    name: EMPLOYMENT_TYPE_LABEL[type],
    value: type,
  })),
];

export const JOBS_PAGE_SIZE = 10;
