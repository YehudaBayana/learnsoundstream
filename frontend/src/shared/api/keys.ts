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
  getHistory: () => ["get-history"] as const,
};

export const authKeys = {
  login: (email: string) => ["login", email] as const,
  me: () => ["me"] as const,
};

export const likedKeys = {
  getLiked: () => ["get-liked"] as const,
};
