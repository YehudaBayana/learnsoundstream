export const playlistKeys = {
  popularPlaylists: () => ['popular-playlists'] as const,
  playlistDetails: (playlistId: string) => ['playlist-details', playlistId] as const,
  playlistTracks: (playlistId: string) => ['playlist-tracks', playlistId] as const,
};