import type { Document, Model } from "mongoose";
import { revalidatePath } from "next/cache";
import type { VoteType } from "../types/sharedtypes";
import User from "@/database/user.model";

type VoteFunctionParams<T extends Document> = {
  model: Model<T>;
  id: string;
  userId: string;
  authorId?: string;
  hasupVoted: boolean;
  hasdownVoted: boolean;
  voteType: VoteType;
  path: string;
  entityName?: string;
};

export async function voteFunction<T extends Document>({
  model,
  id,
  userId,
  authorId,
  hasupVoted,
  hasdownVoted,
  voteType,
  path,
  entityName = "item",
}: VoteFunctionParams<T>) {
  const isUpvote = voteType === "upvote";
  const targetField = isUpvote ? "upvotes" : "downvotes";
  const oppositeField = isUpvote ? "downvotes" : "upvotes";

  const hasVotedOnTarget = isUpvote ? hasupVoted : hasdownVoted;
  const hasVotedOnOpposite = isUpvote ? hasdownVoted : hasupVoted;

  let updateQuery: Record<string, unknown> = {};

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

  const updatedItem = await model.findByIdAndUpdate(id, updateQuery, {
    new: true,
  });

  if (!updatedItem) {
    throw new Error(`${entityName} not found`);
  }
  // Increment or decrement the author's reputation based on the vote
  const voterRepChange = hasVotedOnTarget ? -2 : 2;
  const authorRepChange = hasVotedOnTarget ? -10 : 10;

  await Promise.all([
    // voter : action voting
    User.findByIdAndUpdate(userId, { $inc: { reputation: voterRepChange } }),
    // author : action received
    User.findByIdAndUpdate(authorId, { $inc: { reputation: authorRepChange } }),
  ]);

  revalidatePath(path);

  return updatedItem;
}
