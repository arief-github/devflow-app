export interface SidebarLink {
  imgURL: string;
  route: string;
  label: string;
}

export interface Job {
  id?: string;
  employer_name?: string;
  employer_logo?: string | undefined;
  employer_website?: string;
  job_employment_type?: string;
  job_title?: string;
  job_description?: string;
  job_apply_link?: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
}

export interface Country {
  params: { id: string };
}

export interface ParamsProps {
  params: { id: string };
}

export interface SearchParamsProps {
  searchParams: { [key: string]: string | undefined };
}

export interface URLProps {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export type BadgeLevel = "BRONZE" | "SILVER" | "GOLD";

export type BadgeCriteriaType =
  | "QUESTION_COUNT"
  | "ANSWER_COUNT"
  | "QUESTION_UPVOTES"
  | "ANSWER_UPVOTES"
  | "TOTAL_VIEWS";

export type BadgeCounts = Record<BadgeLevel, number>;
export type BadgeThresholds = Readonly<Record<BadgeLevel, number>>;

export type BadgeCriteria = Readonly<
  Record<BadgeCriteriaType, BadgeThresholds>
>;

export type BadgeCriterion = {
  type: BadgeCriteriaType;
  count: number;
};

export interface BadgeParam {
  criteria: readonly BadgeCriterion[];
}
