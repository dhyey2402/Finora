"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Dashboard index — redirects to the Companies page by default.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/companies");
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
