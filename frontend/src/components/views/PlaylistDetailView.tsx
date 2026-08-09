import React, { useEffect, useState } from 'react'
import { usePlayback } from '@/context/PlaybackContext'
import Container from '@/components/ui/layout/Container'
import Flex from '@/components/ui/layout/Flex'
import Box from '@/components/ui/layout/Box'
import Heading from '@/components/ui/Heading'
import Text from '@/components/ui/Text'
import Image from '@/components/ui/Image'
import Badge from '@/components/ui/Badge'
import Spinner from '@/components/ui/Spinner'
import TrackItem from '@/components/TrackItem'
import { apiUrl } from '@/constants'
import { PlaylistTrack, PlaylistTracksApiResponse, Track } from '@/types'

const PlaylistDetailView = () => {
  const { playlists, selectedPlaylistId } = usePlayback()
  const [tracks, setTracks] = useState<PlaylistTrack[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const playlist = playlists.find(p => p.id === selectedPlaylistId)

  useEffect(() => {
    if (!playlist) return

    const getPlaylistTracks = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiUrl}/api/playlist-tracks?playlist_id=${playlist.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch playlist tracks')
        }
        const data: PlaylistTracksApiResponse = await response.json()
        setTracks(data.tracks || [])
      } catch (err: any) {
        setError(err.message || 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    getPlaylistTracks()
  }, [playlist])

  if (!playlist) return null

  // Map PlaylistTrack to Track format for TrackItem component playback compatibility
  const mappedContextQueue: Track[] = tracks.map(t => ({
    videoId: t.id,
    title: t.title,
    desc: t.channel || playlist.uploader || 'Track',
    duration: t.duration,
    emoji: '🎵',
    category: 'Playlist Track',
  }))

  const headerImage = playlist.thumbnails && playlist.thumbnails.length > 0
    ? playlist.thumbnails[playlist.thumbnails.length - 1].url
    : playlist.thumbnail || ''

  return (
    <Container className="space-y-6">
      {/* Playlist Header */}
      <Flex align="center" gap={6} className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-default)]">
        {headerImage && (
          <Box className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden shadow-lg border border-[var(--border-default)]">
            <Image src={headerImage} alt={playlist.title} className="w-full h-full object-cover" />
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
          <Text variant="caption" color="muted">
            {playlist.playlist_count ? `${playlist.playlist_count} tracks` : `${tracks.length} tracks`}
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
          <Flex direction="col" align="center" justify="center" className="py-16 text-center">
            <Text variant="h3" color="danger">Failed to load tracks</Text>
            <Text variant="body" color="muted" className="mt-2">{error}</Text>
          </Flex>
        ) : tracks.length === 0 ? (
          <Flex direction="col" align="center" justify="center" className="py-16 text-center">
            <Text variant="h3">No tracks found</Text>
            <Text variant="body" color="muted" className="mt-2">This playlist has no available tracks.</Text>
          </Flex>
        ) : (
          <Flex direction="col" gap={2}>
            {tracks.map((track, index) => {
              const mappedTrack: Track = {
                videoId: track.id,
                title: track.title,
                desc: track.channel || playlist.uploader || 'Track',
                duration: track.duration,
                emoji: '🎵',
                category: 'Playlist Track',
              }

              return (
                <TrackItem
                  key={track.id}
                  track={mappedTrack}
                  index={index}
                  playlistId={playlist.id}
                  contextQueue={mappedContextQueue}
                />
              )
            })}
          </Flex>
        )}
      </Box>
    </Container>
  )
}

export default PlaylistDetailView