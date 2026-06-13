import { getTopInteractedTags } from "@/lib/actions/tags.action";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import RenderTag from "../shared/RenderTag";

interface Props {
  user: {
    _id: string;
    clerkId: string;
    picture: string;
    name: string;
    username: string;
  };
}

const UserCard = async ({ user }: Props) => {
  const interactedTags = await getTopInteractedTags({ userId: user._id });

  return (
    <Link
      href={`/users/${user.clerkId}`}
      className="shadow-light_100_darknone w-full max-xs:min-w-full xs:w-65"
    >
      <article className="background-light900_dark200 light-border ">
        <Image
          src={user.picture}
          alt="user profile picture"
          width={50}
          height={50}
          className="rounded-full"
        />
        <div>
          <h3 className="font-bold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
        </div>
      </article>
      <div className="mt-4">
        {interactedTags.map((tag) => (
          <Badge key={tag._id} className="mr-2">
            {tag.name}
          </Badge>
        ))}
      </div>
    </Link>
  );
};

export default UserCard;
