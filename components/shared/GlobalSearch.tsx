"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Input } from "../ui/input";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { formUrlQuery, removeKeysFromQuery } from "@/lib/utils";
import GlobalResult from "./GlobalResult";

const GlobalSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  const currentGlobal = searchParams.get("global") ?? "";
  const [search, setSearch] = useState(currentGlobal);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [pathname]);

  useEffect(() => {
    const trimmed = search.trim();

    if (trimmed === currentGlobal) return;

    const timeout = setTimeout(() => {
      const nextUrl = trimmed
        ? formUrlQuery({
            params: searchParams.toString(),
            key: "global",
            value: trimmed,
          })
        : removeKeysFromQuery({
            params: searchParams.toString(),
            keysToRemove: ["global", "type"],
          });

      if (nextUrl && nextUrl !== window.location.search) {
        router.push(nextUrl, { scroll: false });
      }

      if (!trimmed && !currentGlobal) {
        return;
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, currentGlobal, searchParams, router]);

  return (
    <div
      ref={searchContainerRef}
      aria-expanded={isOpen}
      className="relative w-full max-w-150 max-lg:hidden"
    >
      <div className="background-light800_darkgradient relative flex min-h-14 grow items-center gap-1 rounded-xl px-4">
        <Image
          src="/icons/search.svg"
          alt="search"
          width={24}
          height={24}
          className="cursor-pointer"
        />

        <Input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => {
            const value = e.target.value;
            setSearch(value);

            if (!isOpen) setIsOpen(true);
            if (value === "" && isOpen) setIsOpen(false);
          }}
          className="paragraph-regular no-focus placeholder background-light800_darkgradient border-none shadow-none outline-none"
        />

        {isOpen && <GlobalResult />}
      </div>
    </div>
  );
};

export default GlobalSearch;
