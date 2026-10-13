import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadVideo } from "@/features/videos/api/uploadVideo";
import { getPlaybackUrl, listVideos, type Video } from "@/features/videos/api/videos";
import { videoKeys } from "@/shared/api/keys";

const PROCESSING_POLL_MS = 3000;

export function useVideos(limit = 50, offset = 0) {
  return useQuery<Video[]>({
    queryKey: videoKeys.list(limit, offset),
    queryFn: () => listVideos(limit, offset),
    retry: false,
    // Keep polling while the server is still turning an upload into a playable video.
    refetchInterval: (query) =>
      query.state.data?.some((video) => video.status === "processing") ? PROCESSING_POLL_MS : false,
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadVideo,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all() });
    },
  });
}

/** The signed URL is only refetched on demand (after a playback error), not on a timer. */
export function usePlaybackUrl(videoId: string, enabled: boolean) {
  return useQuery({
    queryKey: videoKeys.playbackUrl(videoId),
    queryFn: () => getPlaybackUrl(videoId),
    enabled,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
