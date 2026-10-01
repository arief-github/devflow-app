"use server";

import { revalidatePath } from "next/cache";
import {
  isObjectIdOrHexString,
  type QueryFilter,
  type SortOrder,
} from "mongoose";

import Answer from "@/database/answer.model";
import Question, { type IQuestion } from "@/database/question.model";
import Tag from "@/database/tag.model";
import User, { type IUser } from "@/database/user.model";
import { assignBadges, toSearchRegex } from "@/lib/utils";
import type { BadgeParam } from "@/types";

import { withDatabase } from "./with-database";
import type {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
  UserListItem,
} from "../types/sharedtypes";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

type GetUserByIdParams = {
  userId: string;
};

type SortSpec = Record<string, SortOrder>;

/* -------------------------------------------------------------------------- */
/*                         Helpers (tidak diekspor)                           */
/* -------------------------------------------------------------------------- */

const USER_SORT: Record<string, SortSpec> = {
  new_users: { createdAt: -1 },
  old_users: { createdAt: 1 },
  top_contributors: { reputation: -1 },
};

const SAVED_QUESTION_SORT: Record<string, SortSpec> = {
  most_recent: { createdAt: -1 },
  oldest: { createdAt: 1 },
  most_voted: { upvotes: -1 },
  most_viewed: { views: -1 },
  most_answered: { answerCount: -1 },
};

/** Ambil opsi sort dari map; filter tidak dikenal → tanpa sort */
const pickSort = (map: Record<string, SortSpec>, filter?: string): SortSpec =>
  filter && Object.hasOwn(map, filter) ? map[filter] : {};

/** Ekspresi $group: jumlah panjang array `upvotes` (aman jika field tidak ada) */
const SUM_UPVOTES = { $sum: { $size: { $ifNull: ["$upvotes", []] } } };

/** Terima Mongo ObjectId ATAU clerkId, kembalikan ObjectId (string) milik user */
async function resolveAuthorId(userId: string): Promise<string> {
  if (isObjectIdOrHexString(userId)) return userId;

  const user = await User.findOne({ clerkId: userId }).select("_id");
  if (!user) throw new Error("User not found");

  return String(user._id);
}

/* -------------------------------------------------------------------------- */
/*                                  Actions                                   */
/* -------------------------------------------------------------------------- */

const getUserById = withDatabase(
  "getUserById",
  async ({ userId }: GetUserByIdParams) => {
    return await User.findOne({ clerkId: userId });
  },
);

const createUser = withDatabase(
  "createUser",
  async (userData: CreateUserParams) => {
    return await User.create(userData);
  },
);

const updateUser = withDatabase(
  "updateUser",
  async ({ clerkId, updateData, path }: UpdateUserParams) => {
    await User.findOneAndUpdate({ clerkId }, updateData);

    revalidatePath(path);
  },
);

const deleteUser = withDatabase(
  "deleteUser",
  async ({ clerkId }: DeleteUserParams) => {
    const user = await User.findOne({ clerkId });
    if (!user) throw new Error("User not found");

    await Question.deleteMany({ author: user._id });

    return await User.findByIdAndDelete(user._id);
  },
);

const getAllUsers = withDatabase(
  "getAllUsers",
  async ({ searchQuery, filter }: GetAllUsersParams) => {
    const regex = searchQuery ? toSearchRegex(searchQuery) : null;

    const query: QueryFilter<IUser> = regex
      ? { $or: [{ name: { $regex: regex } }, { username: { $regex: regex } }] }
      : {};

    const users = await User.find(query).sort(pickSort(USER_SORT, filter));

    return { users };
  },
);

const toggleSaveQuestion = withDatabase(
  "toggleSaveQuestion",
  async ({ userId, questionId, path }: ToggleSaveQuestionParams) => {
    const user = await User.findById(userId).select("saved");
    if (!user) throw new Error("User not found");

    const update = user.saved.includes(questionId)
      ? { $pull: { saved: questionId } }
      : { $addToSet: { saved: questionId } };

    await User.updateOne({ _id: userId }, update);

    revalidatePath(path);
  },
);

