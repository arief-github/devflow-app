"use server";

import Answer from "@/database/answer.model";
import {
  AnswerVoteParams,
  CreateAnswerParams,
  DeleteAnswerParams,
  GetAnswersParams,
  IAnswerDetail,
} from "../types/sharedtypes";
import Question from "@/database/question.model";
import { revalidatePath } from "next/cache";
import { voteFunction } from "../helpers/vote";
import Interaction from "@/database/interaction.model";
import User from "@/database/user.model";
import { withDatabase } from "./with-database";

/* -------------------------------------------------------------------------- */
/*                                  Actions                                   */
/* -------------------------------------------------------------------------- */

const createAnswer = withDatabase(
  "createAnswer",
  async (params: CreateAnswerParams) => {
    const { content, author, question, path } = params;

    const newAnswer = await Answer.create({
      content,
      author,
      question,
    });

    // add the answer to the question's answers array
    const questionObject = await Question.findByIdAndUpdate(question, {
      $push: { answers: newAnswer._id },
    });

    await Interaction.create({
      user: author,
      action: "answer",
      question,
      answer: newAnswer._id,
      tags: questionObject.tags,
    });

    await User.findByIdAndUpdate(author, { $inc: { reputation: 10 } });

    revalidatePath(path);
  },
  { errorMessage: "Failed to create answer" },
);

const getAnswers = withDatabase(
  "getAnswers",
  async (
    params: GetAnswersParams,
  ): Promise<{ answers: IAnswerDetail[]; isNextAnswer: boolean } | null> => {
    const { questionId, sortBy, page = 1, pageSize = 2 } = params;
    const skipAmount = (page - 1) * pageSize;

    let sortOptions = {};

    switch (sortBy) {
      case "highestUpvotes":
        sortOptions = { upvotes: -1 };
        break;
      case "lowestUpvotes":
        sortOptions = { upvotes: 1 };
        break;
      case "recent":
        sortOptions = { createdAt: -1 };
        break;
      case "old":
        sortOptions = { createdAt: 1 };
        break;

      default:
        break;
    }

    const answers = await Answer.find({ question: questionId })
      .populate("author", "_id clerkId name picture")
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalAnswer = await Answer.countDocuments({ question: questionId });
    const isNextAnswer = totalAnswer > skipAmount + answers.length;

    return { answers, isNextAnswer };
  },
  { errorMessage: "Failed to fetch answers" },
);

const voteAnswer = withDatabase(
  "voteAnswer",
  async (params: AnswerVoteParams, voteType: "upvote" | "downvote") => {
    const { answerId, userId, hasupVoted, hasdownVoted, path } = params;

    const answer = await Answer.findById(answerId).select("author");
    if (!answer) throw new Error("Answer not found");

    await voteFunction({
      model: Answer,
      id: answerId,
      authorId: String(answer.author),
      userId,
      hasupVoted,
      hasdownVoted,
      voteType,
      path,
      entityName: "Answer",
    });
  },
);

async function upvoteAnswer(params: AnswerVoteParams) {
  return voteAnswer(params, "upvote");
}

async function downvoteAnswer(params: AnswerVoteParams) {
  return voteAnswer(params, "downvote");
}

const deleteAnswer = withDatabase(
  "deleteAnswer",
  async (params: DeleteAnswerParams) => {
    const { answerId, path } = params;

    const answer = await Answer.findById(answerId);

    if (!answer) {
      throw new Error("Answer not found");
    }

    await answer.deleteOne({ _id: answerId });
    await Question.updateMany(
      { _id: answer.question },
      { $pull: { answers: answerId } },
    );
    await Interaction.deleteMany({ answer: answerId });

    revalidatePath(path);
  },
  { errorMessage: "Failed to delete answer" },
);

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  createAnswer,
  deleteAnswer,
  downvoteAnswer,
  getAnswers,
  upvoteAnswer,
  voteAnswer,
};
