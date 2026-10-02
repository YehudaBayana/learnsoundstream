import { useInfiniteQuery } from "@tanstack/react-query";
import { historyKeys } from "@/shared/api/keys";
import { getHistory } from "../api/history";

const PAGE_SIZE = 10;

export function useHistory(userId: string) {
  return useInfiniteQuery({
    queryKey: historyKeys.getHistory(userId),
    queryFn: ({ pageParam }) => getHistory(userId, PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.length === 0 ? undefined : lastPageParam + PAGE_SIZE,
  });
}
