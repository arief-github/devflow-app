import Link from "next/link";
import { ReactNode } from "react";
import type { Types } from "mongoose";

export interface GenericCardItem {
  _id: string | Types.ObjectId;
  [key: string]: unknown;
}

interface GenericCardProps<T extends GenericCardItem = GenericCardItem> {
  title: string;
  type?: "community" | "tags";
  items: T[];
  noResultsMessage?: ReactNode;
  renderCard: (item: T) => ReactNode;
  getLinkHref: (item: T) => string;
  containerClassName?: string;
  cardClassName?: string;
}

const GenericCard = <T extends GenericCardItem = GenericCardItem>({
  title,
  items,
  noResultsMessage,
  renderCard,
  getLinkHref,
  containerClassName = "mt-12 flex flex-wrap gap-4",
  cardClassName = "shadow-light100_darknone",
}: GenericCardProps<T>) => {
  return (
    <>
      <h1 className="h1-bold text-dark100_light900">{title}</h1>

      <section className={containerClassName}>
        {items.length > 0 ? (
          items.map((item) => (
            <Link
              href={getLinkHref(item)}
              key={String(item._id)}
              className={cardClassName}
            >
              {renderCard(item)}
            </Link>
          ))
        ) : (
          <div className="paragraph-regular text-dark200_light800 mx-auto max-w-4xl text-center">
            {noResultsMessage}
          </div>
        )}
      </section>
    </>
  );
};

export default GenericCard;
