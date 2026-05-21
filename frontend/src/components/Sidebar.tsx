'use client';

import React, { useState } from 'react';
import Text from '@/components/ui/Text';
import Heading from '@/components/ui/Heading';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { usePlayback, AppView } from '@/context/PlaybackContext';

export default function Sidebar() {
  const {
    currentView,
    selectedPlaylistId,
    playlists,
    setCurrentView,
    createPlaylist,
  } = usePlayback();

  // Create playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [error, setError] = useState('');

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim()) {
      setError('Playlist name is required');
      return;
    }
    createPlaylist(playlistName.trim(), playlistDesc.trim());
    setPlaylistName('');
    setPlaylistDesc('');
    setError('');
    setIsModalOpen(false);
  };

  const navItems = [
    { view: 'home' as AppView, label: 'Home', icon: '🏠' },
    { view: 'search' as AppView, label: 'Search', icon: '🔍' },
    { view: 'playlists' as AppView, label: 'Playlists', icon: '💿' },
    { view: 'liked-songs' as AppView, label: 'Liked Songs', icon: '❤️' },
    { view: 'history' as AppView, label: 'History', icon: '🕰️' },
  ];

  return (
    <Flex
      direction="col"
      className="w-64 h-full bg-black/40 border-r border-white/5 backdrop-blur-2xl flex-shrink-0 relative overflow-hidden select-none"
    >
      {/* Brand Header */}
      <Flex align="center" gap={3} className="p-6 border-b border-white/5">
        <Flex
          align="center"
          justify="center"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] text-lg text-white"
        >
          <span>🎵</span>
        </Flex>
        <Flex direction="col">
          <Heading level={1} size="md" className="font-extrabold tracking-wide text-white">
            SOUNDSTREAM
          </Heading>
          <Text variant="caption" className="text-[10px] tracking-wider text-emerald-400 font-semibold -mt-0.5">
            HI-FI STREAMING
          </Text>
        </Flex>
      </Flex>

      {/* Navigation */}
      <Flex direction="col" gap={1} className="px-3 py-4 border-b border-white/5">
        {navItems.map((item) => {
          const isActive = currentView === item.view && selectedPlaylistId === null;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white/[0.04] text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              )}
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </Flex>

      {/* Playlists section */}
      <Flex direction="col" className="flex-1 min-h-0 py-4 px-3">
        <Flex align="center" justify="between" className="px-4 mb-2">
          <Text variant="caption" weight="bold" color="muted" className="tracking-wider uppercase text-[10px]">
            My Playlists
          </Text>
          <IconButton
            size="xs"
            variant="ghost"
            onClick={() => setIsModalOpen(true)}
            aria-label="Create playlist"
            className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
            icon={<span>＋</span>}
          />
        </Flex>

        {/* Playlists List */}
        <Box className="flex-1 overflow-y-auto pr-1 space-y-1">
          {playlists.length === 0 ? (
            <Box className="px-4 py-3 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/5">
              <Text variant="caption" color="muted" className="text-[11px]">
                Create a playlist to start collecting.
              </Text>
            </Box>
          ) : (
            playlists.map((pl) => {
              const isActive = currentView === 'playlist-detail' && selectedPlaylistId === pl.id;
              return (
                <button
                  key={pl.id}
                  onClick={() => setCurrentView('playlist-detail', pl.id)}
                  className={`relative w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white/[0.04] text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <Flex align="center" gap={3} className="min-w-0">
                    <span className="text-base flex-shrink-0">{pl.emoji}</span>
                    <span className="truncate">{pl.name}</span>
                  </Flex>
                  <Text variant="caption" color="muted" className="text-[10px] font-mono flex-shrink-0 ml-2 bg-white/5 px-1.5 py-0.5 rounded-md">
                    {pl.trackIds.length}
                  </Text>
                </button>
              );
            })
          )}
        </Box>
      </Flex>

      {/* Bottom Profile/Watermark */}
      <Box className="p-4 border-t border-white/5 bg-black/10 select-none">
        <Flex align="center" gap={3}>
          <Flex
            align="center"
            justify="center"
            className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 font-bold text-xs text-white"
          >
            YB
          </Flex>
          <Flex direction="col" className="min-w-0 flex-1">
            <Text variant="body-sm" weight="semibold" truncate className="text-white text-xs">
              Yehuda Bayana
            </Text>
            <Text variant="caption" color="muted" className="text-[10px]">
              Developer Mode
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Create Playlist Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          Create New Playlist
        </Modal.Header>
        <form onSubmit={handleCreatePlaylist}>
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
                placeholder="My Coding Jams"
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
                placeholder="Give your playlist a cool description..."
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
    </Flex>
  );
}
