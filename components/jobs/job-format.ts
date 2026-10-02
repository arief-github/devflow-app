import { SALARY_PERIOD_LABEL } from "@/constants/jobs";
import type { JobDTO } from "@/lib/types/job.types";

export function formatSalary({ min, max, currency, period }: JobDTO["salary"]): string | null {
  if (min === undefined && max === undefined) return null;

  const fmt = new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    notation: "compact",
  });

  const range =
    min !== undefined && max !== undefined
      ? min === max
        ? fmt.format(min)
        : `${fmt.format(min)} – ${fmt.format(max)}`
      : min !== undefined
        ? `From ${fmt.format(min)}`
        : `Up to ${fmt.format(max ?? 0)}`;

  return `${range} ${SALARY_PERIOD_LABEL[period]}`;
}

export function formatLocation({ location, isRemote }: Pick<JobDTO, "location" | "isRemote">) {
  const place = [location.city, location.country].filter(Boolean).join(", ");
  return isRemote ? `${place} · Remote` : place;
}

export function formatPostedDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}
