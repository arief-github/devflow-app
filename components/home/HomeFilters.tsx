"use client";

import { HomePageFilters } from "@/constants/filter";
import { Button } from "../ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { formUrlQuery } from "@/lib/utils";
import { useState } from "react";

const HomeFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [active, setActive] = useState("");

  const handleTypeClick = (item: string) => {
    if (active === item) {
      setActive("");

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: null,
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(item);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: "filter",
        value: item.toLowerCase(),
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="mt-10 hidden md:flex flex-wrap gap-3">
      {HomePageFilters.map((filter) => (
        <Button
          key={filter.value}
          onClickCapture={() => handleTypeClick(filter.value)}
          className={`body-medium rounded-lg px-6 py-3 capitalize shadow-none ${active === filter.value ? "bg-primary-100 text-primary-500" : "bg-light-800 text-light-500"}`}
        >
          {filter.name}
        </Button>
      ))}
    </div>
  );
};

export default HomeFilters;