const getSavedQuestions = withDatabase(
  "getSavedQuestions",
  async ({
    clerkId,
    searchQuery,
    filter,
    page = 1,
    pageSize = 5,
  }: GetSavedQuestionsParams) => {
    const skipAmount = (page - 1) * pageSize;

    const query: QueryFilter<IQuestion> = searchQuery
      ? { title: { $regex: toSearchRegex(searchQuery) } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: pickSort(SAVED_QUESTION_SORT, filter),
        skip: skipAmount,
        limit: pageSize + 1, // ambil 1 ekstra untuk mendeteksi halaman berikutnya
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) throw new Error("User not found");

    const isNext = user.saved.length > pageSize;

    return { questions: user.saved.slice(0, pageSize), isNext };
  },
);

const getUserInfo = withDatabase(
  "getUserInfo",
  async ({ userId }: GetUserByIdParams) => {
    const user = await User.findOne({ clerkId: userId });
    if (!user) throw new Error("User not found");

    const authorId = user._id;

    const [totalQuestion, totalAnswers, [questionStats], [answerStats]] =
      await Promise.all([
        Question.countDocuments({ author: authorId }),
        Answer.countDocuments({ author: authorId }),
        Question.aggregate<{ totalUpvotes: number; totalViews: number }>([
          { $match: { author: authorId } },
          {
            $group: {
              _id: null,
              totalUpvotes: SUM_UPVOTES,
              totalViews: { $sum: "$views" },
            },
          },
        ]),
        Answer.aggregate<{ totalUpvotes: number }>([
          { $match: { author: authorId } },
          { $group: { _id: null, totalUpvotes: SUM_UPVOTES } },
        ]),
      ]);

    const criteria: BadgeParam["criteria"] = [
      { type: "QUESTION_COUNT", count: totalQuestion },
      { type: "ANSWER_COUNT", count: totalAnswers },
      { type: "QUESTION_UPVOTES", count: questionStats?.totalUpvotes ?? 0 },
      { type: "ANSWER_UPVOTES", count: answerStats?.totalUpvotes ?? 0 },
      { type: "TOTAL_VIEWS", count: questionStats?.totalViews ?? 0 },
    ];

    return {
      user,
      totalQuestion,
      totalAnswers,
      badgeCounts: assignBadges({ criteria }),
      reputation: user.reputation,
    };
  },
);

const getUserQuestions = withDatabase(
  "getUserQuestions",
  async ({ userId, page = 1, pageSize = 10 }: GetUserStatsParams) => {
    const skipAmount = (page - 1) * pageSize;
    const authorId = await resolveAuthorId(userId);

    const [totalQuestions, questions] = await Promise.all([
      Question.countDocuments({ author: authorId }),
      Question.find({ author: authorId })
        .sort({ createdAt: -1, views: -1, upvotes: -1 })
        .skip(skipAmount)
        .limit(pageSize)
        .populate({ path: "tags", select: "_id name" })
        .populate({ path: "author", select: "_id clerkId name picture" }),
    ]);

    const isNextQuestions = totalQuestions > skipAmount + questions.length;

    return { questions, totalQuestions, isNextQuestions };
  },
);

const getUserAnswers = withDatabase(
  "getUserAnswers",
  async ({ userId, page = 1, pageSize = 10 }: GetUserStatsParams) => {
    const skipAmount = (page - 1) * pageSize;
    const authorId = await resolveAuthorId(userId);

    const [totalAnswers, answers] = await Promise.all([
      Answer.countDocuments({ author: authorId }),
      Answer.find({ author: authorId })
        .sort({ upvotes: -1 })
        .skip(skipAmount)
        .limit(pageSize)
        .populate("question", "_id title")
        .populate("author", "_id clerkId name picture"),
    ]);

    const isNextAnswers = totalAnswers > skipAmount + answers.length;

    return { answers, totalAnswers, isNextAnswers };
  },
);

/* -------------------------------------------------------------------------- */
/*                                  Exports                                   */
/* -------------------------------------------------------------------------- */

export {
  createUser,
  deleteUser,
  getAllUsers,
  getSavedQuestions,
  getUserAnswers,
  getUserById,
  getUserInfo,
  getUserQuestions,
  toggleSaveQuestion,
  updateUser,
};
