import { useQuery } from "@tanstack/react-query";
import { historyKeys } from "@/shared/api/keys";
import { getHistory } from "../api/history";

export function useHistory(userId: string) {
  return useQuery({
    queryKey: historyKeys.getHistory(userId),
    queryFn: () => getHistory(userId),
  });
}
