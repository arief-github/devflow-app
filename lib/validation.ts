import * as z from "zod";

const QuestionformSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 2 characters long." })
    .max(130),
  explanation: z
    .string()
    .min(100, { message: "Explanation must be at least 100 characters long." }),
  tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

export { QuestionformSchema };
