"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateQuestionParams,
  GetQuestionsParams,
  GetQuestionByIdParams,
  IQuestionDetail,
  QuestionVoteParams,
} from "../types/sharedtypes";
import Tag from "@/database/tag.model";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const questions = await Question.find({})
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .sort({ createdAt: -1 });

    return { questions };
  } catch (error) {
    throw error;
  }
}

export async function getQuestionById(
  params: GetQuestionByIdParams,
): Promise<{ question: IQuestionDetail | null }> {
  try {
    connectToDatabase();

    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      })
      .lean<IQuestionDetail>();

    return { question };
  } catch (error) {
    console.error("Error fetching question by ID:", error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    await connectToDatabase();

    const { title, content, tags, author, path } = params;

    const question = await Question.create({
      title,
      author,
      content,
    });

    const tagDocuments = [];

    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { upsert: true, new: true },
      );
      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // TODO: Create an interaction record for the user's ask_question action

    // TODO: Increment author's reputation by +5 for creating a question
    revalidatePath(path);
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw new Error("Failed to connect to database");
  }
}

type VoteType = "upvote" | "downvote";

export async function voteQuestion(
  params: QuestionVoteParams,
  voteType: VoteType,
) {
  try {
    connectToDatabase();

    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    const isUpvote = voteType === "upvote";

    const targetField = isUpvote ? "upvotes" : "downvotes";
    const oppositeField = isUpvote ? "downvotes" : "upvotes";

    const hasVotedOnTarget = isUpvote ? hasupVoted : hasdownVoted;
    const hasVotedOnOpposite = isUpvote ? hasdownVoted : hasupVoted;

    let updateQuery = {};

    if (hasVotedOnTarget) {
      updateQuery = { $pull: { [targetField]: userId } };
    } else if (hasVotedOnOpposite) {
      updateQuery = {
        $pull: { [oppositeField]: userId },
        $push: { [targetField]: userId },
      };
    } else {
      updateQuery = { $addToSet: { [targetField]: userId } };
    }

    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });

    if (!question) {
      throw new Error("Question not found");
    }

    revalidatePath(path);
  } catch (error) {
    console.error(`Error occurred while ${voteType}ing question:`, error);
    throw error;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  return voteQuestion(params, "upvote");
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  return voteQuestion(params, "downvote");
}
