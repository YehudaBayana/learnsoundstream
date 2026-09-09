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
import { useRouter } from 'next/navigation';

export default function PlaylistsView() {
  const { playlists } = usePlayback();
  const router = useRouter();

  // Create playlist modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [error, setError] = useState('');

  const handlePlayPlaylist = (e: React.MouseEvent, playlistId: string) => {
    e.stopPropagation();
    router.push(`/playlists/${playlistId}`);
  };

  return (
    <>hello world</>
  );
}
