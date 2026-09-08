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

export interface PlaylistTrackThumbnail {
  url: string;
  height: number;
  width: number;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  channel: string;
  url: string;
  thumbnail: string;
  durationSeconds: number;
  duration: string;
  thumbnails: PlaylistTrackThumbnail[];
}

export interface PlaylistTracksApiResponse {
  tracks: PlaylistTrack[];
  count: number;
}

export interface Track {
  videoId: string;
  title: string;
  desc: string;
  duration: string;
  emoji: string;
  category: string;
}
