"use server";

import { connectToDatabase } from "../mongoose";

export async function createQuestion({ params }: { params: string }) {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw new Error("Failed to connect to database");
  }
}
