export interface Playlist {
  id: string;
  title: string;
  description: string;
  uploader: string;
  channel: string;
  channelId: string;
  webpageUrl: string;
  playlist_count: number;
  trackCount: number;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
}

export interface PlaylistsApiResponse {
  results: Playlist[];
  count: number;
}

export interface Thumbnail {
  url: string;
  height: number;
  width: number;
}

export interface PlaylistTracksApiResponse {
  tracks: Track[];
  count: number;
}

export interface Track {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  duration: number;
  thumbnails: Thumbnail[];
}

export interface SearchApiResponse {
  results: Track[];
  query: string;
  count: number;
}

export type HistoryResponse = Track[];

export type LoginApiResponse = {
  user: {
    email: "yudatest@gmail.com";
    id: "0b12e084-0477-4ef1-8e41-758f7de6d59c";
  };
};

export type userProfileResponse = {
  id: string;
  email: string;
  displayName: string;
  emailVerified: string;
  createdAt: string;
};

export type getCurrentResponse = {
  user: userProfileResponse;
} | null;
