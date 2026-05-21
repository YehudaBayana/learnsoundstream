'use client';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Container from '@/components/ui/layout/Container';
import TrackItem from '@/components/TrackItem';
import { usePlayback, TRACK_DATABASE } from '@/context/PlaybackContext';

export default function PlaylistDetailView() {
  const {
    selectedPlaylistId,
    playlists,
    setCurrentView,
    deletePlaylist,
    playAll,
  } = usePlayback();

  // Find active playlist details
  const playlist = playlists.find((p) => p.id === selectedPlaylistId);

  if (!playlist) {
    return (
      <Container className="px-6 py-16 text-center animate-[fadeIn_0.4s_ease_forwards]">
        <span className="text-4xl mb-4 block">⚠️</span>
        <Heading level={2} size="md" className="text-white font-bold mb-2">
          Playlist Not Found
        </Heading>
        <Text variant="body-sm" color="muted" className="mb-6">
          The playlist you are looking for does not exist or has been deleted.
        </Text>
        <Button
          variant="outline"
          onClick={() => setCurrentView('playlists')}
          className="rounded-full text-white border-white/20 hover:bg-white/5"
        >
          Back to Playlists
        </Button>
      </Container>
    );
  }

  // Resolve Track objects from videoIds in playlist
  const playlistTracks = playlist.trackIds
    .map((id) => TRACK_DATABASE.find((t) => t.videoId === id))
    .filter((t): t is typeof TRACK_DATABASE[0] => !!t);

  const handlePlayAll = () => {
    if (playlistTracks.length === 0) return;
    playAll(playlistTracks);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
    }
  };

  return (
    <Container className="px-6 py-8 max-w-[1000px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Playlist Header Banner */}
      <Flex direction="col" align="center" gap={6} className="bg-white/[0.015] border border-white/5 p-6 sm:p-8 rounded-3xl select-none sm:flex-row">
        <Box className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 flex items-center justify-center text-5xl shadow-lg flex-shrink-0">
          {playlist.emoji}
        </Box>
        <Flex direction="col" className="flex-1 min-w-0 text-center sm:text-left">
          <Text variant="caption" weight="bold" color="muted" className="uppercase tracking-wider text-[10px] text-emerald-400">
            PLAYLIST
          </Text>
          <Heading level={2} size="xl" className="font-extrabold text-white truncate mt-1 mb-2">
            {playlist.name}
          </Heading>
          <Text variant="body-sm" color="muted" className="leading-relaxed line-clamp-2 max-w-[600px] mb-4 text-[13px]">
            {playlist.description || 'No description provided for this collection.'}
          </Text>
          <Text variant="caption" color="muted" className="text-xs">
            {playlistTracks.length} {playlistTracks.length === 1 ? 'track' : 'tracks'} • Curated by you
          </Text>
        </Flex>
      </Flex>

      {/* Playlist Toolbar */}
      <Flex justify="between" align="center" className="pb-2 border-b border-white/5">
        <Flex gap={3}>
          <Button
            variant="primary"
            disabled={playlistTracks.length === 0}
            onClick={handlePlayAll}
            leftIcon={<span>▶</span>}
            className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 font-semibold px-6 py-2.5 text-xs shadow-md shadow-emerald-500/10"
          >
            Play All
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="rounded-full border-red-500/20 text-red-400 bg-red-500/5 hover:bg-red-500/10 hover:border-red-500/30 font-semibold px-5 py-2.5 text-xs transition-colors duration-200"
          >
            Delete Playlist
          </Button>
        </Flex>
        <Button
          variant="ghost"
          onClick={() => setCurrentView('playlists')}
          className="text-gray-400 hover:text-white text-xs font-semibold px-4 py-2"
        >
          Back to Playlists
        </Button>
      </Flex>

      {/* Track List */}
      <Flex direction="col" gap={4}>
        {playlistTracks.length === 0 ? (
          <Box className="w-full text-center py-16 rounded-2xl bg-white/[0.01] border border-dashed border-white/5">
            <span className="text-4xl mb-4 block">🎵</span>
            <Heading level={3} size="sm" className="text-white font-semibold mb-1">
              This playlist is empty
            </Heading>
            <Text variant="body-sm" color="muted" className="mb-6">
              Find your favorite beats in Search and add them to this playlist!
            </Text>
            <Button
              variant="primary"
              onClick={() => setCurrentView('search')}
              className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 text-xs px-5 py-2"
            >
              Search Tracks
            </Button>
          </Box>
        ) : (
          <Flex direction="col" gap={2} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            {playlistTracks.map((track, idx) => (
              <TrackItem
                key={`playlist-track-${track.videoId}-${idx}`}
                track={track}
                index={idx}
                playlistId={playlist.id}
                contextQueue={playlistTracks}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Container>
  );
}
