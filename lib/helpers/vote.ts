import type { Document, Model } from "mongoose";
import { revalidatePath } from "next/cache";
import type { VoteType } from "../types/sharedtypes";

type VoteFunctionParams<T extends Document> = {
  model: Model<T>;
  id: string;
  userId: string;
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

  revalidatePath(path);

  return updatedItem;
}
