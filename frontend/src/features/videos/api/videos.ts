import { apiClient } from "@/api/apiClient";
import { getCookie } from "@/features/auth/utils";

export interface Video {
  id: string;
  owner_id: string;
  title: string;
  notes: string;
  recorded_at?: string | null;
  status: string;
  failure_reason?: string | null;
  original_name: string;
  original_key: string;
  playback_key?: string | null;
  thumbnail_key?: string | null;
  mime_type?: string | null;
  size_bytes: number;
  duration_ms?: number | null;
  width?: number | null;
  height?: number | null;
  created_at: string;
  updated_at: string;
}

export function listVideos(limit = 50, offset = 0) {
  return apiClient<Video[]>("/api/videos", {
    params: { limit, offset },
    credentials: "include",
  });
}

export function getVideo(videoId: string) {
  return apiClient<Video>(`/api/videos/${videoId}`, {
    credentials: "include",
  });
}

export function getVideoStreamUrl(videoId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/videos/${videoId}/stream`;
}

export function getVideoThumbnailUrl(videoId: string) {
  return `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/videos/${videoId}/thumbnail`;
}

export function createVideo(formData: FormData) {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/videos`, {
    method: "POST",
    credentials: "include",
    body: formData,
    headers: {
      "X-CSRF-Token": getCookie("csrf_token") ?? "",
    },
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Upload failed: ${response.status}`);
    }
    return response.json() as Promise<Video>;
  });
}

export function updateVideo(
  videoId: string,
  patch: Partial<Pick<Video, "title" | "notes" | "recorded_at">>,
) {
  return apiClient<Video>(`/api/videos/${videoId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCookie("csrf_token") ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(patch),
  });
}

export function deleteVideo(videoId: string) {
  return apiClient<void>(`/api/videos/${videoId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "X-CSRF-Token": getCookie("csrf_token") ?? "",
    },
  });
}
