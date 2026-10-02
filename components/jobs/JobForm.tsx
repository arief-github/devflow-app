"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, type FieldPath } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CURRENCIES,
  EMPLOYMENT_TYPE_LABEL,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVEL_LABEL,
  EXPERIENCE_LEVELS,
  SALARY_PERIOD_LABEL,
  SALARY_PERIODS,
} from "@/constants/jobs";
import { createJob, updateJob } from "@/lib/actions/job.action";
import {
  EMPTY_JOB_FORM,
  JobSchema,
  type JobFormInput,
  type JobFormValues,
} from "@/lib/job-validation";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const FIELD_CLASS =
  "no-focus paragraph-regular light-border-2 background-light700_dark300 text-dark300_light700 min-h-[56px] border";

type TextFieldName = Extract<
  FieldPath<JobFormInput>,
  | "title"
  | "companyName"
  | "companyLogo"
  | "companyWebsite"
  | "country"
  | "city"
  | "salaryMin"
  | "salaryMax"
  | "skills"
  | "applyUrl"
>;

type TextFieldConfig = {
  name: TextFieldName;
  label: string;
  placeholder: string;
  required?: boolean;
  inputMode?: "text" | "numeric" | "url";
  description?: string;
};

const SECTIONS: { title: string; fields: TextFieldConfig[] }[] = [
  {
    title: "Position",
    fields: [
      { name: "title", label: "Job title", placeholder: "Senior Frontend Engineer", required: true },
    ],
  },
  {
    title: "Company",
    fields: [
      { name: "companyName", label: "Company name", placeholder: "Acme Inc.", required: true },
      { name: "companyWebsite", label: "Website", placeholder: "https://acme.com", inputMode: "url" },
      {
        name: "companyLogo",
        label: "Logo URL",
        placeholder: "https://acme.com/logo.png",
        inputMode: "url",
      },
    ],
  },
  {
    title: "Location",
    fields: [
      { name: "country", label: "Country", placeholder: "Indonesia", required: true },
      { name: "city", label: "City", placeholder: "Jakarta" },
    ],
  },
];

const isFieldName = (key: string): key is FieldPath<JobFormInput> => key in EMPTY_JOB_FORM;

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

type Props =
  | { mode: "create"; jobId?: never; defaultValues?: never }
  | { mode: "edit"; jobId: string; defaultValues: JobFormInput };

export default function JobForm({ mode, jobId, defaultValues }: Props) {
  const router = useRouter();

  const form = useForm<JobFormInput, unknown, JobFormValues>({
    resolver: zodResolver(JobSchema),
    defaultValues: defaultValues ?? EMPTY_JOB_FORM,
  });

  const { isSubmitting, isDirty, errors } = form.formState;

  // Validasi client sudah lolos. Yang dikirim tetap nilai MENTAH,
  // karena server action memvalidasi ulang dengan schema yang sama.
  const onSubmit = async () => {
    const input = form.getValues();

    const result =
      mode === "edit" ? await updateJob({ jobId, input }) : await createJob(input);

    if (!result.success) {
      Object.entries(result.fieldErrors ?? {}).forEach(([key, messages]) => {
        if (isFieldName(key) && messages?.[0]) {
          form.setError(key, { message: messages[0] });
        }
      });
      form.setError("root", { message: result.error });
      return;
    }

    router.push(`/jobs/${result.data.id}`);
  };

  const renderTextField = ({
    name,
    label,
    placeholder,
    required,
    inputMode,
    description,
  }: TextFieldConfig) => (
    <FormField
      key={name}
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1 space-y-3.5">
          <FormLabel className="paragraph-semibold text-dark400_light800">
            {label}
            {required && <span className="text-primary-500"> *</span>}
          </FormLabel>
          <FormControl>
            <Input
              inputMode={inputMode}
              placeholder={placeholder}
              className={FIELD_CLASS}
              {...field}
            />
          </FormControl>
          {description && (
            <FormDescription className="body-regular text-light-500">{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-9 flex w-full flex-col gap-10">
        {SECTIONS.map((section) => (
          <fieldset key={section.title} className="flex flex-col gap-6">
            <legend className="h3-semibold text-dark200_light900 mb-6">{section.title}</legend>
            <div className="flex flex-col gap-6 md:flex-row">
              {section.fields.map(renderTextField)}
            </div>
          </fieldset>
        ))}

        {/* Remote */}
        <FormField
          control={form.control}
          name="isRemote"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  name={field.name}
                  className="size-5 accent-primary-500"
                />
              </FormControl>
              <FormLabel className="paragraph-medium text-dark400_light800 !mt-0">
                Remote friendly
              </FormLabel>
            </FormItem>
          )}
        />

        {/* Type & level */}
        <fieldset className="flex flex-col gap-6">
          <legend className="h3-semibold text-dark200_light900 mb-6">Details</legend>
          <div className="flex flex-col gap-6 md:flex-row">
            <FormField
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-3.5">
                  <FormLabel className="paragraph-semibold text-dark400_light800">
                    Employment type <span className="text-primary-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={FIELD_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {EMPLOYMENT_TYPE_LABEL[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-3.5">
                  <FormLabel className="paragraph-semibold text-dark400_light800">
                    Experience level
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={FIELD_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not specified</SelectItem>
                      {EXPERIENCE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {EXPERIENCE_LEVEL_LABEL[level]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {/* Salary */}
        <fieldset className="flex flex-col gap-6">
          <legend className="h3-semibold text-dark200_light900 mb-2">Salary</legend>
          <p className="body-regular text-light-500">Optional. Leave empty to hide salary.</p>
          <div className="flex flex-col gap-6 md:flex-row">
            {renderTextField({
              name: "salaryMin",
              label: "Minimum",
              placeholder: "10000000",
              inputMode: "numeric",
            })}
            {renderTextField({
              name: "salaryMax",
              label: "Maximum",
              placeholder: "20000000",
              inputMode: "numeric",
            })}

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="space-y-3.5 md:w-32">
                  <FormLabel className="paragraph-semibold text-dark400_light800">Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={FIELD_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salaryPeriod"
              render={({ field }) => (
                <FormItem className="space-y-3.5 md:w-36">
                  <FormLabel className="paragraph-semibold text-dark400_light800">Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className={FIELD_CLASS}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SALARY_PERIODS.map((period) => (
                        <SelectItem key={period} value={period}>
                          {SALARY_PERIOD_LABEL[period]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {renderTextField({
          name: "skills",
          label: "Skills",
          placeholder: "react, typescript, next.js",
          description: "Separate with commas. Max 10 skills.",
        })}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="space-y-3.5">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Job description <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Responsibilities, requirements, benefits..."
                  className={`${FIELD_CLASS} min-h-[240px]`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {renderTextField({
          name: "applyUrl",
          label: "How to apply",
          placeholder: "https://acme.com/careers/123 or mailto:hr@acme.com",
          required: true,
          inputMode: "url",
        })}

        {errors.root && <p className="text-sm text-red-500">{errors.root.message}</p>}

        <div className="flex justify-end">
          <Button
            type="submit"
            className="primary-gradient w-fit min-h-[46px] px-6 !text-light-900"
            disabled={isSubmitting || (mode === "edit" && !isDirty)}
          >
            {isSubmitting
              ? mode === "edit"
                ? "Saving..."
                : "Posting..."
              : mode === "edit"
                ? "Save changes"
                : "Post job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
