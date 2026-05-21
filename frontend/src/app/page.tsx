'use client';

import DashboardShell from '@/components/DashboardShell';
import HomeView from '@/components/views/HomeView';
import SearchView from '@/components/views/SearchView';
import PlaylistsView from '@/components/views/PlaylistsView';
import PlaylistDetailView from '@/components/views/PlaylistDetailView';
import LikedSongsView from '@/components/views/LikedSongsView';
import HistoryView from '@/components/views/HistoryView';
import { usePlayback } from '@/context/PlaybackContext';

export default function Home() {
  const { currentView } = usePlayback();

  const renderActiveView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'search':
        return <SearchView />;
      case 'playlists':
        return <PlaylistsView />;
      case 'playlist-detail':
        return <PlaylistDetailView />;
      case 'liked-songs':
        return <LikedSongsView />;
      case 'history':
        return <HistoryView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <DashboardShell>
      {renderActiveView()}
    </DashboardShell>
  );
}
