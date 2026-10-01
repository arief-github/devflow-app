"use server";

import Question from "@/database/question.model";
import {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  IQuestionDetail,
  QuestionVoteParams,
  VoteType,
} from "../types/sharedtypes";
import Tag from "@/database/tag.model";
import { revalidatePath } from "next/cache";
import User from "@/database/user.model";
import { voteFunction } from "../helpers/vote";
import Interaction from "@/database/interaction.model";
import Answer from "@/database/answer.model";
import { QueryFilter } from "mongoose";
import { withDatabase } from "./with-database";

/* -------------------------------------------------------------------------- */
/*                                  Actions                                   */
/* -------------------------------------------------------------------------- */

const getQuestions = withDatabase(
  "getQuestions",
  async (params: GetQuestionsParams) => {
    const { searchQuery, filter, page = 1, pageSize = 5 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: QueryFilter<typeof Question> = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalQuestions = await Question.countDocuments(query);

    const isNext = totalQuestions > skipAmount + pageSize;

    return { questions, isNext };
  },
);

const getQuestionById = withDatabase(
  "getQuestionById",
  async (
    params: GetQuestionByIdParams,
  ): Promise<{ question: IQuestionDetail | null }> => {
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
  },
);

const createQuestion = withDatabase(
  "createQuestion",
  async (params: CreateQuestionParams) => {
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
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true },
      );
      tagDocuments.push(existingTag._id);
    }

    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // Create an interaction record for the user's ask_question action
    await Interaction.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    });
    // Increment author's reputation by +5 for creating a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });

    revalidatePath(path);
  },
  { errorMessage: "Failed to connect to database" },
);

const voteQuestion = withDatabase(
  "voteQuestion",
  async (params: QuestionVoteParams, voteType: VoteType) => {
    const { questionId, userId, hasupVoted, hasdownVoted, path } = params;

    const question = await Question.findById(questionId).select("author");
    if (!question) throw new Error("Question not found");

    await voteFunction({
      model: Question,
      id: questionId,
      userId,
      authorId: String(question.author),
      hasupVoted,
      hasdownVoted,
      voteType,
      path,
      entityName: "Question",
    });
  },
);

async function upvoteQuestion(params: QuestionVoteParams) {
  return voteQuestion(params, "upvote");
}

async function downvoteQuestion(params: QuestionVoteParams) {
  return voteQuestion(params, "downvote");
}

const deleteQuestion = withDatabase(
  "deleteQuestion",
  async (params: DeleteQuestionParams) => {
    const { questionId, path } = params;

    await Question.deleteOne({ _id: questionId });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } },
    );

    revalidatePath(path);
  },
  { errorMessage: "Failed to delete question" },
);

const editQuestion = withDatabase(
  "editQuestion",
  async (params: EditQuestionParams) => {
    const { questionId, path, title, content } = params;

    const question = await Question.findById(questionId).populate("tags");

    if (!question) {
      throw new Error("Question not found");
    }

    question.title = title;
    question.content = content;

    await question.save();

    revalidatePath(path);
  },
  { errorMessage: "Failed to edit question" },
);

const getHotQuestions = withDatabase("getHotQuestions", async () => {
  const hotQuestions = await Question.find({})
    .sort({ views: -1, upvotes: -1 })
    .limit(5);

  return hotQuestions;
});

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  createQuestion,
  deleteQuestion,
  downvoteQuestion,
  editQuestion,
  getHotQuestions,
  getQuestionById,
  getQuestions,
  upvoteQuestion,
  voteQuestion,
};
