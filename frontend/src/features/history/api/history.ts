import { apiClient } from "@/api/apiClient";
import { HistoryResponse } from "@/types/global.types";

export function getHistory(userId: string) {
  return apiClient<HistoryResponse>("/api/playback-history", {
    params: { q: userId },
  });
}
