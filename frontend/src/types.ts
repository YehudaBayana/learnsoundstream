export interface Playlist {
  id: string;
  title: string;
  url: string;
  uploader: string | null;
  channel: string | null;
  playlist_count: number;
  thumbnail: string | null;
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