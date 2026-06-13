"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  UpdateUserParams,
} from "../types/sharedtypes";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";

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

export async function getAllUsers() {
  try {
    connectToDatabase();

    const users = await User.find({}).sort({ createdAt: -1 });

    return { users };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
