"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs } from "@/components/ui/tabs";

type Props = React.ComponentProps<typeof Tabs> & { children?: React.ReactNode };

export default function ProfileTabs({ children, ...props }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleTabChange = () => {
    // remove `page` from search params when switching tabs
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (params.has("page")) {
      params.delete("page");
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    }
  };

  return (
    <Tabs onValueChange={handleTabChange} {...props}>
      {children}
    </Tabs>
  );
}
