import Link from "next/link";
import {
  AnswerCardProps,
  ProfileCardQorAProps,
  QuestionCardProps,
} from "./sharedTypes";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import Metric from "../shared/Metric";
import RenderTag from "../shared/RenderTag";

const ProfileCardQorA = (props: ProfileCardQorAProps) => {
  if (props.type === "question") {
    return <QuestionCard {...props} />;
  } else if (props.type === "answer") {
    return <AnswerCard {...props} />;
  } else {
    return null; // or throw an error if you want to handle unexpected types
  }
};

const AnswerCard = (props: AnswerCardProps) => {
  const { _id, question, author, upvotes, createdAt } = props;

  return (
    <Link
      href={`/question/${question._id}/#${_id}`}
      className="card-wrapper rounded-[10px] px-11 py-9"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
            {question.title}
          </h3>
        </div>
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user"
          value={author.name}
          title={` - asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />

        <div className="flex-center gap-3">
          <Metric
            imgUrl="/icons/upvote.svg"
            alt="upvote icon"
            value={formatAndDivideNumber(upvotes)}
            title="upvotes"
            textStyles="body-medium text-dark400_light700"
          />
        </div>
      </div>
    </Link>
  );
};

const QuestionCard = (props: QuestionCardProps) => {
  const { _id, title, tags, author, upvotes, views, answers, createdAt } =
    props;

  return (
    <div className="card-wrapper rounded-[10px] p-9 sm:px-11">
      <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
        <div>
          <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
            {getTimestamp(createdAt)}
          </span>
          <Link href={`/question/${_id}`}>
            <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-1 flex-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* If signed in add edit delete actions */}
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
        ))}
      </div>

      <div className="flex-between mt-6 w-full flex-wrap gap-3">
        <Metric
          imgUrl={author.picture}
          alt="user"
          value={author.name}
          title={` - asked ${getTimestamp(createdAt)}`}
          href={`/profile/${author._id}`}
          isAuthor
          textStyles="body-medium text-dark400_light700"
        />

        <Metric
          imgUrl="/icons/like.svg"
          alt="Upvotes"
          value={formatAndDivideNumber(upvotes.length)}
          title=" Votes"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message"
          value={formatAndDivideNumber(answers.length)}
          title=" Answers"
          textStyles="small-medium text-dark400_light800"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye"
          value={formatAndDivideNumber(views)}
          title=" Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>
    </div>
  );
};

export default ProfileCardQorA;
