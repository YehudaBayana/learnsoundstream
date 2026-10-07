import { apiClient } from "@/api/apiClient";
import { HistoryResponse } from "@/types/global.types";

export function getHistory(userId: string, limit: number, offset: number) {
  return apiClient<HistoryResponse>("/api/playback-history", {
    params: { user_id: userId, limit, offset },
    credentials: "include",
  });
}
