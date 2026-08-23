"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { QuestionformSchema } from "@/lib/validation";
import Image from "next/image";
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
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { usePathname, useRouter } from "next/navigation";

type QuestionFormType = "create" | "edit";

type QuestionFormProps = {
  mode?: QuestionFormType;
  mongoUserId: string;
  tagSuggestions?: Array<{ _id: string; name: string }>;
  questionDetails?: {
    _id: string | null;
    title: string;
    explanation: string;
    tags: Array<{ _id: string; name: string }>;
  };
};

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full animate-pulse rounded-md bg-light-700 dark:bg-dark-300"
        style={{ height: 350 }}
      />
    ),
  },
);

const QuestionForm = ({
  mode = "create",
  mongoUserId,
  tagSuggestions,
  questionDetails,
}: QuestionFormProps) => {
  const editorRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const parsedQuestionDetails = questionDetails ?? null;

  const groupedTags =
    parsedQuestionDetails?.tags.map((tag: { name: string }) => tag.name) || [];

  const form = useForm<z.infer<typeof QuestionformSchema>>({
    resolver: zodResolver(QuestionformSchema),
    defaultValues: {
      title: parsedQuestionDetails?.title || "",
      explanation: parsedQuestionDetails?.explanation || "",
      tags: groupedTags || [],
    },
  });

  async function onSubmit(values: z.infer<typeof QuestionformSchema>) {
    setIsSubmitting(true);

    try {
      if (mode === "edit") {
        await editQuestion({
          questionId: parsedQuestionDetails?._id ?? "",
          title: values.title,
          content: values.explanation,
          path: pathname,
        });
      } else {
        await createQuestion({
          title: values.title,
          content: values.explanation,
          tags: values.tags,
          author: mongoUserId, // why it's got nulled ?
          path: pathname,
        });
      }

      // navigate to home page
      router.push("/");
    } catch (error) {
      console.error("Error submitting question:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    field: ControllerRenderProps<z.infer<typeof QuestionformSchema>>,
  ) => {
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault();

      const tagInput = e.target as HTMLInputElement;
      const tagValue = tagInput.value.trim();

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tag must be less than 15 characters.",
          });
        }

        if (!field.value.includes(tagValue as never)) {
          form.setValue("tags", [...field.value, tagValue]);
          tagInput.value = "";
          form.clearErrors("tags");
        }
      } else {
        form.trigger();
      }
    }
  };

  const handleTagRemove = (
    tag: string,
    field: ControllerRenderProps<z.infer<typeof QuestionformSchema>>,
  ) => {
    if (Array.isArray(field.value)) {
      const newTags = field.value.filter((t: string) => t !== tag);

      form.setValue("tags", newTags);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-10"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Question Title <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Input
                    className="no-focus paragraph-regular background-light900_dark300! light-border-2 text-dark300_light700 min-h-14 border"
                    placeholder="Input your title"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Be specific and imagine you&apos;re asking a question to
                  another person
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          {/* Rich Text */}
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Detailed explanation of your problem{" "}
                  <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <Editor
                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                    onInit={(evt, editor) => {
                      // @ts-expect-error-of-current
                      editorRef.current = editor;
                    }}
                    onBlur={field.onBlur}
                    onEditorChange={(content) => field.onChange(content)}
                    initialValue={parsedQuestionDetails?.explanation || ""}
                    init={{
                      height: 350,
                      menubar: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "image",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "codesample",
                        "fullscreen",
                        "insertdatetime",
                        "media",
                        "table",
                      ],
                      toolbar:
                        "undo redo | " +
                        "codesample | bold italic forecolor | alignleft aligncenter |" +
                        "alignright alignjustify | bullist numlist",
                      content_style:
                        "body { font-family:Inter; font-size:16px }",
                    }}
                  />
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Introduce the problem and expand on what you put in the title.
                  Minimum 20 characters.
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">
                  Tags <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl className="mt-3.5">
                  <>
                    <datalist id="tag-suggestions">
                      {tagSuggestions?.map((tag) => (
                        <option key={tag._id} value={tag.name} />
                      ))}
                    </datalist>

                    <Input
                      className="no-focus paragraph-regular background-light900_dark300! light-border-2 text-dark300_light700 min-h-14 border"
                      placeholder="Add Tags..."
                      list="tag-suggestions"
                      onKeyDown={(e) => handleInputKeyDown(e, field)}
                    />
                    {field.value.length > 0 && (
                      <div className="flex-start mt-2.5 gap-2.5">
                        {field.value.map((tag: string) => (
                          <Badge
                            key={tag}
                            onClick={() => handleTagRemove(tag, field)}
                            className="subtle-medium background-light800_dark300 text-light400_dark500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize"
                          >
                            {tag}
                            <Image
                              src="/icons/close.svg"
                              alt="Close"
                              width={12}
                              height={12}
                              className="cursor-pointer"
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </>
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Add up to 3 tags to describe what your question is about. You
                  need to press enter to add a tag.
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="primary-gradient w-fit text-light-900!"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>{mode === "edit" ? "Editing..." : "Posting..."}</>
            ) : (
              <>{mode === "edit" ? "Edit Question" : "Ask a Question"}</>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default QuestionForm;
