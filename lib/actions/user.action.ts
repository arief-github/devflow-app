"use server";

import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";

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
