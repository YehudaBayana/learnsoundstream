import { apiClient } from "@/api/apiClient";
import { HistoryResponse } from "@/types/global.types";

export function getHistory(limit: number, offset: number) {
  return apiClient<HistoryResponse>("/api/playback-history", {
    params: { limit, offset },
    credentials: "include",
  });
}
