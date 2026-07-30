import { getAnswers } from "@/lib/actions/answer.action";
import Filter from "./Filter";
import { AnswerFilters } from "@/constants/filter";
import Link from "next/link";
import Image from "next/image";
import { getTimestamp } from "@/lib/utils";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";

interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: number;
}

const AnswerList = async ({ questionId, userId, totalAnswers }: Props) => {
  const result = await getAnswers({
    questionId,
  });

  const normalizedUserId = (() => {
    if (!userId) return "";

    try {
      return JSON.parse(userId);
    } catch {
      return userId;
    }
  })();

  if (!result) {
    return (
      <p className="text-center mt-6">
        No answers yet. Be the first to answer!
      </p>
    );
  }

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers </h3>
        <Filter filters={AnswerFilters} />
      </div>

      <div>
        {result.answers.map((answer) => {
          const hasUpvoted = answer.upvotes.some(
            (vote) => vote.toString() === String(normalizedUserId),
          );
          const hasDownvoted = answer.downvotes.some(
            (vote) => vote.toString() === String(normalizedUserId),
          );

          return (
            <article key={answer._id}>
              <div className="flex items-center justify-between">
                <div className="mb-8 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
                  <Link
                    href={`/profile/${answer.author.clerkId}`}
                    className="flex flex-1 items-start gap-1 sm:items-center"
                  >
                    <Image
                      src={answer.author.picture}
                      width={18}
                      height={18}
                      alt="profile"
                      className="rounded-full object-cover max-sm:mt-0.5"
                    />
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <p className="body-semibold text-dark300_light700">
                        {answer.author.name}
                      </p>

                      <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                        answered {getTimestamp(answer.createdAt)}
                      </p>
                    </div>
                  </Link>
                  <div className="flex justify-end">
                    <Votes
                      type="Answer"
                      itemId={JSON.stringify(answer._id)}
                      userId={userId}
                      upvotes={answer.upvotes.length}
                      hasupVoted={hasUpvoted}
                      downvotes={answer.downvotes.length}
                      hasdownVoted={hasDownvoted}
                    />
                  </div>
                </div>
              </div>
              <ParseHTML data={answer.content} />
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerList;
