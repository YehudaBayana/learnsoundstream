export const playlistKeys = {
  popularPlaylists: () => ["popular-playlists"] as const,
  playlistDetails: (playlistId: string) =>
    ["playlist-details", playlistId] as const,
  playlistTracks: (playlistId: string) =>
    ["playlist-tracks", playlistId] as const,
};

export const searchKeys = {
  searchBy: (searchTerm: string) => ["search-by", searchTerm] as const,
};

export const historyKeys = {
  getHistory: (userId: string) => ["get-history", userId] as const,
};
