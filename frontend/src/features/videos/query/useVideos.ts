import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createVideo, listVideos, type Video } from "@/features/videos/api/videos";
import { videoKeys } from "@/shared/api/keys";

export function useVideos(limit = 50, offset = 0) {
  return useQuery<Video[]>({
    queryKey: videoKeys.list(limit, offset),
    queryFn: () => listVideos(limit, offset),
    retry: false,
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all() });
    },
  });
}
