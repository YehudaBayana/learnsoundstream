import { apiClient } from "@/api/apiClient";
import { apiUrl } from "@/config/constants";
import { getCookie } from "@/features/auth/utils";
import type { PartUrl, UploadedPart } from "@/features/videos/api/uploadParts";

export interface Video {
  id: string;
  owner_id: string;
  title: string;
  notes: string;
  recorded_at?: string | null;
  status: "uploading" | "processing" | "ready" | "failed";
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

export function getVideoThumbnailUrl(videoId: string) {
  return `${apiUrl}/api/videos/${videoId}/thumbnail`;
}

export interface SignedUrl {
  url: string;
  expires_at: string;
}

export interface UploadSession {
  video: Video;
  part_size: number;
  part_count: number;
}

export interface InitUploadInput {
  filename: string;
  size_bytes: number;
  content_type: string;
  title: string;
  notes: string;
  recorded_at?: string;
}

function csrfJsonHeaders() {
  return {
    "X-CSRF-Token": getCookie("csrf_token") ?? "",
    "Content-Type": "application/json",
  };
}

export function initVideoUpload(input: InitUploadInput) {
  return apiClient<UploadSession>("/api/videos/uploads", {
    method: "POST",
    credentials: "include",
    headers: csrfJsonHeaders(),
    body: JSON.stringify(input),
  });
}

export function getUploadPartUrls(videoId: string, partNumbers: number[]) {
  return apiClient<PartUrl[]>(`/api/videos/${videoId}/uploads/parts`, {
    method: "POST",
    credentials: "include",
    headers: csrfJsonHeaders(),
    body: JSON.stringify({ part_numbers: partNumbers }),
  });
}

export function completeVideoUpload(videoId: string, parts: UploadedPart[]) {
  return apiClient<Video>(`/api/videos/${videoId}/uploads/complete`, {
    method: "POST",
    credentials: "include",
    headers: csrfJsonHeaders(),
    body: JSON.stringify({ parts }),
  });
}

export function getPlaybackUrl(videoId: string) {
  return apiClient<SignedUrl>(`/api/videos/${videoId}/playback-url`, {
    credentials: "include",
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
