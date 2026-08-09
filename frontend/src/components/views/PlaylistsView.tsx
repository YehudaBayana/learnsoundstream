'use client';

import React, { useState } from 'react';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Grid from '@/components/ui/layout/Grid';
import Container from '@/components/ui/layout/Container';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { usePlayback } from '@/context/PlaybackContext';

export default function PlaylistsView() {
  const { playlists ,setCurrentView} = usePlayback();

  // Create playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [error, setError] = useState('');

  const handlePlayPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation(); // Prevent navigating to detail page
    setCurrentView('playlist-detail', playlistId);
  };

  return (
    <Container className="px-6 py-8 max-w-[1200px] space-y-8 animate-[fadeIn_0.4s_ease_forwards]">
      {/* Page Header */}
      <Flex justify="between" align="center" className="border-b border-white/5 pb-4">
        <Flex direction="col" gap={1}>
          <Heading level={2} size="lg" className="font-bold text-white">
            Playlists
          </Heading>
          <Text variant="body-sm" color="muted">
            Your collection of curated tracks and custom mixes.
          </Text>
        </Flex>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500 font-semibold px-5 py-2 text-xs"
        >
          Create Playlist
        </Button>
      </Flex>

      {/* Grid of Playlists */}
      <Grid cols={3} colsMobile={1} colsTablet={2} gap={6}>
        {/* Create Card (Interactive placeholder card) */}
        <Box
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center h-60 rounded-2xl border border-dashed border-white/10 bg-white/[0.005] hover:bg-white/[0.02] hover:border-emerald-500/50 transition-all duration-300 text-center p-6 cursor-pointer group"
        >
          <Flex
            align="center"
            justify="center"
            className="w-14 h-14 rounded-full border border-dashed border-white/20 group-hover:border-emerald-500 group-hover:scale-105 transition-all duration-300 text-2xl text-gray-500 group-hover:text-emerald-400 mb-4 bg-black/20"
          >
            ＋
          </Flex>
          <Heading level={3} size="sm" className="text-white font-semibold mb-1 group-hover:text-emerald-400 transition-colors">
            Create Playlist
          </Heading>
          <Text variant="caption" color="muted" className="max-w-[180px]">
            Mix genres, moods, or create a deep-work compilation.
          </Text>
        </Box>

        {/* Existing Playlists Cards */}
        {playlists.map((pl) => (
          <Box
            key={pl.id}
            onClick={(e) => handlePlayPlaylist(e, pl.id)}
            className="flex flex-col justify-between h-60 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.015] to-white/[0.005] hover:bg-white/[0.035] hover:border-white/10 hover:shadow-xl transition-all duration-300 p-6 cursor-pointer relative group"
          >
            <Box>
              

              {/* Title & Description */}
              <Heading level={3} size="md" className="font-semibold text-white truncate mb-1 group-hover:text-emerald-400 transition-colors">
                {pl.title}
              </Heading>
             
            </Box>

            {/* Bottom info */}
            <Flex justify="between" align="center" className="pt-4 border-t border-white/5">
              
              <Text variant="caption" color="muted" className="font-mono text-[10px]">
                Curated
              </Text>
            </Flex>
          </Box>
        ))}
      </Grid>

      {/* Modal - Create Playlist */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          Create New Playlist
        </Modal.Header>
        <form onSubmit={(e) => {e.preventDefault();}}>
          <Modal.Body className="space-y-4">
            {error && (
              <Box className="p-3 bg-red-500/10 border border-red-500/25 rounded-xl">
                <Text variant="body-sm" color="danger">
                  {error}
                </Text>
              </Box>
            )}
            <Box className="space-y-1">
              <Text variant="body-sm" weight="semibold" className="text-gray-300">
                Playlist Name
              </Text>
              <Input
                placeholder="Chill Coding Beats"
                value={playlistName}
                onChange={(e) => {
                  setPlaylistName(e.target.value);
                  setError('');
                }}
                className="w-full text-white bg-slate-900 border-slate-700 focus:border-emerald-500"
                autoFocus
              />
            </Box>
            <Box className="space-y-1">
              <Text variant="body-sm" weight="semibold" className="text-gray-300">
                Description (Optional)
              </Text>
              <TextArea
                placeholder="A compilation of beats to code, write, and relax to..."
                value={playlistDesc}
                onChange={(e) => setPlaylistDesc(e.target.value)}
                className="w-full text-white bg-slate-900 border-slate-700 focus:border-emerald-500 h-20 resize-none"
              />
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                setPlaylistName('');
                setPlaylistDesc('');
                setError('');
              }}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="bg-emerald-500 text-white hover:bg-emerald-600 border-emerald-500"
            >
              Create Playlist
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  );
}
