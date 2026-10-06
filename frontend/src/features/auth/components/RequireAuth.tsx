"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetCurrentUser } from "@/features/auth/query/useAuth";

function isUnauthorized(error: unknown): boolean {
  // apiClient currently reports HTTP failures as "HTTP error! status: <code>".
  return error instanceof Error && /\bstatus:\s*401\b/.test(error.message);
}

export default function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, isError, isPending, isLoading, refetch } =
    useGetCurrentUser();

  const unauthorized = !isLoading && !isPending && !isError && data === null;

  useEffect(() => {
    if (unauthorized) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, unauthorized]);

  if (isPending || unauthorized) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        aria-live="polite"
      >
        <p>Loading...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p role="alert">Unable to verify your session. Please try again.</p>
        <button type="button" onClick={() => void refetch()}>
          Retry
        </button>
      </main>
    );
  }

  if (!data?.user) {
    return null;
  }

  return children;
}
