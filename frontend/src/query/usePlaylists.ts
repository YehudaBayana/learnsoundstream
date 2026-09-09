import { useQuery } from '@tanstack/react-query';
import { playlistKeys } from '@/api/keys';
import { getPopularPlaylists, getPlaylistDetails, getPlaylistTracks } from '@/api/playlists';

export function usePopularPlaylists() {
  return useQuery({
    queryKey: playlistKeys.popularPlaylists(),
    queryFn: () => getPopularPlaylists(),
  });
}

export function usePlaylistDetails(playlistId: string) {
  return useQuery({
    queryKey: playlistKeys.playlistDetails(playlistId),
    queryFn: () => getPlaylistDetails(playlistId),
  });
}

export function usePlaylistTracks(playlistId: string) {
  return useQuery({
    queryKey: playlistKeys.playlistTracks(playlistId),
    queryFn: () => getPlaylistTracks(playlistId),
  });
}