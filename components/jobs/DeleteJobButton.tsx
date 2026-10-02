"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteJob } from "@/lib/actions/job.action";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!window.confirm("Delete this job post? This cannot be undone.")) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteJob({ jobId });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/jobs");
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
        className="min-h-[46px] px-4 py-3"
      >
        {isPending ? "Deleting..." : "Delete"}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
