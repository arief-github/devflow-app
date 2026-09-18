"use client";

import { formUrlQuery } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

interface WrapperButtonPaginationProps extends Props {
  kind: "prev" | "next";
  onNavigate: (direction: "prev" | "next") => void;
}

// Helper Component to render the Prev and Next buttons
const WrapperButtonPagination = ({
  pageNumber,
  isNext,
  kind,
  onNavigate,
}: WrapperButtonPaginationProps) => {
  if (kind === "prev") {
    return (
      <Button
        disabled={pageNumber === 1}
        onClick={() => onNavigate("prev")}
        className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border"
      >
        <p className="body-medium text-dark200_light800">Prev</p>
      </Button>
    );
  }

  if (kind === "next") {
    return (
      <Button
        disabled={!isNext}
        onClick={() => onNavigate("next")}
        className="light-border-2 btn flex min-h-9 items-center justify-center gap-2 border"
      >
        <p className="body-medium text-dark200_light800">Next</p>
      </Button>
    );
  }

  return null;
};

// Main Pagination Component
const Pagination = ({ pageNumber, isNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });
    router.push(newUrl);
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <WrapperButtonPagination
        pageNumber={pageNumber}
        isNext={isNext}
        kind="prev"
        onNavigate={handleNavigation}
      />
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>
      <WrapperButtonPagination
        pageNumber={pageNumber}
        isNext={isNext}
        kind="next"
        onNavigate={handleNavigation}
      />
    </div>
  );
};

export default Pagination;
