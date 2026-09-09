import { Playlist, PlaylistsApiResponse, PlaylistTracksApiResponse, Track } from "@/types";
import { apiUrl } from "@/constants";


export async function fetchPlaylistById(id: string): Promise<Playlist> {
  const response = await fetch(`${apiUrl}/playlists/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch playlist');
  }
  return response.json();
}

export async function getPopularPlaylists(): Promise<Playlist[]> {
  const response = await fetch(`${apiUrl}/api/popular-playlists`);
  if (!response.ok) {
    throw new Error('Failed to fetch popular playlists');
  }
  const data = await response.json() as PlaylistsApiResponse;
  return data.results;
}

export async function getPlaylistDetails(playlistId: string): Promise<Playlist> {
  const response = await fetch(`${apiUrl}/api/playlist-details?playlist_id=${playlistId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch playlist details');
  }
  const data = await response.json() as Playlist;
  return data;
}

export async function getPlaylistTracks(playlistId: string): Promise<Track[]> {
  const response = await fetch(`${apiUrl}/api/playlist-tracks?playlist_id=${playlistId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch playlist details');
  }
  const data = await response.json() as PlaylistTracksApiResponse;
  return data.tracks;
}
