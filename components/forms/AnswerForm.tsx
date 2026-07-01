"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useRef,
  useState,
  useCallback,
  type FormEvent,
} from "react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "../ui/button";
import Image from "next/image";
import { createAnswer } from "@/lib/actions/answer.action";
import { AnswerformSchema } from "@/lib/validation";
import { usePathname } from "next/navigation";

interface Props {
  question: string;
  questionId: string;
  authorId: string;
}

// Properly type the Editor
interface EditorInstance {
  setContent: (content: string) => void;
}

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="w-full animate-pulse rounded-md bg-light-700 dark:bg-dark-300" style={{ height: 300 }} />
    ),
  },
);

const AnswerForm = ({ questionId, authorId }: Props) => {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const editorRef = useRef<EditorInstance | null>(null);
  const form = useForm<z.infer<typeof AnswerformSchema>>({
    resolver: zodResolver(AnswerformSchema),
    defaultValues: {
      answer: "",
    },
  });

  // Use useCallback to handle ref assignment safely
  const handleEditorInit = useCallback(
    (_evt: unknown, editor: EditorInstance) => {
      editorRef.current = editor;
    },
    [],
  );

  const handleCreateAnswer = useCallback(
    async (values: z.infer<typeof AnswerformSchema>) => {
      setIsSubmitting(true);

      try {
        await createAnswer({
          content: values.answer,
          author: JSON.parse(authorId),
          question: JSON.parse(questionId),
          path: pathname,
        });

        form.reset();

        if (editorRef.current) {
          const editor = editorRef.current as EditorInstance;

          editor.setContent("");
        }
      } catch (error) {
        console.error("Error creating answer:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [authorId, form, pathname, questionId],
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      void form.handleSubmit(handleCreateAnswer)(event);
    },
    [form, handleCreateAnswer],
  );

  return (
    <div className="mt-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <h4 className="paragraph-semibold text-dark400_light800">
          Write your answer here
        </h4>

        <Button
          disabled
          className="btn light-border-2 gap-1.5 rounded-md px-4 py-2.5 text-primary-500 shadow-none dark:text-primary-500"
          onClick={() => {}}
        >
          <Image
            src="/icons/stars.svg"
            alt="star"
            width={12}
            height={12}
            className="object-contain"
          />
          Generate an AI Answer (Coming Soon)
        </Button>
      </div>

      <Form {...form}>
        <form className="mt-6 flex w-full flex-col gap-10" onSubmit={onSubmit}>
          <FormField
            control={form.control}
            name="answer"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                      onInit={handleEditorInit}
                      onBlur={field.onBlur}
                      onEditorChange={(content) => field.onChange(content)}
                      init={{
                        height: 300,
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
                        skin: theme === "dark" ? "oxide-dark" : "oxide",
                        content_css: theme === "dark" ? "dark" : "light",
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              className="primary-gradient w-fit text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AnswerForm;
