"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetCurrentUser } from "@/features/auth/query/useAuth";

interface RequireAuthProps {
  children: React.ReactNode;
  dataHook?: string;
}

export default function RequireAuth({ children, dataHook = "require-auth" }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isError, isPending, isLoading, refetch } = useGetCurrentUser();

  const unauthorized = !isLoading && !isPending && !isError && data === null;

  useEffect(() => {
    if (unauthorized) {
      router.replace(`/auth?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, unauthorized]);

  if (isPending || unauthorized) {
    return (
      <main
        data-hook={dataHook}
        className="flex min-h-screen items-center justify-center"
        aria-live="polite"
      >
        <p>Loading...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        data-hook={dataHook}
      >
        <p role="alert" data-hook={`${dataHook}-error`}>
          Unable to verify your session. Please try again.
        </p>
        <button type="button" onClick={() => void refetch()} data-hook={`${dataHook}-retry`}>
          Retry
        </button>
      </main>
    );
  }

  if (!data?.user) {
    return null;
  }

  return <div data-hook={dataHook}>{children}</div>;
}
