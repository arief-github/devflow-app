"use client";

import { formatAndDivideNumber } from "@/lib/utils";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  downvoteQuestion,
  upvoteQuestion,
} from "@/lib/actions/question.action";
import { downvoteAnswer, upvoteAnswer } from "@/lib/actions/answer.action";
import { toggleSaveQuestion } from "@/lib/actions/user.action";
import { useEffect } from "react";
import { viewQuestion } from "@/lib/actions/interaction.action";

interface Props {
  type: "Question" | "Answer";
  itemId: string;
  userId: string;
  upvotes: number;
  hasupVoted: boolean;
  downvotes: number;
  hasdownVoted: boolean;
  hasSaved?: boolean;
}

const Votes = ({
  type,
  itemId,
  userId,
  upvotes,
  hasupVoted,
  downvotes,
  hasdownVoted,
  hasSaved,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  const normalizedUserId = (() => {
    try {
      return JSON.parse(userId);
    } catch {
      return userId;
    }
  })();

  const normalizedItemId = (() => {
    try {
      return JSON.parse(itemId);
    } catch {
      return itemId;
    }
  })();

  const handleSave = async () => {
    await toggleSaveQuestion({
      userId: normalizedUserId,
      questionId: normalizedItemId,
      path: pathname,
    });
  };

  const handleVote = async (action: "upvote" | "downvote") => {
    if (!userId) return;

    if (action === "upvote") {
      if (type === "Question") {
        await upvoteQuestion({
          questionId: normalizedItemId,
          userId: normalizedUserId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await upvoteAnswer({
          answerId: normalizedItemId,
          userId: normalizedUserId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }
      return;
    }

    if (action === "downvote") {
      if (type === "Question") {
        await downvoteQuestion({
          questionId: normalizedItemId,
          userId: normalizedUserId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      } else if (type === "Answer") {
        await downvoteAnswer({
          answerId: normalizedItemId,
          userId: normalizedUserId,
          hasupVoted,
          hasdownVoted,
          path: pathname,
        });
      }

      return;
    }
  };

  useEffect(() => {
    viewQuestion({
      questionId: normalizedItemId,
      userId: userId ? normalizedUserId : undefined,
    });
  }, [itemId, pathname, userId, router, normalizedItemId, normalizedUserId]);

  const hasUpvotedSrc = hasupVoted ? "/icons/upvoted.svg" : "/icons/upvote.svg";
  const hasDownvotedSrc = hasdownVoted
    ? "/icons/downvoted.svg"
    : "/icons/downvote.svg";

  return (
    <div className="flex gap-5">
      <div className="flex-center gap-2.5">
        <div className="flex-center gap-1.5">
          <Image
            src={hasUpvotedSrc}
            width={20}
            height={20}
            alt="upvote"
            className="cursor-pointer"
            onClick={() => {
              handleVote("upvote");
            }}
          />

          <div className="flex-center background-light700_dark400 min-w-4.5 rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatAndDivideNumber(upvotes)}
            </p>
          </div>
        </div>

        <div className="flex-center gap-1.5">
          <Image
            src={hasDownvotedSrc}
            width={20}
            height={20}
            alt="downvote"
            className="cursor-pointer"
            onClick={() => {
              handleVote("downvote");
            }}
          />

          <div className="flex-center background-light700_dark400 min-w-4.5 rounded-sm p-1">
            <p className="subtle-medium text-dark400_light900">
              {formatAndDivideNumber(downvotes)}
            </p>
          </div>
        </div>
      </div>

      {type === "Question" && (
        <Image
          src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
          width={18}
          height={18}
          alt="star"
          className="cursor-pointer"
          onClick={handleSave}
        />
      )}
    </div>
  );
};

export default Votes;
