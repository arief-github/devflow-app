"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateAnswerParams,
  GetAnswersParams,
  IAnswerDetail,
} from "../types/sharedtypes";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";

export async function createAnswer(params: CreateAnswerParams) {
  try {
    connectToDatabase();

    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // add the answer to the question's answers array
    await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    // TODO! add interaction..

    revalidatePath(path);
  } catch (error) {
    console.error("Error creating answer:", error);
    throw new Error("Failed to create answer");
  }
}

export async function getAnswers(
  params: GetAnswersParams,
): Promise<{ answers: IAnswerDetail[] } | null> {
  try {
    connectToDatabase();

    const answers = await Answer.find({ question: params.questionId })
      .populate("author", "_id clerkId name picture")
      .sort({ createdAt: -1 });

    return { answers };
  } catch (error) {
    console.error("Error fetching answers:", error);
    throw new Error("Failed to fetch answers");
  }
}
