import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Judul + tombol "Ask a Question".
 * Dipakai di (home)/page.tsx DAN (home)/loading.tsx,
 * supaya keduanya tidak pernah berbeda.
 */
export default function HomeHeader() {
  return (
    <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center">
      <h1 className="h1-bold text-dark100_light900">All Questions</h1>

      <Link href="/ask-question" className="flex justify-end max-sm:w-full">
        <Button className="primary-gradient min-h-11.5 px-4 py-3 text-light-900!">
          Ask a Question
        </Button>
      </Link>
    </div>
  );
}
