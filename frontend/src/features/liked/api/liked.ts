import { apiClient } from "@/api/apiClient";
import { getCookie } from "@/features/auth/utils";
import { LikedResponse } from "@/types/global.types";

export function getLiked(limit: number, offset: number) {
  return apiClient<LikedResponse>("/api/liked", {
    params: { limit, offset },
    credentials: "include",
  });
}

export function postLiked(videoID: string) {
  return apiClient<void>("/api/liked", {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCookie("csrf_token") ?? "",
    },
    params: { video_id: videoID },
  });
}
