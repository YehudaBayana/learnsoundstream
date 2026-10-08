"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useLikedStore } from "../store/useLikedStore";
import { useGetLiked } from "../query/useLiked";

export default function LikedInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  const setInitialLiked = useLikedStore((state) => state.setLikedList);
  const setLikedQueryState = useLikedStore((state) => state.setLikedQueryState);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isPending,
    refetch,
  } = useGetLiked();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const tracks = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  useEffect(() => {
    setLikedQueryState({ isPending, isError, refetch });
  }, [setLikedQueryState, isPending, isError, refetch]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element || !hasNextPage || isError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isError, isFetchingNextPage]);

  useEffect(() => {
    if (isPending || !data) return; // Wait until the data is loaded
    setInitialLiked(tracks);
  }, [setInitialLiked, isPending, data, tracks]);

  return (
    <>
      {tracks.length > 0 && hasNextPage && (
        <div ref={loadMoreRef} className="min-h-8" aria-hidden="true" />
      )}
      {children}
    </>
  );
}
