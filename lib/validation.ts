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

const AnswerformSchema = z.object({
  answer: z
    .string()
    .min(100, { message: "Answer must be at least 100 characters long." }),
});

const ProfileSchema = z.object({
  name: z.string().min(5).max(50),
  username: z.string().min(5).max(50),
  bio: z.string().min(10).max(150),
  portfolioWebsite: z.string().url(),
  location: z.string().min(5).max(50),
});

export { QuestionformSchema, AnswerformSchema, ProfileSchema };
