"use client";
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
import { usePlaylistDetails, usePlaylistTracks } from "@/query/usePlaylists";

const PlaylistDetailView = () => {
  const params = useParams();
  const selectedPlaylistId = params?.id as string;
  const { data: playlistDetails } = usePlaylistDetails(selectedPlaylistId);
  const {
    data: tracks,
    isLoading: isTracksLoading,
    error: tracksError,
  } = usePlaylistTracks(selectedPlaylistId);

  if (!playlistDetails) return null;

  const headerImage =
    playlistDetails.thumbnails && playlistDetails.thumbnails.length > 0
      ? playlistDetails.thumbnails[playlistDetails.thumbnails.length - 1].url
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
              alt={playlistDetails.title}
              className="w-full h-full object-cover"
            />
          </Box>
        )}
        <Flex direction="col" gap={2} className="min-w-0 flex-1">
          <Badge variant="primary" size="sm" className="w-fit">
            PLAYLIST
          </Badge>
          <Heading level={1} size="xl" truncate>
            {playlistDetails.title}
          </Heading>
          {playlistDetails.uploader && (
            <Text variant="body-sm" color="muted">
              By {playlistDetails.uploader}
            </Text>
          )}
          <Text variant="body" color="default" className="line-clamp-2">
            {playlistDetails.description}
          </Text>
          <Text variant="caption" color="primary">
            {playlistDetails.playlist_count
              ? `${playlistDetails.playlist_count} tracks`
              : `${tracks?.length} tracks`}
          </Text>
        </Flex>
      </Flex>

      {/* Playlist Tracks List */}
      <Box className="mt-6">
        {isTracksLoading ? (
          <Flex justify="center" align="center" className="py-16">
            <Spinner size="lg" />
          </Flex>
        ) : tracksError ? (
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
              {tracksError.message}
            </Text>
          </Flex>
        ) : tracks?.length === 0 ? (
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
            {tracks?.map((track, index) => {
              return (
                <TrackItem
                  key={track.id}
                  track={track}
                  index={index}
                  playlistId={playlistDetails.id}
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
