import { model, models, Schema, type Model, type Types } from "mongoose";

import {
  CURRENCIES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  JOB_STATUSES,
  SALARY_PERIODS,
  type Currency,
  type EmploymentType,
  type ExperienceLevel,
  type JobStatus,
  type SalaryPeriod,
} from "@/constants/jobs";

export interface IJob {
  _id: Types.ObjectId;
  title: string;
  description: string;
  /** Di-embed: data perusahaan hanya relevan untuk lowongan ini */
  company: {
    name: string;
    logo?: string;
    website?: string;
  };
  location: {
    country: string;
    city?: string;
  };
  isRemote: boolean;
  employmentType: EmploymentType;
  experienceLevel?: ExperienceLevel;
  salary: {
    min?: number;
    max?: number;
    currency: Currency;
    period: SalaryPeriod;
  };
  /** Disimpan sebagai string (lowercase), BUKAN referensi ke Tag */
  skills: string[];
  applyUrl: string;
  status: JobStatus;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 5000 },

    company: {
      name: { type: String, required: true, trim: true, maxlength: 80 },
      logo: { type: String },
      website: { type: String },
    },

    location: {
      country: { type: String, required: true, trim: true },
      city: { type: String, trim: true },
    },
    isRemote: { type: Boolean, default: false },

    employmentType: { type: String, enum: EMPLOYMENT_TYPES, required: true },
    experienceLevel: { type: String, enum: EXPERIENCE_LEVELS },

    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, enum: CURRENCIES, default: "IDR" },
      period: { type: String, enum: SALARY_PERIODS, default: "month" },
    },

    skills: { type: [String], default: [] },
    applyUrl: { type: String, required: true },

    status: { type: String, enum: JOB_STATUSES, default: "open" },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

/* -------------------------------------------------------------------------- */
/*            Index — disesuaikan dengan query di job.action.ts               */
/* -------------------------------------------------------------------------- */

// Daftar lowongan default: status open, urut terbaru
JobSchema.index({ status: 1, createdAt: -1 });
// Filter tipe pekerjaan & remote
JobSchema.index({ status: 1, employmentType: 1, createdAt: -1 });
JobSchema.index({ status: 1, isRemote: 1, createdAt: -1 });
// Sort "Highest Salary"
JobSchema.index({ status: 1, "salary.max": -1 });
// Lowongan milik seorang user
JobSchema.index({ postedBy: 1, createdAt: -1 });

const Job: Model<IJob> = models.Job ?? model<IJob>("Job", JobSchema);

export default Job;
