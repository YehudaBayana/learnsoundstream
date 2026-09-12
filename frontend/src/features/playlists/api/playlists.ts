// src/features/playlists/api.ts
import { apiClient } from "@/api/apiClient";
import {
  Playlist,
  PlaylistsApiResponse,
  PlaylistTracksApiResponse,
  Track,
} from "@/types/global.types";

export async function fetchPlaylistById(id: string): Promise<Playlist> {
  return apiClient<Playlist>(`/playlists/${id}`);
}

export async function getPopularPlaylists(): Promise<Playlist[]> {
  const data = await apiClient<PlaylistsApiResponse>("/api/popular-playlists");
  return data.results;
}

export async function getPlaylistDetails(
  playlistId: string,
): Promise<Playlist> {
  return apiClient<Playlist>("/api/playlist-details", {
    params: { playlist_id: playlistId },
  });
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const data = await apiClient<PlaylistTracksApiResponse>(
    "/api/playlist-tracks",
    {
      params: { playlist_id: playlistId },
    },
  );
  return data.tracks;
}
