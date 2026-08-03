"use server";

import Answer from "@/database/answer.model";
import { connectToDatabase } from "../mongoose";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  GetAnswersParams,
  IAnswerDetail,
} from "../types/sharedtypes";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import { voteFunction } from "../helpers/vote";

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

export async function voteAnswer(
  params: AnswerVoteParams,
  voteType: "upvote" | "downvote",
) {
  try {
    connectToDatabase();

    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    await voteFunction({
      model: Answer,
      id: answerId,
      userId,
      hasupVoted,
      hasdownVoted,
      voteType,
      path,
      entityName: "Answer",
    });
  } catch (error) {
    console.error(`Error occurred while ${voteType}ing answer:`, error);
    throw error;
  }
}

export async function upvoteAnswer(params: AnswerVoteParams) {
  return voteAnswer(params, "upvote");
}

export async function downvoteAnswer(params: AnswerVoteParams) {
  return voteAnswer(params, "downvote");
}
