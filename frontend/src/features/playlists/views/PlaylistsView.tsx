'use client';

import Box from '@/components/ui/layout/Box';

interface PlaylistsViewProps {
  dataHook?: string;
}

export default function PlaylistsView({ dataHook = 'playlists-view' }: PlaylistsViewProps) {
  return (
    <Box dataHook={dataHook}>
      hello world
    </Box>
  );
}
