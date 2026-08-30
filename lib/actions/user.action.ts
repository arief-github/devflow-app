"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import { QueryFilter } from "mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "../types/sharedtypes";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";

type GetUserByIdParams = {
  userId: string;
};

export async function getUserById(params: GetUserByIdParams) {
  try {
    // run connection to database
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    console.log(user);

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found");
    }
    // delete user questions
    await Question.deleteMany({ author: user._id });

    const deleteUser = await User.findOneAndDelete({ clerkId });

    return deleteUser;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export type UserListItem = {
  _id: string;
  picture: string;
  name: string;
  username: string;
  bio?: string;
  reputation?: number;
};

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    connectToDatabase();

    const { searchQuery } = params;

    const query: QueryFilter<typeof User> = {};

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { saved: questionId },
        },
        { new: true },
      );
    } else {
      await User.findByIdAndUpdate(
        userId,
        {
          $addToSet: { saved: questionId },
        },
        { new: true },
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.error("Error toggling save question:", error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    const { clerkId, searchQuery } = params;

    const query: QueryFilter<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: { createdAt: -1 },
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions };
  } catch (error) {
    console.error("Error fetching saved questions:", error);
    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      throw new Error("User not found");
    }

    const totalQuestion = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });

    return { user, totalQuestion, totalAnswers };
  } catch (error) {
    console.error("Error fetching user info:", error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    // Normalize userId: it may be a Mongo ObjectId string or a Clerk `clerkId`.
    let authorId = userId;
    const mongoose = await import("mongoose");
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      const user = await User.findOne({ clerkId: authorId });
      if (!user) {
        throw new Error("User not found");
      }
      authorId = String(user._id);
    }

    const totalQuestions = await Question.countDocuments({ author: authorId });

    const userQuestions = await Question.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "tags",
        select: "_id name",
      })
      .populate({
        path: "author",
        select: "_id clerkId name picture",
      });

    return { questions: userQuestions, totalQuestions };
  } catch (error) {
    console.error("Error fetching user questions:", error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    // Normalize userId to Mongo ObjectId string when a clerkId is passed
    let authorId = userId;
    const mongoose = await import("mongoose");
    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      const user = await User.findOne({ clerkId: authorId });
      if (!user) {
        throw new Error("User not found");
      }
      authorId = String(user._id);
    }

    const totalAnswers = await Answer.countDocuments({ author: authorId });

    const userAnswers = await Answer.find({ author: authorId })
      .sort({ upvotes: -1 })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");

    return { answers: userAnswers, totalAnswers };
  } catch (error) {
    console.error("Error fetching user answers:", error);
    throw error;
  }
}
