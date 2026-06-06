import Image from "next/image";
import Link from "next/link";
import RenderTag from "./RenderTag";

const RightSidebar = () => {
  const hotQuestions: Array<{ _id: number; title: string }> = [
    { _id: 1, title: "How do I use express as a custom server in NextJS ?" },
    { _id: 2, title: "What's best practice of PG?" },
    { _id: 3, title: "How to animate on scroll?" },
    { _id: 4, title: "What is tRPC?" },
    { _id: 5, title: "How to implement stripe in NextJS?" },
  ];

  const popularTags: Array<{
    _id: string;
    name: string;
    totalQuestion: number;
  }> = [
    { _id: "1", name: "NextJS", totalQuestion: 10 },
    { _id: "2", name: "React", totalQuestion: 20 },
    { _id: "3", name: "TypeScript", totalQuestion: 30 },
    { _id: "4", name: "PostgreSQL", totalQuestion: 40 },
    { _id: "5", name: "Stripe", totalQuestion: 50 },
  ];

  return (
    <section className="background-light900_dark200 light-border custom-scrollbar sticky left-0 top-0 flex h-screen flex-col justify-between overflow-y-auto border-l p-6 pt-36 shadow-light-300 dark:shadow-none max-xl:hidden w-[350px]">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Question</h3>
      </div>
      <div className="mt-7 flex w-full flex-col gap-7.5">
        {hotQuestions.map((question) => (
          <Link
            key={question._id}
            className="flex cursor-pointer items-center justify-between gap-7"
            href={`/questions/${question._id}`}
          >
            <p className="body-medium text-dark500_light700">
              {question.title}
            </p>
            <Image
              src="/icons/chevron-right.svg"
              alt="chevron right"
              width={20}
              height={20}
              className="invert-colors"
            />
          </Link>
        ))}
      </div>
      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map((tag) => (
            <RenderTag
              key={tag._id}
              _id={tag._id}
              name={tag.name}
              totalQuestion={tag.totalQuestion}
              showCount
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RightSidebar;
