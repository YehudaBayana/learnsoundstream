"use client";
import React, { useEffect, useState } from "react";
import { usePlayback } from "@/context/PlaybackContext";
import { useParams } from "next/navigation";
import Container from "@/components/ui/layout/Container";
import Flex from "@/components/ui/layout/Flex";
import Box from "@/components/ui/layout/Box";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import Image from "@/components/ui/Image";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import TrackItem from "@/components/TrackItem";
import { apiUrl } from "@/constants";
import {
  Playlist,
  Track,
  PlaylistTracksApiResponse,
} from "@/types";

const PlaylistDetailView = () => {
  const params = useParams();
  const selectedPlaylistId = params?.id as string;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPlaylistTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiUrl}/api/playlist-tracks?playlist_id=${selectedPlaylistId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch playlist tracks");
        }
        const data: PlaylistTracksApiResponse = await response.json();
        console.log("Playlist tracks: ", data);
        setTracks(data.tracks || []);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getPlaylistTracks();
  }, []);

  useEffect(() => {
    const getPlaylistDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${apiUrl}/api/playlist-details?playlist_id=${selectedPlaylistId}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch playlist tracks");
        }
        const data: Playlist = await response.json();
        console.log("Playlist details: ", data);
        setPlaylist(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getPlaylistDetails();
  }, []);

  if (!playlist) return null;


  const headerImage =
    playlist.thumbnails && playlist.thumbnails.length > 0
      ? playlist.thumbnails[playlist.thumbnails.length - 1].url
      : "";

  return (
    <Container className="space-y-6">
      {/* Playlist Header */}
      <Flex
        align="center"
        gap={6}
        className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-default)]"
      >
        {headerImage && (
          <Box className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-[var(--border-default)]">
            <Image
              src={headerImage}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </Box>
        )}
        <Flex direction="col" gap={2} className="min-w-0 flex-1">
          <Badge variant="primary" size="sm" className="w-fit">
            PLAYLIST
          </Badge>
          <Heading level={1} size="xl" truncate>
            {playlist.title}
          </Heading>
          {playlist.uploader && (
            <Text variant="body-sm" color="muted">
              By {playlist.uploader}
            </Text>
          )}
          <Text variant="body" color="default" className="line-clamp-2">
            {playlist.description}
          </Text>
          <Text variant="caption" color="primary">
            {playlist.playlist_count
              ? `${playlist.playlist_count} tracks`
              : `${tracks.length} tracks`}
          </Text>
        </Flex>
      </Flex>

      {/* Playlist Tracks List */}
      <Box className="mt-6">
        {loading ? (
          <Flex justify="center" align="center" className="py-16">
            <Spinner size="lg" />
          </Flex>
        ) : error ? (
          <Flex
            direction="col"
            align="center"
            justify="center"
            className="py-16 text-center"
          >
            <Text variant="h3" color="danger">
              Failed to load tracks
            </Text>
            <Text variant="body" color="muted" className="mt-2">
              {error}
            </Text>
          </Flex>
        ) : tracks.length === 0 ? (
          <Flex
            direction="col"
            align="center"
            justify="center"
            className="py-16 text-center"
          >
            <Text variant="h3">No tracks found</Text>
            <Text variant="body" color="muted" className="mt-2">
              This playlist has no available tracks.
            </Text>
          </Flex>
        ) : (
          <Flex direction="col" gap={2}>
            {tracks.map((track, index) => {

              return (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  playlistId={playlist.id}
                />
              );
            })}
          </Flex>
        )}
      </Box>
    </Container>
  );
};

export default PlaylistDetailView;
