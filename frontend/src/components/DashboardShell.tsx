'use client';

import React, { useState } from 'react';
import Flex from '@/components/ui/layout/Flex';
import Box from '@/components/ui/layout/Box';
import IconButton from '@/components/ui/IconButton';
import Text from '@/components/ui/Text';
import Sidebar from '@/components/Sidebar';
import { usePlayback } from '@/context/PlaybackContext';

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { currentView, selectedPlaylistId, playlists } = usePlayback();

  // Helper to resolve title in the top bar
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'home':
        return 'Home';
      case 'search':
        return 'Search Tracks';
      case 'playlists':
        return 'Playlists';
      case 'liked-songs':
        return 'Liked Songs';
      case 'history':
        return 'Recently Played';
      case 'playlist-detail':
        const playlist = playlists.find((p) => p.id === selectedPlaylistId);
        return playlist ? playlist.name : 'Playlist Details';
      default:
        return 'Soundstream';
    }
  };

  return (
    <Flex className="w-screen h-screen bg-[#050505] text-white overflow-hidden relative">
      {/* Mobile Drawer Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <Box
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Positioned fixed on mobile, static on desktop */}
      <Box
        className={`fixed md:static inset-y-0 left-0 z-50 transform md:transform-none transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Flex direction="col" className="flex-1 min-w-0 h-full relative">
        {/* Top Header Navigation */}
        <Flex
          align="center"
          justify="between"
          className="w-full h-16 px-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-30 flex-shrink-0"
        >
          {/* Left: Mobile Toggle & View Title */}
          <Flex align="center" gap={3}>
            <IconButton
              size="sm"
              variant="ghost"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open menu"
              className="md:hidden text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              icon={<span>☰</span>}
            />
            <Text variant="body" weight="bold" className="text-white text-base font-semibold md:text-lg select-none">
              {getHeaderTitle()}
            </Text>
          </Flex>

          {/* Right: Server indicator badge */}
          <Flex align="center" gap={2} className="select-none bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
            <Text variant="small" weight="medium" color="default" className="text-[11px] text-gray-300">
              Live Connection
            </Text>
          </Flex>
        </Flex>

        {/* Dynamic Scrollable Content Pane */}
        <Box className="flex-1 overflow-y-auto pb-32">
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
